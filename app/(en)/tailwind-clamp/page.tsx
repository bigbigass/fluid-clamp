import ToolPage, { toolPageMetadata } from "@/components/pages/ToolPage";

export const metadata = toolPageMetadata("en", "tailwind");

export default function Page() {
  return <ToolPage locale="en" page="tailwind" />;
}
