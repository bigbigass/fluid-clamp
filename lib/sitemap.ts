import type { MetadataRoute } from "next";
import { LOCALES } from "./i18n/config";
import { ALL_PATHS, absoluteUrl, hreflangMap, localizedPath } from "./routes";

/** Every page × every locale, each with its hreflang alternates. */
export function buildSitemap(lastModified = new Date()): MetadataRoute.Sitemap {
  return ALL_PATHS.flatMap((path) => {
    const languages = hreflangMap(path);
    return LOCALES.map((locale) => ({
      url: absoluteUrl(localizedPath(locale, path)),
      lastModified,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : path.startsWith("/clamp/") ? 0.6 : 0.8,
      alternates: { languages },
    }));
  });
}
