import SiteShell from "@/components/SiteShell";
import "../globals.css";

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell locale="en">{children}</SiteShell>;
}
