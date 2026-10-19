import Link from "next/link";
import { Analytics } from "@vercel/analytics/next";
import { PAIRS } from "@/lib/clamp";
import { getDictionary, interpolate, type Locale } from "@/lib/i18n";
import { PAGE_PATHS, localizedPath, pairPath } from "@/lib/routes";
import { SISTER_SITES, SITE_NAME } from "@/lib/site";
import LanguageSwitcher from "./LanguageSwitcher";

export default function SiteShell({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  const d = getDictionary(locale);
  const href = (path: string) => localizedPath(locale, path);
  const navItems = [
    { path: PAGE_PATHS.fluidTypography, label: d.nav.fluidTypography },
    { path: PAGE_PATHS.typeScale, label: d.nav.typeScale },
    { path: PAGE_PATHS.fluidSpacing, label: d.nav.fluidSpacing },
    { path: PAGE_PATHS.tailwind, label: d.nav.tailwind },
  ];
  return (
    <html lang={locale}>
      <body className="min-h-screen font-sans">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-white focus:px-3 focus:py-2 dark:focus:bg-slate-900">
          {d.nav.skip}
        </a>
        <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3">
            <Link href={href("/")} className="flex items-center gap-2 font-semibold">
              <svg aria-hidden width="24" height="24" viewBox="0 0 32 32">
                <rect width="32" height="32" rx="7" fill="#4f46e5" />
                <path d="M7 23 L13 9 M13 23 L25 9" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
              </svg>
              {SITE_NAME}
            </Link>
            <nav aria-label={d.nav.mainNav} className="order-3 w-full sm:order-none sm:w-auto">
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {navItems.map((item) => (
                  <li key={item.path}>
                    <Link href={href(item.path)} className="text-slate-700 underline-offset-4 hover:underline dark:text-slate-300">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <LanguageSwitcher locale={locale} label={d.nav.language} />
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="mt-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 text-sm text-slate-600 sm:grid-cols-3 dark:text-slate-400">
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{SITE_NAME}</p>
              <p className="mt-2">{d.footer.tagline}</p>
              <p className="mt-2">© {new Date().getFullYear()} {SITE_NAME}</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{d.footer.site}</p>
              <ul className="mt-2 space-y-1">
                <li><Link href={href("/")} className="hover:underline">{d.nav.home}</Link></li>
                {navItems.map((item) => (
                  <li key={item.path}><Link href={href(item.path)} className="hover:underline">{item.label}</Link></li>
                ))}
                <li><Link href={href(PAGE_PATHS.about)} className="hover:underline">{d.nav.about}</Link></li>
                <li><Link href={href(PAGE_PATHS.privacy)} className="hover:underline">{d.nav.privacy}</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">{d.footer.presets}</p>
              <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                {PAIRS.map((p) => {
                  const [min, max] = p.split("-");
                  return (
                    <li key={p}>
                      <Link href={href(pairPath(p))} className="hover:underline">
                        {interpolate(d.common.pairLink, { min, max })}
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <p className="mt-4 font-semibold text-slate-900 dark:text-white">{d.footer.sisters}</p>
              <ul className="mt-2 space-y-1">
                <li><a href={SISTER_SITES[0].url} className="hover:underline">{d.footer.contrast}</a></li>
                <li><a href={SISTER_SITES[1].url} className="hover:underline">{d.footer.aspect}</a></li>
              </ul>
            </div>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
