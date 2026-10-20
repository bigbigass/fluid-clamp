# FluidClamp — CSS clamp() Calculator

Free, client-side **CSS clamp() / fluid typography calculator**. Turn a min and max size plus a viewport range into a ready-to-paste `clamp()` value, preview it at every breakpoint, and export plain CSS, a custom property, a Tailwind arbitrary class or a full fluid type scale. Every calculation runs in the browser: no backend, no database, no paid APIs.

Spec: [`PROJECT.md`](./PROJECT.md) · Build instructions: [`BUILD.md`](./BUILD.md)

## Stack

Next.js 16 (App Router, fully static) · TypeScript strict · Tailwind CSS v4 · Vitest · `@vercel/analytics` (cookieless; custom events `copy_output`, `preset_click`, `locale_switch`).

## Development

Requires Node 20+.

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # Vitest: clamp math, i18n key parity, sitemap, metadata/SEO
npm run build    # static production build (all routes ○/●)
```

### Environment variables

| Variable | Default | Purpose |
|--|--|--|
| `NEXT_PUBLIC_SITE_URL` | `https://fluidclamp.top` | Base URL for canonical, hreflang, sitemap, robots, OG and JSON-LD. Set it once a custom domain is bound. |

## Pages

Each page exists in 7 locales: English at the root, others under `/zh/`, `/es/`, `/de/`, `/fr/`, `/ja/`, `/pt/`. That makes 16 pages × 7 locales = 112 HTML pages.

| Path | Content |
|--|--|
| `/` | Main calculator (font size / spacing / type scale modes) |
| `/fluid-typography/` | Guide + tool |
| `/type-scale-generator/` | Tool preset to type scale mode, exports `--step--2 … --step-6` |
| `/fluid-spacing/` | Tool preset to spacing mode |
| `/tailwind-clamp/` | Tool with Tailwind output first |
| `/clamp/{min}-{max}/` | Prefilled landings: 14-16, 16-20, 16-24, 18-24, 20-32, 24-48, 32-64, 40-80, 48-96 |
| `/about/`, `/privacy/` | Info pages |
| `/sitemap.xml`, `/robots.txt`, `/opengraph-image`, `/twitter-image`, `/icon.svg` | Metadata routes |

Tool state is stored in the URL query (`?min=16&max=24&minvw=320&maxvw=1280&root=16&unit=px&out=rem&p=4&mode=font&rmin=1.2&rmax=1.25`). Only values that differ from the page defaults are written, so the links stay shareable.

## Layout

```
app/(en)/…                    English routes at the root (own root layout, <html lang="en">)
app/[locale]/…                zh/es/de/fr/ja/pt routes (generateStaticParams, dynamicParams = false)
app/sitemap.ts, robots.ts, opengraph-image.tsx, twitter-image.tsx, icon.svg
components/ClampTool.tsx      Client tool: inputs, presets, outputs, copy, URL sync, preview, size table
components/pages/*            Shared page implementations (ToolPage, PairPage, InfoPage) used by both route trees
components/SiteShell.tsx      <html lang>, header, language switcher, footer, <Analytics />
lib/clamp.ts                  Pure math: computeClamp, sizeAt, typeScale, typeScaleCss, toTailwind, …
lib/i18n/dictionaries/*.json  Dictionaries for all 7 locales, typed from en.json
lib/routes.ts, seo.ts, sitemap.ts, pairContent.ts
lib/*.test.ts                 Vitest suites
```

English is served from a duplicated root route group, not a middleware rewrite, so no server runtime is needed. Each page sets a self-referencing canonical plus `hreflang` alternates for all 7 locales and `x-default` (English). The sitemap lists every page × locale with alternates. JSON-LD on each page: `WebApplication` (price 0, `inLanguage`) on tool pages, `FAQPage` on every page with an FAQ, and `BreadcrumbList` on every page except the home page.

## Deploy (owner)

Import the repo in Vercel (framework auto-detected), optionally set `NEXT_PUBLIC_SITE_URL`, enable Web Analytics, then submit `/sitemap.xml` in Google Search Console. Agents do not deploy or buy domains.
