"use client";

import { useMemo, useState } from "react";

type GameItem = {
  id: number;
  name: string;
  publisher: string;
  category: "MOBA" | "Shooter" | "RPG" | "Sandbox";
  priceStart: number;
  badge?: "HOT" | "NEW";
  icon: string;
};

const gameList: GameItem[] = [
    { id: 1, name: "ROV", publisher: "Garena", category: "MOBA", priceStart: 10, badge: "HOT", icon: "https://img2.pic.in.th/unnamed8e8278dc624c7c96.md.png" },
  { id: 2, name: "Freefire", publisher: "Garena", category: "Shooter", priceStart: 20, badge: "HOT", icon: "https://img1.pic.in.th/images/freefire_s470.th.jpg" },
  { id: 3, name: "MLBB", publisher: "Moonton", category: "MOBA", priceStart: 10, badge: "HOT", icon: "https://img1.pic.in.th/images/8255033248d018b6c5f3d460b2deec16.th.jpg" },
  { id: 4, name: "Call of Duty", publisher: "Activision", category: "Shooter", priceStart: 30, badge: "NEW", icon: "https://img2.pic.in.th/9c392a2f1834f7f9a279c87ef7d2683a.md.png" },
  { id: 5, name: "Black Clover", publisher: "Vic Game Studios", category: "RPG", priceStart: 35, icon: "https://img2.pic.in.th/bcm.md.png" },
  { id: 6, name: "Delta Force", publisher: "Tencent", category: "Shooter", priceStart: 25, icon: "https://img1.pic.in.th/images/unnamed2.md.png" },
  { id: 7, name: "Haikyu Fly", publisher: "Garena", category: "Sandbox", priceStart: 20, icon: "https://img2.pic.in.th/unnamed3.md.png" },
  { id: 8, name: "Undawn", publisher: "Level Infinite", category: "RPG", priceStart: 25, icon: "https://img1.pic.in.th/images/unnamed4d8d1d1123e331597.md.png" },
  { id: 9, name: "Valorant", publisher: "Riot Games", category: "Shooter", priceStart: 50, badge: "NEW", icon: "https://img2.pic.in.th/images.steamusercontent.md.jpg" },
];

const allCategories = ["ทั้งหมด", "MOBA", "Shooter", "RPG", "Sandbox"] as const;
type CategoryFilter = (typeof allCategories)[number];

export default function ProductsPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryFilter>("ทั้งหมด");

  const filteredGames = useMemo(() => {
    return gameList.filter((game) => {
      const matchesCategory = category === "ทั้งหมด" || game.category === category;
      const q = query.trim().toLowerCase();
      const matchesQuery =
        q.length === 0 ||
        game.name.toLowerCase().includes(q) ||
        game.publisher.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [query, category]);

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

              <div className="flex flex-wrap gap-2">
                {allCategories.map((item) => {
                  const active = item === category;
                  return (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setCategory(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition sm:px-4 sm:text-sm ${
                        active
                          ? "bg-[#ff1738] text-white"
                          : "border border-white/15 bg-white/5 text-white/70 hover:border-white/30 hover:text-white"
                      }`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-white/65 sm:text-base">
            พบ {filteredGames.length} เกม
          </p>
        </div>

        {filteredGames.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-black/30 p-8 text-center backdrop-blur-sm">
            <p className="text-lg font-semibold text-white">ไม่พบเกมที่ค้นหา</p>
            <p className="mt-2 text-sm text-white/65">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่น</p>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory("ทั้งหมด");
              }}
              className="mt-4 inline-flex rounded-xl bg-[#ff1738] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#ff2f4d]"
            >
              ล้างตัวกรอง
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 md:grid-cols-6 sm:gap-4 lg:grid-cols-6 xl:grid-cols-7">
            {filteredGames.map((game) => (
              <article
                key={game.id}
                className="group rounded-2xl    border w-fit border-white/10 bg-black/35 p-3 backdrop-blur-sm transition hover:-translate-y-0.5 hover:border-white/25 hover:bg-black/45"
              >
                <div className="relative mb-3 flex h-fit items-center justify-center rounded-xl border border-white/10 bg-[#140b0d] sm:h-28">
                  <img src={game.icon} alt={game.name} className="h-auto w-full max-h-full rounded-2xl object-contain brightness-75" />
                  <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/70">
                    <span className="rounded-full border border-white/20 bg-black/60 px-2.5 py-1 text-[10px] font-semibold tracking-wide text-white/90 ">
                      ยังไม่พร้อมใช้งาน
                    </span>
                  </div>
                </div>

                <p className="truncate text-center text-sm font-semibold text-white sm:text-base">{game.name}</p>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
