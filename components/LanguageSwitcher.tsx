"use client";

import { usePathname } from "next/navigation";
import { track } from "@vercel/analytics";
import { LOCALES, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";
import { localizedPath, splitLocale } from "@/lib/routes";

export default function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname() ?? "/";
  const { path } = splitLocale(pathname);
  return (
    <details className="relative">
      <summary className="flex cursor-pointer list-none items-center gap-1 rounded-md px-2 py-1 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800">
        <span aria-hidden>🌐</span>
        <span className="sr-only">{label}: </span>
        {LOCALE_NAMES[locale]}
      </summary>
      <ul className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-900">
        {LOCALES.map((l) => (
          <li key={l}>
            {/* Full navigation: each locale has its own root layout and <html lang>. */}
            <a
              href={localizedPath(l, path)}
              hrefLang={l}
              lang={l}
              aria-current={l === locale ? "true" : undefined}
              onClick={() => track("locale_switch", { from: locale, to: l })}
              className={`block px-3 py-1.5 text-sm hover:bg-slate-100 dark:hover:bg-slate-800 ${
                l === locale ? "font-semibold text-indigo-700 dark:text-indigo-300" : "text-slate-700 dark:text-slate-300"
              }`}
            >
              {LOCALE_NAMES[l]}
            </a>
          </li>
        ))}
      </ul>
    </details>
  );
}
