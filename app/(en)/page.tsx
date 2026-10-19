import ToolPage, { toolPageMetadata } from "@/components/pages/ToolPage";

export const metadata = toolPageMetadata("en", "home");

export default function Page() {
  return <ToolPage locale="en" page="home" />;
}
