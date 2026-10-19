import { PAIRS, type Pair } from "./clamp";
import { DEFAULT_LOCALE, LOCALES, isLocale, type Locale } from "./i18n/config";
import { SITE_URL } from "./site";

export const PAGE_PATHS = {
  home: "/",
  fluidTypography: "/fluid-typography/",
  typeScale: "/type-scale-generator/",
  fluidSpacing: "/fluid-spacing/",
  tailwind: "/tailwind-clamp/",
  about: "/about/",
  privacy: "/privacy/",
} as const;

export type PageKey = keyof typeof PAGE_PATHS;
export type ToolPageKey = Exclude<PageKey, "about" | "privacy">;

export function pairPath(pair: Pair): string {
  return `/clamp/${pair}/`;
}

/** Every unlocalized page path on the site. */
export const ALL_PATHS: string[] = [...Object.values(PAGE_PATHS), ...PAIRS.map(pairPath)];

/** `/about/` → `/about/` for en, `/de/about/` for de. */
export function localizedPath(locale: Locale, path: string): string {
  return locale === DEFAULT_LOCALE ? path : `/${locale}${path}`;
}

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/** Split a pathname into its locale and the unlocalized path. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const match = /^\/([a-z]{2})(\/.*)?$/.exec(pathname);
  if (match && isLocale(match[1]) && match[1] !== DEFAULT_LOCALE) {
    const rest = match[2] ?? "/";
    return { locale: match[1], path: rest.endsWith("/") ? rest : `${rest}/` };
  }
  return { locale: DEFAULT_LOCALE, path: pathname.endsWith("/") ? pathname : `${pathname}/` };
}

/** hreflang → absolute URL for all locales plus x-default (English). */
export function hreflangMap(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const l of LOCALES) map[l] = absoluteUrl(localizedPath(l, path));
  map["x-default"] = absoluteUrl(localizedPath(DEFAULT_LOCALE, path));
  return map;
}
