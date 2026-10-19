"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { track } from "@vercel/analytics";
import {
  BREAKPOINTS,
  ClampError,
  PAIRS,
  SCALE_RATIOS,
  computeClamp,
  exceedsWcagRatio,
  fromPx,
  parsePair,
  sizeAt,
  toCustomProperty,
  toPx,
  toTailwind,
  typeScale,
  typeScaleCss,
  type ClampResult,
  type SizeUnit,
  type TypeScaleStep,
} from "@/lib/clamp";
import { formatNumber, interpolate, type Locale, type ToolDictionary } from "@/lib/i18n";
import { DEFAULT_MAX_VW, DEFAULT_MIN_VW } from "@/lib/site";

export type ToolMode = "font" | "spacing" | "scale";

export interface ToolState {
  mode: ToolMode;
  min: string;
  max: string;
  minVw: string;
  maxVw: string;
  root: string;
  unit: SizeUnit;
  out: SizeUnit;
  precision: string;
  ratioMin: string;
  ratioMax: string;
}

/** URL query key for each state field. */
const QUERY_KEYS: Record<keyof ToolState, string> = {
  mode: "mode",
  min: "min",
  max: "max",
  minVw: "minvw",
  maxVw: "maxvw",
  root: "root",
  unit: "unit",
  out: "out",
  precision: "p",
  ratioMin: "rmin",
  ratioMax: "rmax",
};

export function defaultState(overrides: Partial<ToolState> = {}): ToolState {
  return {
    mode: "font",
    min: "16",
    max: "24",
    minVw: String(DEFAULT_MIN_VW),
    maxVw: String(DEFAULT_MAX_VW),
    root: "16",
    unit: "px",
    out: "rem",
    precision: "4",
    ratioMin: "1.2",
    ratioMax: "1.25",
    ...overrides,
  };
}

function readQuery(search: string, fallback: ToolState): ToolState {
  const params = new URLSearchParams(search);
  const next = { ...fallback };
  for (const [field, key] of Object.entries(QUERY_KEYS) as [keyof ToolState, string][]) {
    const value = params.get(key);
    if (value === null || value.length > 12) continue;
    if (field === "mode") {
      if (value === "font" || value === "spacing" || value === "scale") next.mode = value;
    } else if (field === "unit" || field === "out") {
      if (value === "px" || value === "rem") next[field] = value;
    } else if (/^-?\d*\.?\d+$/.test(value)) {
      next[field] = value;
    }
  }
  return next;
}

function writeQuery(state: ToolState, initial: ToolState): string {
  const params = new URLSearchParams();
  for (const [field, key] of Object.entries(QUERY_KEYS) as [keyof ToolState, string][]) {
    if (state[field] !== initial[field]) params.set(key, state[field]);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

const num = (s: string) => (s.trim() === "" ? NaN : Number(s));

type Computed =
  | { kind: "single"; result: ClampResult }
  | { kind: "scale"; steps: TypeScaleStep[]; css: string }
  | { kind: "error"; code: ClampError["code"] };

function compute(s: ToolState): Computed {
  try {
    const common = {
      minVw: num(s.minVw),
      maxVw: num(s.maxVw),
      rootFontSize: num(s.root),
      outputUnit: s.out,
      precision: Math.min(6, Math.max(0, Math.round(num(s.precision)))),
    };
    if (s.mode === "scale") {
      const root = num(s.root);
      const steps = typeScale({
        ...common,
        baseMin: toPx(num(s.min), s.unit, root),
        baseMax: toPx(num(s.max), s.unit, root),
        ratioMin: num(s.ratioMin),
        ratioMax: num(s.ratioMax),
      });
      return { kind: "scale", steps, css: typeScaleCss(steps) };
    }
    return {
      kind: "single",
      result: computeClamp({ ...common, minSize: num(s.min), maxSize: num(s.max), inputUnit: s.unit }),
    };
  } catch (e) {
    if (e instanceof ClampError) return { kind: "error", code: e.code };
    return { kind: "error", code: "invalid-number" };
  }
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyRow({
  label,
  value,
  kind,
  mode,
  t,
}: {
  label: string;
  value: string;
  kind: string;
  mode: ToolMode;
  t: ToolDictionary;
}) {
  const [copied, setCopied] = useState(false);
  const multiline = value.includes("\n");
  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            if (await copyText(value)) {
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }
            track("copy_output", { kind, mode });
          }}
        >
          <span aria-live="polite">{copied ? t.copied : t.copy}</span>
        </button>
      </div>
      {multiline ? (
        <pre className="code-box max-h-72 overflow-auto">{value}</pre>
      ) : (
        <code className="code-box block break-all">{value}</code>
      )}
    </div>
  );
}

