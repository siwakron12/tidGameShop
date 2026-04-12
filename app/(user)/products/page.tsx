"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { toApiUrl } from "@/lib/api-url";

type GameItem = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  providerSlug: string;
};

type GamesResponse = {
  ok: boolean;
  items: GameItem[];
};

const fallbackCover =
  "https://dummyimage.com/640x640/1a1a1a/9ca3af&text=NO+IMAGE";

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [games, setGames] = useState<GameItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchGames = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await fetch(toApiUrl("/api/games"), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`โหลดรายการเกมไม่สำเร็จ (${response.status})`);
        }

        const json = (await response.json()) as GamesResponse;

        if (!json.ok || !Array.isArray(json.items)) {
          throw new Error("รูปแบบข้อมูลเกมไม่ถูกต้อง");
        }

        if (isMounted) {
          setGames(json.items);
        }
      } catch (error) {
        if (isMounted) {
          setGames([]);
          setErrorMessage(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะโหลดเกม");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchGames();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        game.name.toLowerCase().includes(q) ||
        game.slug.toLowerCase().includes(q) ||
        game.providerSlug.toLowerCase().includes(q);
      return matchesQuery;
    });
  }, [games, query]);

  return (
    <main className="border-t border-white/10 bg-[radial-gradient(circle_at_top,#22080c_0%,#120607_38%,#090909_72%)]">
      <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="mb-8 flex flex-col gap-5">
          <div>
            <p className="text-xs font-semibold tracking-[0.18em] text-[#ff5f74]">GAME CATALOG</p>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">เลือกเกมที่ต้องการเติม</h1>
            <p className="mt-2 text-sm text-white/65 sm:text-base">
              ค้นหาเกมและเริ่มเติมได้ทันที 
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-xl sm:p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 text-white/65 lg:max-w-lg">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="7" />
                  <line x1="16.65" y1="16.65" x2="21" y2="21" />
                </svg>
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาเกมหรือค่ายเกม..."
                  className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/40"
                />
              </label>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-white/65 sm:text-base">
            พบ {filteredGames.length} เกม
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-4 rounded-xl border border-[#ff5068]/30 bg-[#2c0f15]/70 px-4 py-3 text-sm text-[#ffc7cf]">
            {errorMessage}
          </div>
        ) : null}

        {isLoading ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">กำลังโหลดรายการเกม...</p>
          </div>
        ) : null}

        {!isLoading && filteredGames.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">ไม่พบเกมที่ค้นหา</p>
            <p className="mt-2 text-sm text-white/65">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
              }}
              className="mt-4 inline-flex rounded-xl bg-[#ff1738] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff2f4d]"
            >
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6 sm:gap-4 lg:grid-cols-6 xl:grid-cols-7">
            {filteredGames.map((game) => (
              <Link
                key={game.id}
                href={`/products/${game.slug}`}
                className="group block rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-black/45"
              >
                <article>
                  <div className="relative mb-3 flex h-fit items-center justify-center rounded-xl border border-white/10 bg-[#140b0d] sm:h-28">
                    <img
                      src={game.imageUrl ?? fallbackCover}
                      alt={game.name}
                      className="h-auto w-full max-h-full rounded-2xl object-contain brightness-90"
                    />
                  </div>

                  <p className="truncate text-center text-sm font-semibold text-white sm:text-base">{game.name}</p>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
