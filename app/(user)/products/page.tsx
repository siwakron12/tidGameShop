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
  tags?: string[];
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
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

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

  // รวม tag ทั้งหมดแบบ unique
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    games.forEach((game) => {
      (game.tags ?? []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [games]);

  // filter เกมด้วย query และ tag (multi-select)
  const filteredGames = useMemo(() => {
    return games.filter((game) => {
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        game.name.toLowerCase().includes(q) ||
        game.slug.toLowerCase().includes(q) ||
        game.providerSlug.toLowerCase().includes(q);
      const matchesTags =
        selectedTags.length === 0 ||
        selectedTags.every((tag) => (game.tags ?? []).includes(tag));
      return matchesQuery && matchesTags;
    });
  }, [games, query, selectedTags]);

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

            {allTags.length > 0 && (
              <div
                className="flex gap-2 mt-2 sm:mt-0 overflow-x-auto max-w-full scrollbar-thin scrollbar-thumb-[#222] scrollbar-track-transparent"
                style={{ WebkitOverflowScrolling: "touch", paddingBottom: 2 }}
              >
                {allTags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setSelectedTags((prev) =>
                          isSelected
                            ? prev.filter((t) => t !== tag)
                            : [...prev, tag]
                        );
                      }}
                      className={`rounded-full border px-3 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                        isSelected
                          ? "border-[#35552a] bg-[#1f2b18] text-[#9ee37d]"
                          : "border-white/15 bg-white/5 text-white/80 hover:bg-white/10"
                      }`}
                    >
                      {tag}
                      {isSelected && (
                        <span
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedTags((prev) => prev.filter((t) => t !== tag));
                          }}
                          className="ml-1 cursor-pointer text-[#ff9ca8] hover:text-[#ff5068] "
                          title="ลบแท็กนี้ออกจากตัวกรอง"
                        >
                          ×
                        </span>
                      )}
                    </button>
                  );
                })}
                {selectedTags.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setSelectedTags([])}
                    className="rounded-full border border-[#ff5068] bg-[#2c0f15] px-3 py-1 text-xs font-semibold text-[#ffc7cf] hover:bg-[#3a1a20] ml-2"
                  >
                    ล้าง
                  </button>
                )}
              </div>
            )}
            </div>
          </div>
        </div>


        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                className="group block rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-black/45 "
              >
                <article>
                  <div className="relative mb-3 aspect-square overflow-hidden rounded-xl border border-white/10 bg-[#140b0d]">
                    <img
                      src={game.imageUrl ?? fallbackCover}
                      alt={game.name}
                      className="h-full w-full rounded-xl object-cover brightness-90"
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
