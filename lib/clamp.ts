/**
 * Pure math for CSS clamp() fluid values.
 *
 * A fluid value grows linearly from `minSize` at `minVw` to `maxSize` at `maxVw`
 * and is clamped outside that range:
 *   size(vw) = intercept + slope * vw,   slope = (max - min) / (maxVw - minVw)
 * Expressed in CSS: clamp(min, intercept + (slope * 100)vw, max).
 */

export type SizeUnit = "px" | "rem";

export interface ClampInput {
  /** Size at the minimum viewport, in `inputUnit`. */
  minSize: number;
  /** Size at the maximum viewport, in `inputUnit`. */
  maxSize: number;
  /** Minimum viewport width in px. */
  minVw: number;
  /** Maximum viewport width in px. */
  maxVw: number;
  /** Root font size in px used for rem conversion (default 16). */
  rootFontSize?: number;
  /** Unit of minSize / maxSize (default px). */
  inputUnit?: SizeUnit;
  /** Unit of the generated CSS (default rem). */
  outputUnit?: SizeUnit;
  /** Decimal places in the generated CSS (default 4). */
  precision?: number;
}

export interface ClampResult {
  minPx: number;
  maxPx: number;
  minVw: number;
  maxVw: number;
  rootFontSize: number;
  outputUnit: SizeUnit;
  precision: number;
  /** px of size gained per px of viewport width. */
  slope: number;
  /** The slope expressed in vw units (slope * 100). */
  slopeVw: number;
  /** Size in px at a hypothetical 0px viewport. */
  interceptPx: number;
  /** Intercept in the output unit, rounded. */
  intercept: number;
  /** Min / max in the output unit, rounded. */
  min: number;
  max: number;
  /** max / min ratio, used for the WCAG 1.4.4 zoom warning. */
  ratio: number;
  /** The `clamp(...)` expression. */
  css: string;
}

export class ClampError extends Error {
  constructor(
    public code: "invalid-number" | "non-positive" | "viewport-order" | "size-order" | "root-font",
    message: string,
  ) {
    super(message);
    this.name = "ClampError";
  }
}

/** Ratio above which zooming text to 200% may be impaired (WCAG SC 1.4.4). */
export const WCAG_MAX_RATIO = 2.5;

export const DEFAULT_ROOT = 16;
export const DEFAULT_PRECISION = 4;
export const BREAKPOINTS = [320, 375, 768, 1024, 1280, 1440, 1920] as const;

/** Round to `precision` decimals, never returning -0. */
export function round(value: number, precision = DEFAULT_PRECISION): number {
  const p = Math.max(0, Math.min(10, Math.floor(precision)));
  const factor = 10 ** p;
  const r = Math.round((value + Number.EPSILON * Math.sign(value)) * factor) / factor;
  return Object.is(r, -0) ? 0 : r;
}

export function toPx(value: number, unit: SizeUnit, rootFontSize = DEFAULT_ROOT): number {
  return unit === "rem" ? value * rootFontSize : value;
}

export function fromPx(px: number, unit: SizeUnit, rootFontSize = DEFAULT_ROOT): number {
  return unit === "rem" ? px / rootFontSize : px;
}

/** Format a number for CSS: rounded, no trailing zeros, no exponent. */
export function formatNumber(value: number, precision = DEFAULT_PRECISION): string {
  return String(round(value, precision));
}

export function computeClamp(input: ClampInput): ClampResult {
  const rootFontSize = input.rootFontSize ?? DEFAULT_ROOT;
  const inputUnit = input.inputUnit ?? "px";
  const outputUnit = input.outputUnit ?? "rem";
  const precision = input.precision ?? DEFAULT_PRECISION;
  const { minSize, maxSize, minVw, maxVw } = input;

  for (const v of [minSize, maxSize, minVw, maxVw, rootFontSize, precision]) {
    if (typeof v !== "number" || !Number.isFinite(v)) {
      throw new ClampError("invalid-number", "All inputs must be finite numbers.");
    }
  }
  if (rootFontSize <= 0) throw new ClampError("root-font", "Root font size must be greater than 0.");
  if (minSize <= 0 || maxSize <= 0 || minVw <= 0 || maxVw <= 0) {
    throw new ClampError("non-positive", "Sizes and viewport widths must be greater than 0.");
  }
  if (minVw >= maxVw) {
    throw new ClampError("viewport-order", "Minimum viewport must be smaller than maximum viewport.");
  }
  if (minSize > maxSize) {
    throw new ClampError("size-order", "Minimum size must not be larger than maximum size.");
  }

  const minPx = toPx(minSize, inputUnit, rootFontSize);
  const maxPx = toPx(maxSize, inputUnit, rootFontSize);
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const interceptPx = minPx - slope * minVw;
  const slopeVw = slope * 100;

  const min = round(fromPx(minPx, outputUnit, rootFontSize), precision);
  const max = round(fromPx(maxPx, outputUnit, rootFontSize), precision);
  const intercept = round(fromPx(interceptPx, outputUnit, rootFontSize), precision);
  const vw = round(slopeVw, precision);

  const preferred =
    intercept >= 0
      ? `${intercept}${outputUnit} + ${vw}vw`
      : `${vw}vw - ${Math.abs(intercept)}${outputUnit}`;
  const css = `clamp(${min}${outputUnit}, ${preferred}, ${max}${outputUnit})`;

  return {
    minPx,
    maxPx,
    minVw,
    maxVw,
    rootFontSize,
    outputUnit,
    precision,
    slope,
    slopeVw,
    interceptPx,
    intercept,
    min,
    max,
    ratio: maxPx / minPx,
    css,
  };
}

