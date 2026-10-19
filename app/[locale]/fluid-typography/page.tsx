import ToolPage, { toolPageMetadata } from "@/components/pages/ToolPage";
import { toLocale } from "@/lib/i18n";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  return toolPageMetadata(toLocale((await params).locale), "fluidTypography");
}

export default async function Page({ params }: Props) {
  return <ToolPage locale={toLocale((await params).locale)} page="fluidTypography" />;
}
