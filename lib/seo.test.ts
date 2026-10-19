import { describe, expect, it } from "vitest";
import { PAIRS } from "./clamp";
import { LOCALES, dictionaries } from "./i18n";
import { pairContent } from "./pairContent";
import { ALL_PATHS, PAGE_PATHS, hreflangMap, localizedPath, splitLocale } from "./routes";
import { buildMetadata, faqPageLd, webApplicationLd } from "./seo";
import { buildSitemap } from "./sitemap";
import { SITE_URL } from "./site";

describe("routes", () => {
  it("lists 16 pages: 5 tools, 9 presets, about and privacy", () => {
    expect(ALL_PATHS).toHaveLength(16);
    expect(new Set(ALL_PATHS).size).toBe(16);
  });

  it("serves English at the root and other locales under a prefix", () => {
    expect(localizedPath("en", "/")).toBe("/");
    expect(localizedPath("en", "/about/")).toBe("/about/");
    expect(localizedPath("ja", "/")).toBe("/ja/");
    expect(localizedPath("de", "/clamp/16-24/")).toBe("/de/clamp/16-24/");
  });

  it("splits a pathname into locale and path", () => {
    expect(splitLocale("/")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/zh")).toEqual({ locale: "zh", path: "/" });
    expect(splitLocale("/fr/fluid-spacing/")).toEqual({ locale: "fr", path: "/fluid-spacing/" });
    expect(splitLocale("/clamp/16-24")).toEqual({ locale: "en", path: "/clamp/16-24/" });
  });
});

describe("metadata", () => {
  it("hreflang map for a sample page has 7 locales + x-default", () => {
    const map = hreflangMap(PAGE_PATHS.typeScale);
    expect(Object.keys(map).sort()).toEqual([...LOCALES, "x-default"].sort());
    expect(map["x-default"]).toBe(`${SITE_URL}/type-scale-generator/`);
    expect(map.pt).toBe(`${SITE_URL}/pt/type-scale-generator/`);
  });

  it("buildMetadata sets a self canonical and all alternates", () => {
    const meta = buildMetadata({ locale: "es", path: "/fluid-spacing/", title: "T", description: "D" });
    expect(meta.alternates?.canonical).toBe(`${SITE_URL}/es/fluid-spacing/`);
    const languages = meta.alternates?.languages as Record<string, string>;
    expect(Object.keys(languages)).toHaveLength(8);
    expect(languages["x-default"]).toBe(`${SITE_URL}/fluid-spacing/`);
    expect(meta.openGraph?.url).toBe(`${SITE_URL}/es/fluid-spacing/`);
  });

  const staticPages = ["home", "fluidTypography", "typeScale", "fluidSpacing", "tailwind", "about", "privacy"] as const;

  it.each(LOCALES.map((l) => [l]))("%s titles < 60 chars and descriptions < 155 chars, all unique", (locale) => {
    const d = dictionaries[locale];
    const entries = [
      ...staticPages.map((k) => ({ id: k, title: d.pages[k].title, description: d.pages[k].description })),
      ...PAIRS.map((p) => ({ id: p, ...pairContent(p, locale) })),
    ];
    for (const e of entries) {
      expect(e.title.length, `${e.id} title: ${e.title}`).toBeLessThan(60);
      expect(e.description.length, `${e.id} description: ${e.description}`).toBeLessThan(155);
    }
    expect(new Set(entries.map((e) => e.title)).size).toBe(entries.length);
    expect(new Set(entries.map((e) => e.description)).size).toBe(entries.length);
  });

  it.each(LOCALES.map((l) => [l]))("%s pages have 4–6 FAQs", (locale) => {
    const d = dictionaries[locale];
    for (const k of staticPages) {
      expect(d.pages[k].faq.length).toBeGreaterThanOrEqual(4);
      expect(d.pages[k].faq.length).toBeLessThanOrEqual(6);
    }
    expect(d.pair.faq.length).toBeGreaterThanOrEqual(4);
  });

  it("English explanatory content is 300–700 words per page", () => {
    const words = (s: string) => s.split(/\s+/).filter(Boolean).length;
    const count = (c: { lead: string; sections: { h2: string; p: string[] }[]; faq: { q: string; a: string }[] }) =>
      words([c.lead, ...c.sections.flatMap((s) => [s.h2, ...s.p]), ...c.faq.flatMap((f) => [f.q, f.a])].join(" "));
    for (const k of staticPages) {
      const n = count(dictionaries.en.pages[k]);
      expect(n, k).toBeGreaterThanOrEqual(300);
      expect(n, k).toBeLessThanOrEqual(700);
    }
    for (const p of PAIRS) {
      const n = count(pairContent(p, "en"));
      expect(n, p).toBeGreaterThanOrEqual(300);
      expect(n, p).toBeLessThanOrEqual(700);
    }
  });

  it("builds localized JSON-LD", () => {
    const app = webApplicationLd("ja", "/", "x", "y");
    expect(app["@type"]).toBe("WebApplication");
    expect(app.inLanguage).toBe("ja");
    expect((app.offers as { price: string }).price).toBe("0");
    const faq = faqPageLd("de", dictionaries.de.pages.home.faq);
    expect(faq["@type"]).toBe("FAQPage");
    expect((faq.mainEntity as unknown[]).length).toBe(dictionaries.de.pages.home.faq.length);
  });
});

describe("sitemap", () => {
  const sitemap = buildSitemap(new Date("2026-01-01"));

  it("contains every page × 7 locales", () => {
    expect(sitemap).toHaveLength(ALL_PATHS.length * 7);
    const urls = new Set(sitemap.map((e) => e.url));
    for (const path of ALL_PATHS) {
      for (const locale of LOCALES) expect(urls.has(`${SITE_URL}${localizedPath(locale, path)}`)).toBe(true);
    }
  });

  it("uses absolute https URLs everywhere", () => {
    for (const entry of sitemap) {
      expect(entry.url).toMatch(/^https:\/\//);
      for (const alt of Object.values(entry.alternates?.languages ?? {})) expect(alt).toMatch(/^https:\/\//);
    }
  });

  it("gives every entry hreflang alternates for all locales + x-default", () => {
    for (const entry of sitemap) {
      expect(Object.keys(entry.alternates?.languages ?? {}).sort()).toEqual([...LOCALES, "x-default"].sort());
    }
  });
});
