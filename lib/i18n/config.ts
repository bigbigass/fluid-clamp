export const LOCALES = ["en", "zh", "es", "de", "fr", "ja", "pt"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";
/** Locales served under a /{locale}/ prefix (English lives at the root). */
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE);

/** Native names for the language switcher. */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  zh: "简体中文",
  es: "Español",
  de: "Deutsch",
  fr: "Français",
  ja: "日本語",
  pt: "Português",
};

/** Open Graph locale codes. */
export const OG_LOCALES: Record<Locale, string> = {
  en: "en_US",
  zh: "zh_CN",
  es: "es_ES",
  de: "de_DE",
  fr: "fr_FR",
  ja: "ja_JP",
  pt: "pt_BR",
};

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}
