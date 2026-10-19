import ToolPage, { toolPageMetadata } from "@/components/pages/ToolPage";

export const metadata = toolPageMetadata("en", "fluidTypography");

export default function Page() {
  return <ToolPage locale="en" page="fluidTypography" />;
}
