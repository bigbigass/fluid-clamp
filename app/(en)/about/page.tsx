import InfoPage, { infoPageMetadata } from "@/components/pages/InfoPage";

export const metadata = infoPageMetadata("en", "about");

export default function Page() {
  return <InfoPage locale="en" page="about" />;
}
