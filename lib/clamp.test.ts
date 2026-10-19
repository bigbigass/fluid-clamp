import { describe, expect, it } from "vitest";
import {
  BREAKPOINTS,
  ClampError,
  PAIRS,
  computeClamp,
  exceedsWcagRatio,
  formatNumber,
  fromPx,
  parsePair,
  round,
  sizeAt,
  toCustomProperty,
  toPx,
  toTailwind,
  typeScale,
  typeScaleCss,
} from "./clamp";

const base = { minSize: 16, maxSize: 24, minVw: 320, maxVw: 1280 };

describe("computeClamp", () => {
  it("produces the expected clamp() for 16→24px over 320→1280px", () => {
    expect(computeClamp(base).css).toBe("clamp(1rem, 0.8333rem + 0.8333vw, 1.5rem)");
  });

  it("computes slope and intercept", () => {
    const r = computeClamp(base);
    expect(r.slope).toBeCloseTo(8 / 960, 10);
    expect(r.slopeVw).toBeCloseTo(0.8333, 4);
    expect(r.interceptPx).toBeCloseTo(13.3333, 4);
  });

  it("sizeAt equals min at minVw", () => {
    const r = computeClamp(base);
    expect(sizeAt(r, 320)).toBeCloseTo(16, 10);
  });

  it("sizeAt equals max at maxVw", () => {
    const r = computeClamp(base);
    expect(sizeAt(r, 1280)).toBeCloseTo(24, 10);
  });

  it("sizeAt clamps below minVw and above maxVw", () => {
    const r = computeClamp(base);
    expect(sizeAt(r, 100)).toBe(16);
    expect(sizeAt(r, 2560)).toBe(24);
  });

  it("sizeAt is linear in between", () => {
    const r = computeClamp(base);
    expect(sizeAt(r, 800)).toBeCloseTo(20, 10);
  });

  it.each(PAIRS.map((p) => [p]))("sizeAt hits both endpoints for preset %s", (pair) => {
    const { min, max } = parsePair(pair)!;
    const r = computeClamp({ minSize: min, maxSize: max, minVw: 375, maxVw: 1440 });
    expect(sizeAt(r, 375)).toBeCloseTo(min, 9);
    expect(sizeAt(r, 1440)).toBeCloseTo(max, 9);
  });

  it("accepts rem input and converts with root font size", () => {
    const r = computeClamp({ ...base, minSize: 1, maxSize: 1.5, inputUnit: "rem" });
    expect(r.minPx).toBe(16);
    expect(r.maxPx).toBe(24);
    expect(r.css).toBe(computeClamp(base).css);
  });

  it("respects a custom root font size", () => {
    const r = computeClamp({ ...base, rootFontSize: 10 });
    expect(r.min).toBe(1.6);
    expect(r.max).toBe(2.4);
  });

  it("outputs px when requested", () => {
    expect(computeClamp({ ...base, outputUnit: "px" }).css).toBe("clamp(16px, 13.3333px + 0.8333vw, 24px)");
  });

  it("applies decimal precision", () => {
    expect(computeClamp({ ...base, precision: 2 }).css).toBe("clamp(1rem, 0.83rem + 0.83vw, 1.5rem)");
    expect(computeClamp({ ...base, precision: 0 }).css).toBe("clamp(1rem, 1rem + 1vw, 2rem)");
  });

  it("writes a negative intercept as a subtraction", () => {
    const r = computeClamp({ minSize: 20, maxSize: 96, minVw: 400, maxVw: 1200 });
    expect(r.interceptPx).toBeLessThan(0);
    expect(r.css).toBe("clamp(1.25rem, 9.5vw - 1.125rem, 6rem)");
    expect(computeClamp({ minSize: 16, maxSize: 64, minVw: 320, maxVw: 1280 }).css).toBe("clamp(1rem, 0rem + 5vw, 4rem)");
  });

  it("allows equal min and max (zero slope)", () => {
    const r = computeClamp({ ...base, maxSize: 16 });
    expect(r.slope).toBe(0);
    expect(sizeAt(r, 900)).toBe(16);
  });

  it("throws on inverted viewport range", () => {
    expect(() => computeClamp({ ...base, minVw: 1280, maxVw: 320 })).toThrow(ClampError);
    expect(() => computeClamp({ ...base, minVw: 800, maxVw: 800 })).toThrow(/viewport/i);
  });

  it("throws on inverted sizes", () => {
    try {
      computeClamp({ ...base, minSize: 30, maxSize: 20 });
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ClampError);
      expect((e as ClampError).code).toBe("size-order");
    }
  });

  it("throws on non-positive and non-finite input", () => {
    expect(() => computeClamp({ ...base, minSize: 0 })).toThrow(ClampError);
    expect(() => computeClamp({ ...base, maxSize: NaN })).toThrow(ClampError);
    expect(() => computeClamp({ ...base, rootFontSize: 0 })).toThrow(ClampError);
  });
});