/** Rendered size in px of a computed clamp at viewport width `vw` (unrounded). */
export function sizeAt(result: Pick<ClampResult, "minPx" | "maxPx" | "slope" | "interceptPx">, vw: number): number {
  const preferred = result.interceptPx + result.slope * vw;
  return Math.min(result.maxPx, Math.max(result.minPx, preferred));
}

export function exceedsWcagRatio(result: Pick<ClampResult, "ratio">): boolean {
  return result.ratio > WCAG_MAX_RATIO;
}

/** CSS custom property declaration, e.g. `--fluid-size: clamp(...);` */
export function toCustomProperty(css: string, name = "--fluid-size"): string {
  return `${name}: ${css};`;
}

/** Tailwind arbitrary value: spaces become underscores so the class stays one token. */
export function toTailwind(css: string, prefix = "text"): string {
  return `${prefix}-[${css.replace(/,\s*/g, ",").replace(/\s+/g, "_")}]`;
}

export interface TypeScaleInput {
  /** Base (step 0) size at min / max viewport, in px. */
  baseMin: number;
  baseMax: number;
  /** Scale ratio at min / max viewport (e.g. 1.2 → 1.25). */
  ratioMin: number;
  ratioMax: number;
  minVw: number;
  maxVw: number;
  /** Lowest and highest step, inclusive (default -2..6). */
  stepMin?: number;
  stepMax?: number;
  rootFontSize?: number;
  outputUnit?: SizeUnit;
  precision?: number;
}

export interface TypeScaleStep {
  step: number;
  /** CSS variable name, e.g. `--step-0`, `--step--1`. */
  name: string;
  clamp: ClampResult;
}

export const SCALE_RATIOS = [
  { value: 1.125, label: "Major Second" },
  { value: 1.2, label: "Minor Third" },
  { value: 1.25, label: "Major Third" },
  { value: 1.333, label: "Perfect Fourth" },
  { value: 1.414, label: "Augmented Fourth" },
  { value: 1.5, label: "Perfect Fifth" },
  { value: 1.618, label: "Golden Ratio" },
] as const;

export function typeScale(input: TypeScaleInput): TypeScaleStep[] {
  const stepMin = input.stepMin ?? -2;
  const stepMax = input.stepMax ?? 6;
  if (!Number.isInteger(stepMin) || !Number.isInteger(stepMax) || stepMin > stepMax) {
    throw new ClampError("size-order", "Step range must be integers with stepMin ≤ stepMax.");
  }
  if (!(input.ratioMin > 0) || !(input.ratioMax > 0)) {
    throw new ClampError("non-positive", "Scale ratios must be greater than 0.");
  }
  const steps: TypeScaleStep[] = [];
  for (let step = stepMin; step <= stepMax; step++) {
    let a = input.baseMin * input.ratioMin ** step;
    let b = input.baseMax * input.ratioMax ** step;
    // Negative steps with a larger max ratio can shrink faster than they grow; keep min ≤ max.
    if (a > b) [a, b] = [b, a];
    steps.push({
      step,
      name: `--step-${step}`,
      clamp: computeClamp({
        minSize: a,
        maxSize: b,
        minVw: input.minVw,
        maxVw: input.maxVw,
        rootFontSize: input.rootFontSize,
        inputUnit: "px",
        outputUnit: input.outputUnit,
        precision: input.precision,
      }),
    });
  }
  return steps;
}

export function typeScaleCss(steps: TypeScaleStep[]): string {
  return [":root {", ...steps.map((s) => `  ${s.name}: ${s.clamp.css};`), "}"].join("\n");
}

/** Common min-max px pairs used for programmatic landing pages. */
export const PAIRS = ["14-16", "16-20", "16-24", "18-24", "20-32", "24-48", "32-64", "40-80", "48-96"] as const;
export type Pair = (typeof PAIRS)[number];

export function parsePair(pair: string): { min: number; max: number } | null {
  const m = /^(\d{1,3})-(\d{1,3})$/.exec(pair);
  if (!m) return null;
  const min = Number(m[1]);
  const max = Number(m[2]);
  return min > 0 && min < max ? { min, max } : null;
}
