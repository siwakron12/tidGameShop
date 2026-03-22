const recommendedGames = [
  {
    name: "ROV",
    image: "/abc.png",
  },
  {
    name: "Free Fire",
    image: "/promo-game-1.svg",
  },
  {
    name: "PUBG Mobile",
    image: "/promo-game-2.svg",
  },
  {
    name: "Genshin Impact",
    image: "/promo-game-3.svg",
  },
];

export default function PopularGamesSection() {
  return (
    <section className="border-b border-white/10 bg-[#070707]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#ff5f74]">RECOMMENDED TOP-UP</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">เติมเกมแนะนำ</h2>
          </div>
          <p className="hidden text-sm text-white/60 sm:block">เลือกเกมที่ต้องการเติมได้ทันที</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {recommendedGames.map((game) => (
            <article key={game.name} className="overflow-hidden rounded-2xl border border-white/15 shadow-[0_18px_45px_rgba(0,0,0,0.38)]">
              <div className="flex h-44 w-full items-center justify-center bg-[#151515] sm:h-48">
                <p className="text-sm text-white/50">ไม่มีรูป</p>
              </div>
              <div className="border-t border-white/10 bg-[#0f0f0f] px-4 py-3">
                <p className="text-sm font-semibold text-white">{game.name}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