describe("helpers", () => {
  it("round avoids -0 and float noise", () => {
    expect(round(-0.00001, 2)).toBe(0);
    expect(Object.is(round(-0.00001, 2), -0)).toBe(false);
    expect(round(1.005, 2)).toBe(1.01);
    expect(round(0.1 + 0.2, 4)).toBe(0.3);
  });

  it("formatNumber strips trailing zeros", () => {
    expect(formatNumber(1.5, 4)).toBe("1.5");
    expect(formatNumber(2, 4)).toBe("2");
  });

  it("converts px ↔ rem", () => {
    expect(toPx(1.25, "rem")).toBe(20);
    expect(fromPx(20, "rem")).toBe(1.25);
    expect(fromPx(20, "px")).toBe(20);
    expect(toPx(2, "rem", 10)).toBe(20);
  });

  it("flags ratios above 2.5 for WCAG 1.4.4", () => {
    expect(exceedsWcagRatio(computeClamp({ ...base, maxSize: 40 }))).toBe(false);
    expect(exceedsWcagRatio(computeClamp({ ...base, maxSize: 41 }))).toBe(true);
  });

  it("builds a custom property and a Tailwind arbitrary value", () => {
    const css = computeClamp(base).css;
    expect(toCustomProperty(css)).toBe(`--fluid-size: ${css};`);
    expect(toTailwind(css)).toBe("text-[clamp(1rem,0.8333rem_+_0.8333vw,1.5rem)]");
    expect(toTailwind(css, "p")).toMatch(/^p-\[clamp\(/);
    expect(toTailwind(css)).not.toMatch(/\s/);
  });

  it("parsePair accepts valid pairs and rejects bad ones", () => {
    expect(parsePair("16-24")).toEqual({ min: 16, max: 24 });
    expect(parsePair("24-16")).toBeNull();
    expect(parsePair("abc")).toBeNull();
    expect(parsePair("0-10")).toBeNull();
  });

  it("has the standard preview breakpoints", () => {
    expect([...BREAKPOINTS]).toEqual([320, 375, 768, 1024, 1280, 1440, 1920]);
  });
});

describe("typeScale", () => {
  const scale = typeScale({ baseMin: 16, baseMax: 20, ratioMin: 1.2, ratioMax: 1.25, minVw: 320, maxVw: 1280 });

  it("generates steps -2..6 by default", () => {
    expect(scale.map((s) => s.step)).toEqual([-2, -1, 0, 1, 2, 3, 4, 5, 6]);
    expect(scale[0].name).toBe("--step--2");
    expect(scale[2].name).toBe("--step-0");
  });

  it("step 0 equals the base sizes", () => {
    const s0 = scale.find((s) => s.step === 0)!;
    expect(s0.clamp.minPx).toBe(16);
    expect(s0.clamp.maxPx).toBe(20);
  });

  it("applies the ratio per step", () => {
    const s2 = scale.find((s) => s.step === 2)!;
    expect(s2.clamp.minPx).toBeCloseTo(16 * 1.2 ** 2, 10);
    expect(s2.clamp.maxPx).toBeCloseTo(20 * 1.25 ** 2, 10);
  });

  it("is monotonically increasing at both ends", () => {
    for (let i = 1; i < scale.length; i++) {
      expect(scale[i].clamp.minPx).toBeGreaterThan(scale[i - 1].clamp.minPx);
      expect(scale[i].clamp.maxPx).toBeGreaterThan(scale[i - 1].clamp.maxPx);
    }
  });

  it("exports CSS variables", () => {
    const css = typeScaleCss(scale);
    expect(css.startsWith(":root {")).toBe(true);
    expect(css).toContain("  --step-0: clamp(1rem,");
    expect(css.trim().endsWith("}")).toBe(true);
    expect(css.split("\n")).toHaveLength(scale.length + 2);
  });

  it("rejects an inverted step range", () => {
    expect(() =>
      typeScale({ baseMin: 16, baseMax: 20, ratioMin: 1.2, ratioMax: 1.25, minVw: 320, maxVw: 1280, stepMin: 3, stepMax: 1 }),
    ).toThrow(ClampError);
  });
});
