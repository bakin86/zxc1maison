import { notFound } from "next/navigation";
import { AuctionRoom } from "@/components/room/AuctionRoom";
import { LotPreview } from "@/components/lot/LotPreview";
import { getLot, getLots } from "@/lib/api";
import { t } from "@/lib/copy";

export async function generateStaticParams() {
  const lots = await getLots();
  return lots.map((lot) => ({ id: lot.id }));
}

export async function generateMetadata(props: PageProps<"/auction/[id]">) {
  const { id } = await props.params;
  const lot = await getLot(id);
  if (!lot) return { title: t.common.notFound };
  return {
    title: `${lot.code} — ${lot.title}`,
    description: lot.note,
  };
}

/**
 * One URL per lot, two states. Live lots get the dark bidding room; everything
 * else gets the catalogue preview, and the same link becomes the room when the
 * session opens.
 */
export default async function AuctionPage(props: PageProps<"/auction/[id]">) {
  const { id } = await props.params;
  const lot = await getLot(id);

  if (!lot) notFound();

  return lot.status === "live" ? (
    <AuctionRoom lot={lot} />
  ) : (
    <LotPreview lot={lot} />
  );
}
