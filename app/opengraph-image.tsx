import { OG_ALT, OG_SIZE, renderOgImage } from "@/lib/og";

export const dynamic = "force-static";
export const alt = OG_ALT;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function OpengraphImage() {
  return renderOgImage();
}
