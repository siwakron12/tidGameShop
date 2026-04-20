"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toApiUrl } from "@/lib/api-url";

type GameItem = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  isRecommended: boolean;
  lowestPrice: { formatted: string };
};

export default function PopularGamesSection() {
  const [games, setGames] = useState<GameItem[]>([]);

  useEffect(() => {
    fetch(toApiUrl("/api/games"), { cache: "no-store" })
      .then((r) => r.json())
      .then((json: { ok: boolean; items: GameItem[] }) => {
        if (json.ok) {
          setGames(json.items.filter((g) => g.isRecommended));
        }
      })
      .catch(() => { });
  }, []);

  return (
    <section className="border-b border-white/10 bg-[#070707]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#ff5f74]">
              RECOMMENDED TOP-UP
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
              เติมเกมยอดฮิต
            </h2>
          </div>
          <Link href="/products" className="text-sm text-gray-400/80">
            เลือกดูเกมทั้งหมด
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {games.map((game) => (
            <Link
              key={game.id}
              href={`/products/${game.slug}`}
              className="group block"
            >
              <article className="relative h-full overflow-hidden rounded-2xl border border-white/15 shadow-[0_18px_45px_rgba(0,0,0,0.38)] transition-transform duration-200 group-hover:scale-[1.02]">
                <div className="w-full overflow-hidden">
                  {game.imageUrl ? (
                    <img
                      src={game.imageUrl}
                      alt={game.name}
                      className="w-full h-auto brightness-75 transition-all duration-200 group-hover:brightness-90 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-44 w-full items-center justify-center bg-[#151515] text-sm text-white/30">
                      {game.name}
                    </div>
                  )}
                </div>
                <div className="border-t border-white/10 bg-[#0f0f0f] px-4 py-3">
                  <p className="text-sm font-semibold text-white">{game.name}</p>
                  <p className="text-[#B9EF31] mt-0.5 text-xs ">
                    เริ่มต้น ฿{game.lowestPrice.formatted}
                  </p>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}