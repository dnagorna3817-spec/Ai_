import { NovaApp } from "@/components/nova-app";

export default async function Page({ params }: { params: Promise<{ screen: string[] }> }) {
  const { screen } = await params;
  return <NovaApp screen={screen} />;
}
