/** Production base URL. Set NEXT_PUBLIC_SITE_URL once a custom domain is bound. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://fluidclamp.top").replace(/\/+$/, "");

export const SITE_NAME = "FluidClamp";

export const SISTER_SITES = [
  { name: "ContrastCheck", url: "https://contrastcheck.top" },
  { name: "Aspect Ratio Calculator", url: "https://aspectratiocalc.top" },
] as const;

/** Default viewport range used by the tool and the preset landing pages. */
export const DEFAULT_MIN_VW = 320;
export const DEFAULT_MAX_VW = 1280;
