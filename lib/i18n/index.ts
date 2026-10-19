import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";
import en from "./dictionaries/en.json";
import zh from "./dictionaries/zh.json";
import es from "./dictionaries/es.json";
import de from "./dictionaries/de.json";
import fr from "./dictionaries/fr.json";
import ja from "./dictionaries/ja.json";
import pt from "./dictionaries/pt.json";

export type Dictionary = typeof en;
export type ToolDictionary = Dictionary["tool"];

/** Every locale must match the English shape; a missing key is a type error. */
export const dictionaries: Record<Locale, Dictionary> = { en, zh, es, de, fr, ja, pt };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function toLocale(value: string): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

/** Replace `{name}` placeholders with values. Unknown placeholders are left as-is. */
export function interpolate(template: string, vars: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => (key in vars ? String(vars[key]) : match));
}

export function formatNumber(locale: Locale, value: number, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits, useGrouping: false }).format(value);
}

export * from "./config";