function NumberField({
  id,
  label,
  value,
  onChange,
  suffix,
  step = "any",
  min = "0",
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  suffix?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <span className="flex items-center rounded-lg border border-slate-300 bg-white focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-600 dark:bg-slate-900">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={min}
          step={step}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2 tabular-nums outline-none"
        />
        {suffix && <span className="pr-3 text-sm text-slate-500 dark:text-slate-400">{suffix}</span>}
      </span>
    </label>
  );
}

function UnitToggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: SizeUnit;
  onChange: (u: SizeUnit) => void;
}) {
  return (
    <fieldset>
      <legend className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">{label}</legend>
      <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-600">
        {(["px", "rem"] as const).map((u) => (
          <button
            key={u}
            type="button"
            aria-pressed={value === u}
            onClick={() => onChange(u)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              value === u
                ? "bg-indigo-600 text-white"
                : "text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            {u}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function ClampTool({
  locale,
  t,
  initial: initialOverrides,
  tailwindFirst = false,
}: {
  locale: Locale;
  t: ToolDictionary;
  initial?: Partial<ToolState>;
  tailwindFirst?: boolean;
}) {
  const initial = useMemo(() => defaultState(initialOverrides), [initialOverrides]);
  const [state, setState] = useState<ToolState>(initial);
  const [vw, setVw] = useState(1024);
  const [linkCopied, setLinkCopied] = useState(false);
  const hydrated = useRef(false);

  // Keep the URL in sync so results are shareable.
  useEffect(() => {
    if (!hydrated.current) return;
    const url = `${window.location.pathname}${writeQuery(state, initial)}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", url);
  }, [state, initial]);

  // Restore shared state from the URL once on mount.
  useEffect(() => {
    const fromUrl = readQuery(window.location.search, initial);
    setState(fromUrl);
    hydrated.current = true;
  }, [initial]);

  const set = <K extends keyof ToolState>(key: K, value: ToolState[K]) => setState((s) => ({ ...s, [key]: value }));

  const changeUnit = (unit: SizeUnit) =>
    setState((s) => {
      if (s.unit === unit) return s;
      const root = num(s.root) || 16;
      const convert = (v: string) => {
        const n = num(v);
        if (!Number.isFinite(n)) return v;
        return String(Number(fromPx(toPx(n, s.unit, root), unit, root).toFixed(4)));
      };
      return { ...s, unit, min: convert(s.min), max: convert(s.max) };
    });

  const applyPreset = (pair: string) => {
    const p = parsePair(pair);
    if (!p) return;
    setState((s) => {
      const root = num(s.root) || 16;
      const f = (px: number) => String(Number(fromPx(px, s.unit, root).toFixed(4)));
      return { ...s, min: f(p.min), max: f(p.max) };
    });
    track("preset_click", { preset: pair, mode: state.mode });
  };

  const computed = useMemo(() => compute(state), [state]);
  const nf = (v: number, digits = 2) => formatNumber(locale, v, digits);
  const modeLabels: Record<ToolMode, string> = { font: t.modeFont, spacing: t.modeSpacing, scale: t.modeScale };
  const isScale = state.mode === "scale";
  const sizeLabels = isScale
    ? [t.baseMin, t.baseMax]
    : state.mode === "spacing"
      ? [t.minSpace, t.maxSpace]
      : [t.minSize, t.maxSize];
  const twPrefix = state.mode === "spacing" ? "p" : "text";
  const unitSuffix = state.unit;

  return (
    <section aria-label={t.result} className="card p-4 sm:p-6">
      <div role="group" aria-label={t.modes} className="mb-5 flex flex-wrap gap-2">
        {(["font", "spacing", "scale"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={state.mode === m}
            onClick={() => set("mode", m)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium ${
              state.mode === m
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {modeLabels[m]}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <NumberField id="fc-min" label={sizeLabels[0]} value={state.min} onChange={(v) => set("min", v)} suffix={unitSuffix} />
            <NumberField id="fc-max" label={sizeLabels[1]} value={state.max} onChange={(v) => set("max", v)} suffix={unitSuffix} />
            <NumberField id="fc-minvw" label={t.minVw} value={state.minVw} onChange={(v) => set("minVw", v)} suffix="px" step="1" />
            <NumberField id="fc-maxvw" label={t.maxVw} value={state.maxVw} onChange={(v) => set("maxVw", v)} suffix="px" step="1" />
            {isScale && (
              <>
                <NumberField id="fc-rmin" label={t.ratioMin} value={state.ratioMin} onChange={(v) => set("ratioMin", v)} step="0.001" />
                <NumberField id="fc-rmax" label={t.ratioMax} value={state.ratioMax} onChange={(v) => set("ratioMax", v)} step="0.001" />
              </>
            )}
            <NumberField id="fc-root" label={t.rootFont} value={state.root} onChange={(v) => set("root", v)} suffix="px" step="1" />
            <NumberField id="fc-precision" label={t.precision} value={state.precision} onChange={(v) => set("precision", v)} step="1" />
          </div>
          <div className="flex flex-wrap gap-6">
            <UnitToggle label={t.inputUnit} value={state.unit} onChange={changeUnit} />
            <UnitToggle label={t.outputUnit} value={state.out} onChange={(u) => set("out", u)} />
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-300">{t.presets}</p>
            <div className="flex flex-wrap gap-2">
              {isScale
                ? SCALE_RATIOS.map((r, i) => (
                    <button
                      key={r.value}
                      type="button"
                      className="chip"
                      onClick={() => {
                        set("ratioMax", String(r.value));
                        track("preset_click", { preset: `ratio-${r.value}`, mode: state.mode });
                      }}
                    >
                      {t.ratioNames[i]} · {r.value}
                    </button>
                  ))
                : PAIRS.map((p) => (
                    <button key={p} type="button" className="chip" onClick={() => applyPreset(p)}>
                      {p.replace("-", "→")}px
                    </button>
                  ))}
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-4" aria-live="polite">
          {computed.kind === "error" && (
            <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
              {t.errors[computed.code]}
            </p>
          )}
          {computed.kind === "single" && (
            <SingleOutput
              result={computed.result}
              mode={state.mode}
              t={t}
              nf={nf}
              twPrefix={twPrefix}
              tailwindFirst={tailwindFirst}
            />
          )}
          {computed.kind === "scale" && (
            <>
              <CopyRow label={t.outScale} value={computed.css} kind="scale" mode={state.mode} t={t} />
              <ScaleTable steps={computed.steps} t={t} nf={nf} />
            </>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="btn-secondary"
              onClick={async () => {
                if (await copyText(window.location.href)) {
                  setLinkCopied(true);
                  setTimeout(() => setLinkCopied(false), 1500);
                }
                track("copy_output", { kind: "link", mode: state.mode });
              }}
            >
              <span aria-live="polite">{linkCopied ? t.copied : t.copyLink}</span>
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.shareHint}</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="mt-8 border-t border-slate-200 pt-6 dark:border-slate-700">
        <h2 className="mb-3 text-lg font-semibold">{t.preview}</h2>
        <label htmlFor="fc-vw" className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">{t.previewWidth}</span>
          <span className="tabular-nums text-slate-600 dark:text-slate-400">{vw}px</span>
        </label>
        <input
          id="fc-vw"
          type="range"
          min={320}
          max={1920}
          step={1}
          value={vw}
          onChange={(e) => setVw(Number(e.target.value))}
          className="w-full accent-indigo-600"
        />
        <div className="mt-4 h-72 overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-950">
          <Preview computed={computed} vw={vw} mode={state.mode} t={t} nf={nf} />
        </div>
      </div>
    </section>
  );
}

function SingleOutput({
  result,
  mode,
  t,
  nf,
  twPrefix,
  tailwindFirst,
}: {
  result: ClampResult;
  mode: ToolMode;
  t: ToolDictionary;
  nf: (v: number, d?: number) => string;
  twPrefix: string;
  tailwindFirst: boolean;
}) {
  const varName = mode === "spacing" ? "--fluid-space" : "--fluid-size";
  const rows = [
    { label: t.outCss, value: result.css, kind: "css" },
    { label: t.outVar, value: toCustomProperty(result.css, varName), kind: "variable" },
    { label: t.outTailwind, value: toTailwind(result.css, twPrefix), kind: "tailwind" },
  ];
  if (tailwindFirst) rows.unshift(rows.splice(2, 1)[0]);
  const ratio = nf(result.ratio, 2);
  const warn = exceedsWcagRatio(result);
  return (
    <>
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.result}</p>
        <output className="mt-1 block break-all rounded-lg bg-slate-900 p-3 font-mono text-base text-white dark:bg-black">
          {result.css}
        </output>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          {t.slope}: <span className="font-mono">{nf(result.slopeVw, 4)}vw</span> · {t.intercept}:{" "}
          <span className="font-mono">
            {result.intercept}
            {result.outputUnit}
          </span>
        </p>
      </div>
      {rows.map((r) => (
        <CopyRow key={r.kind} label={r.label} value={r.value} kind={r.kind} mode={mode} t={t} />
      ))}
      <p
        className={`rounded-lg p-3 text-sm ${
          warn
            ? "border border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
            : "border border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
        }`}
      >
        {interpolate(warn ? t.wcagWarn : t.wcagOk, { ratio })}
      </p>
      <table className="w-full text-sm">
        <caption className="mb-1 text-left font-medium text-slate-700 dark:text-slate-300">{t.sizeTable}</caption>
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th scope="col" className="py-1 font-medium">{t.viewport}</th>
            <th scope="col" className="py-1 font-medium">{t.size} (px)</th>
            <th scope="col" className="py-1 font-medium">{t.size} (rem)</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {BREAKPOINTS.map((bp) => {
            const px = sizeAt(result, bp);
            return (
              <tr key={bp} className="border-b border-slate-100 dark:border-slate-800">
                <td className="py-1">{bp}px</td>
                <td className="py-1">{nf(px, 2)}</td>
                <td className="py-1">{nf(px / result.rootFontSize, 4)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </>
  );
}

function ScaleTable({
  steps,
  t,
  nf,
}: {
  steps: TypeScaleStep[];
  t: ToolDictionary;
  nf: (v: number, d?: number) => string;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th scope="col" className="py-1 pr-2 font-medium">{t.variable}</th>
            <th scope="col" className="py-1 pr-2 font-medium">{t.atMin} (px)</th>
            <th scope="col" className="py-1 pr-2 font-medium">{t.atMax} (px)</th>
            <th scope="col" className="py-1 font-medium">×</th>
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {[...steps].reverse().map((s) => (
            <tr key={s.step} className="border-b border-slate-100 dark:border-slate-800">
              <td className="py-1 pr-2 font-mono">{s.name}</td>
              <td className="py-1 pr-2">{nf(s.clamp.minPx)}</td>
              <td className="py-1 pr-2">{nf(s.clamp.maxPx)}</td>
              <td className={`py-1 ${exceedsWcagRatio(s.clamp) ? "font-semibold text-amber-700 dark:text-amber-300" : ""}`}>
                {nf(s.clamp.ratio)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Preview({
  computed,
  vw,
  mode,
  t,
  nf,
}: {
  computed: Computed;
  vw: number;
  mode: ToolMode;
  t: ToolDictionary;
  nf: (v: number, d?: number) => string;
}) {
  if (computed.kind === "error") return null;
  if (computed.kind === "scale") {
    return (
      <div className="h-full space-y-1 overflow-auto">
        {[...computed.steps].reverse().map((s) => {
          const px = sizeAt(s.clamp, vw);
          return (
            <p key={s.step} className="flex items-baseline gap-3 whitespace-nowrap leading-tight">
              <span className="w-20 shrink-0 font-mono text-xs text-slate-500">
                {s.step} · {nf(px, 1)}px
              </span>
              <span style={{ fontSize: `${px}px` }}>{t.previewText}</span>
            </p>
          );
        })}
      </div>
    );
  }
  const px = sizeAt(computed.result, vw);
  const caption = interpolate(t.previewAt, { size: nf(px, 2), vw });
  if (mode === "spacing") {
    return (
      <div className="flex h-full flex-col">
        <p className="mb-2 text-xs text-slate-500">{caption}</p>
        <div className="flex-1 overflow-hidden rounded-lg bg-indigo-100 dark:bg-indigo-950" style={{ padding: `${px}px` }}>
          <div className="flex h-full" style={{ gap: `${px}px` }}>
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 rounded-md bg-indigo-500/80" />
            ))}
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-500">{t.previewBox}</p>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col">
      <p className="mb-2 text-xs text-slate-500">{caption}</p>
      <p className="font-semibold leading-tight break-words" style={{ fontSize: `${px}px` }}>
        {t.previewText}
      </p>
    </div>
  );
}
