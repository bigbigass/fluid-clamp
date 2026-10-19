import { computeClamp, parsePair, sizeAt, toTailwind, type Pair } from "./clamp";
import { formatNumber, getDictionary, interpolate, type Dictionary, type Locale } from "./i18n";
import { DEFAULT_MAX_VW, DEFAULT_MIN_VW } from "./site";

type Section = Dictionary["pages"]["home"]["sections"][number];
type Faq = Dictionary["pages"]["home"]["faq"][number];

export interface PairContent {
  min: number;
  max: number;
  title: string;
  description: string;
  h1: string;
  lead: string;
  sections: Section[];
  faq: Faq[];
}

/** Template variables for a preset landing page, formatted for the locale. */
export function pairVars(pair: Pair, locale: Locale): Record<string, string> {
  const { min, max } = parsePair(pair)!;
  const r = computeClamp({ minSize: min, maxSize: max, minVw: DEFAULT_MIN_VW, maxVw: DEFAULT_MAX_VW });
  const n = (v: number, digits = 2) => formatNumber(locale, v, digits);
  return {
    min: n(min),
    max: n(max),
    minRem: n(min / 16, 4),
    maxRem: n(max / 16, 4),
    minVw: n(DEFAULT_MIN_VW),
    maxVw: n(DEFAULT_MAX_VW),
    css: r.css,
    tailwind: toTailwind(r.css),
    per100: n(r.slope * 100),
    slope: n(r.slope, 4),
    slopeVw: n(r.slopeVw, 4),
    interceptPx: n(r.interceptPx),
    interceptRem: n(r.interceptPx / 16, 4),
    ratio: n(r.ratio),
    at375: n(sizeAt(r, 375), 1),
    at768: n(sizeAt(r, 768), 1),
    at1024: n(sizeAt(r, 1024), 1),
    useCase: getDictionary(locale).pair.useCases[pair],
  };
}

export function pairContent(pair: Pair, locale: Locale): PairContent {
  const d = getDictionary(locale).pair;
  const vars = pairVars(pair, locale);
  const t = (s: string) => interpolate(s, vars);
  const { min, max } = parsePair(pair)!;
  return {
    min,
    max,
    title: t(d.title),
    description: t(d.description),
    h1: t(d.h1),
    lead: t(d.lead),
    sections: d.sections.map((s) => ({ h2: t(s.h2), p: s.p.map(t) })),
    faq: d.faq.map((f) => ({ q: t(f.q), a: t(f.a) })),
  };
}
