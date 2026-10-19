import Link from "next/link";
import { PAIRS, type Pair } from "@/lib/clamp";
import { getDictionary, interpolate, type Dictionary, type Locale } from "@/lib/i18n";
import { PAGE_PATHS, localizedPath, pairPath, type PageKey } from "@/lib/routes";

type Section = Dictionary["pages"]["home"]["sections"][number];
type Faq = Dictionary["pages"]["home"]["faq"][number];

/** Server-rendered explanatory content, FAQ and internal links below the tool. */
export default function PageBody({
  locale,
  sections,
  faq,
  related,
  relatedPairs = [...PAIRS],
}: {
  locale: Locale;
  sections: Section[];
  faq: Faq[];
  related: PageKey[];
  relatedPairs?: Pair[];
}) {
  const d = getDictionary(locale);
  const navLabel: Record<PageKey, string> = {
    home: d.nav.home,
    fluidTypography: d.nav.fluidTypography,
    typeScale: d.nav.typeScale,
    fluidSpacing: d.nav.fluidSpacing,
    tailwind: d.nav.tailwind,
    about: d.nav.about,
    privacy: d.nav.privacy,
  };
  return (
    <div className="mx-auto mt-12 max-w-3xl">
      <article className="prose-content">
        {sections.map((s) => (
          <section key={s.h2}>
            <h2>{s.h2}</h2>
            {s.p.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
          </section>
        ))}
      </article>

      {faq.length > 0 && (
        <section className="mt-12" aria-labelledby="faq-title">
          <h2 id="faq-title" className="text-2xl font-semibold">{d.common.faqTitle}</h2>
          <div className="mt-4 divide-y divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-700 dark:border-slate-700 dark:bg-slate-900">
            {faq.map((f) => (
              <details key={f.q} className="group p-4">
                <summary className="cursor-pointer list-none font-medium">
                  <span className="mr-2 inline-block transition-transform group-open:rotate-90" aria-hidden>›</span>
                  {f.q}
                </summary>
                <p className="mt-2 text-slate-700 dark:text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <nav className="mt-12" aria-labelledby="related-title">
          <h2 id="related-title" className="text-xl font-semibold">{d.common.related}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {related.map((key) => (
              <li key={key}>
                <Link href={localizedPath(locale, PAGE_PATHS[key])} className="chip">
                  {navLabel[key]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}

      {relatedPairs.length > 0 && (
        <nav className="mt-8" aria-labelledby="pairs-title">
          <h2 id="pairs-title" className="text-xl font-semibold">{d.common.relatedPairs}</h2>
          <ul className="mt-3 flex flex-wrap gap-2">
            {relatedPairs.map((p) => {
              const [min, max] = p.split("-");
              return (
                <li key={p}>
                  <Link href={localizedPath(locale, pairPath(p))} className="chip">
                    {interpolate(d.common.pairLink, { min, max })}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </div>
  );
}
