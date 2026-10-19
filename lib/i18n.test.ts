import { describe, expect, it } from "vitest";
import { LOCALES, dictionaries } from "./i18n";

type Leaf = [path: string, value: unknown];

function leaves(value: unknown, prefix = ""): Leaf[] {
  if (Array.isArray(value)) return value.flatMap((v, i) => leaves(v, `${prefix}[${i}]`));
  if (value && typeof value === "object") {
    return Object.entries(value).flatMap(([k, v]) => leaves(v, prefix ? `${prefix}.${k}` : k));
  }
  return [[prefix, value]];
}

const placeholders = (s: string) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();

const en = new Map(leaves(dictionaries.en));

describe("i18n dictionaries", () => {
  it("covers all 7 locales", () => {
    expect([...LOCALES]).toEqual(["en", "zh", "es", "de", "fr", "ja", "pt"]);
    expect(Object.keys(dictionaries).sort()).toEqual([...LOCALES].sort());
  });

  it.each(LOCALES.map((l) => [l]))("%s has exactly the English key set", (locale) => {
    const keys = leaves(dictionaries[locale]).map(([k]) => k);
    expect(keys).toEqual([...en.keys()]);
  });

  it.each(LOCALES.map((l) => [l]))("%s has no empty strings", (locale) => {
    for (const [key, value] of leaves(dictionaries[locale])) {
      expect(typeof value, key).toBe("string");
      expect((value as string).trim().length, key).toBeGreaterThan(0);
    }
  });

  it.each(LOCALES.map((l) => [l]))("%s keeps every {placeholder} from English", (locale) => {
    for (const [key, value] of leaves(dictionaries[locale])) {
      expect(placeholders(value as string), key).toEqual(placeholders(en.get(key) as string));
    }
  });

  it.each(LOCALES.filter((l) => l !== "en").map((l) => [l]))("%s is actually translated", (locale) => {
    const all = leaves(dictionaries[locale]);
    const same = all.filter(([k, v]) => v === en.get(k) && (v as string).length > 25);
    // Long strings identical to English mean a missing translation.
    expect(same.map(([k]) => k)).toEqual([]);
  });
});
