import Link from "next/link";
import { notFound } from "next/navigation";

import { toApiUrl } from "@/lib/api-url";

import { ProductOrderFlow } from "./product-order-flow";

type PriceView = {
  cents: number;
  baht: string;
  formatted: string;
};

type GameDetail = {
 howToImg: string | null;
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  uidLabel: string;
  uidPlaceholder: string | null;
  uidRequired: boolean;
  providerSlug: string;
  packCount: number;
  lowestPrice: PriceView | null;
};

type BundleItem = {
  id: string;
  quantity: number;
  childPack: {
    id: string;
    name: string;
    itemLabel: string | null;
  };
};

type GamePack = {
  id: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  itemLabel: string | null;
  itemAmount: number | null;
  sellingPrice: PriceView;
  isCustomPack: boolean;
  bundleItems: BundleItem[];
};

type GameDetailResponse = {
  ok: boolean;
  game: GameDetail;
  packs: GamePack[];
};

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const fallbackBanner = "https://dummyimage.com/1600x600/141414/9ca3af&text=GAME+BANNER";
const fallbackCover = "https://dummyimage.com/500x500/1a1a1a/9ca3af&text=NO+IMAGE";

async function fetchGameDetail(slug: string) {
  const response = await fetch(toApiUrl(`/api/games/${slug}`), {
    method: "GET",
    cache: "no-store",
    next: { revalidate: 0 },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`โหลดข้อมูลเกมไม่สำเร็จ (${response.status})`);
  }

  const json = (await response.json()) as GameDetailResponse;

  if (!json.ok || !json.game || !Array.isArray(json.packs)) {
    throw new Error("รูปแบบข้อมูลเกมไม่ถูกต้อง");
  }

  return json;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;

  const detail = await fetchGameDetail(slug);

  if (!detail) {
    notFound();
  }

  const { game, packs } = detail;

  return (
    <main className="border-t border-white/10 bg-[radial-gradient(circle_at_top,#1f0b10_0%,#120709_42%,#090909_78%)]">
      <section className="w-full pb-4 sm:pb-6 lg:pb-8">
        <div className="overflow-hidden border-y border-white/10 bg-black/35 backdrop-blur-sm sm:rounded-none">
          <div className="relative h-56 w-full sm:h-72 lg:h-112">
            <img src={game.bannerUrl ?? fallbackBanner} alt={`${game.name} banner`} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-7xl px-4 p-5 sm:px-6 sm:p-7 lg:px-8 lg:p-8">
              <p className="inline-flex rounded-md bg-[#f5081b] px-3 py-1 text-xs font-semibold text-white">
                เติมเกมออนไลน์โครตคุ้ม
              </p>
              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">{game.name}</h1>
              <p className="mt-2 max-w-3xl text-sm text-white/80 sm:text-base">
                {game.description && game.description.trim().length > 0
                  ? game.description
                  : "เลือกแพ็กที่ต้องการและยืนยันรายการสั่งซื้อได้ทันที"}
              </p>
{/* 
              <div className="mt-3 flex flex-wrap gap-2 text-xs sm:text-sm">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/90">slug: {game.slug}</span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/90">
                  provider: {game.providerSlug}
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/90">
                  แพ็กทั้งหมด: {game.packCount}
                </span>
              </div> */}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full  px-4 pb-8 sm:px-6 lg:px-24 lg:pb-10">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/80 transition hover:border-white/35 hover:text-white"
        >
          <span aria-hidden="true">←</span>
          กลับไปหน้าเกมทั้งหมด
        </Link>

        <ProductOrderFlow game={game} packs={packs} fallbackCover={fallbackCover} />
      </section>
    </main>
  );
}
