# FluidClamp — CSS clamp() Calculator

Slug/repo: `fluid-clamp` · Target: Vercel `fluid-clamp.vercel.app` (owner deploys; do not deploy). Free, client-side-only tool site for overseas (Google) SEO. Primary keyword: **CSS clamp()/fluid typography calculator**.

## Core tool
- Inputs: min/max font size (px or rem), min/max viewport width (px), root font size (default 16), output unit (rem/px), decimal precision.
- Output: `clamp(MINrem, Xrem + Yvw, MAXrem)` with slope/intercept shown; copy button; also outputs CSS custom property, Tailwind arbitrary value (`text-[clamp(...)]`), and a full type scale mode (ratio e.g. 1.2/1.25/1.333/1.5, steps -2..+6) exported as CSS variables.
- Live preview: resizable preview box (slider 320–1920px) showing text rendered at computed size; table of rendered size at 320/375/768/1024/1280/1440/1920.
- Spacing mode (same math for padding/margins/gap).
- WCAG note: warn if max/min ratio > 2.5 (zoom issue SC 1.4.4).
- State encoded in URL query so results are shareable.
- Pure functions in `lib/clamp.ts`: `computeClamp`, `typeScale`, `sizeAt(vw)`; tests verify sizeAt equals min at minVW and max at maxVW, rem/px conversion, rounding, inverted inputs error.

## Pages (each in 7 locales)
- `/` main calculator
- `/fluid-typography/` guide + tool
- `/type-scale-generator/` scale mode preset
- `/fluid-spacing/` spacing mode
- `/tailwind-clamp/` Tailwind output focus
- Programmatic landings `/clamp/[min]-[max]/` for common pairs (14-16,16-20,16-24,18-24,20-32,24-48,32-64,40-80,48-96) with prefilled tool and unique explanatory copy
- `/about/`, `/privacy/`

## i18n (mandatory)
- Locales: en (default, served at `/`), zh, es, de, fr, ja, pt — served at `/zh/`, `/es/`, `/de/`, `/fr/`, `/ja/`, `/pt/`.
- App Router structure: `app/[locale]/...` with `generateStaticParams` for all locales; English rendered at root via middleware/`proxy` rewrite OR a duplicated root route group (no redirect for `/`). All pages statically generated (SSG), no server runtime needed.
- Dictionaries: `lib/i18n/dictionaries/{locale}.json`, typed via the `en.json` shape; every key must exist in every locale (enforced by a test). Native-quality translations of UI, H1, meta title/description, FAQ, and landing-page copy (not just UI chrome).
- `<html lang>` set per locale. Language switcher in header that keeps the current path.
- Every page: `alternates.languages` in `generateMetadata` producing `<link rel="alternate" hreflang="xx">` for all 7 locales + `x-default` (→ English), and a self-referencing canonical.
- `app/sitemap.ts`: every page × every locale, each entry with `alternates.languages`. `app/robots.ts` pointing to sitemap.
- Base URL from `NEXT_PUBLIC_SITE_URL` (fallback `https://fluidclamp.top`).

## SEO
- Unique title (<60 chars) and meta description (<155 chars) per page per locale; OG + Twitter tags; generated OG image via `app/opengraph-image.tsx` (static).
- JSON-LD: `WebApplication` (price 0) on tool pages, `FAQPage` on pages with FAQ, `BreadcrumbList` on landing pages.
- Each page: one H1, 300–700 words of genuinely useful explanatory content below the tool, 4–6 FAQs, internal links to related landing pages.
- Core Web Vitals: no layout shift, tool interactive client component, content server-rendered. Lighthouse SEO/Accessibility ≥ 95.
- Footer: About, Privacy (states all processing is in-browser; Vercel Analytics is cookieless), link to sister sites (ContrastCheck https://contrastcheck.top, Aspect Ratio Calculator https://aspectratiocalc.top).

## Analytics
- `@vercel/analytics` `<Analytics />` in root layout. Custom events via `track()`: `copy_output`, `preset_click`, `locale_switch`.

## Tech
- Next.js (latest, App Router) + TypeScript strict + Tailwind CSS v4, same stack as github.com/bigbigass/contrast-check. Vitest for tests. No backend, no DB, no paid APIs, no external runtime requests. Dark mode via `prefers-color-scheme`.

## Tests (Vitest, `npm test`)
- Core logic unit tests (see feature section) — at least 25 cases.
- i18n test: all locale dictionaries have identical key sets, no empty strings.
- Sitemap test: contains every page × 7 locales, all URLs absolute.
- Metadata test: hreflang map for a sample page has 7 locales + x-default.

## Acceptance
- `npm test` and `npm run build` pass with zero errors; build output shows all routes as static (○/●).
