import Link from "next/link";

const recommendedGames = [
  {
    name: "ROV",
    image: "https://img2.pic.in.th/unnamed8e8278dc624c7c96.md.png",
  },
  {
    name: "Free Fire",
    image: "https://img1.pic.in.th/images/freefire_s470.th.jpg",
  },
  {
    name: "Call of Duty",
    image: "https://img2.pic.in.th/9c392a2f1834f7f9a279c87ef7d2683a.md.png",
  },
  {
    name: "Mobile Legends",
    image:
      "https://img1.pic.in.th/images/8255033248d018b6c5f3d460b2deec16.th.jpg",
  },
];

export default function PopularGamesSection() {
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
          <Link
            href="/products"
            className="hidden text-sm text-gray-400/80 sm:block"
          >
            เลือกดูเกมทั้งหมด
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {recommendedGames.map((game) => (
            <article
              key={game.name}
              className="relative overflow-hidden w-fit rounded-2xl border border-white/15 shadow-[0_18px_45px_rgba(0,0,0,0.38)]"
            >
              <div className="flex h-44 w-full items-center justify-center bg-[#151515] sm:h-48">
                <img
                  src={game.image}
                  alt={game.name}
                  className="h-full w-full object-cover brightness-75 rounded-2xl"
                />
              </div>
              <div className="border-t border-white/10 bg-[#0f0f0f] px-4 py-3">
                <p className="text-sm font-semibold text-white">{game.name}</p>
              </div>
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 backdrop-blur-[1px]">
                <span className="rounded-full border border-white/20 bg-black/60 px-3 py-1 text-xs font-semibold tracking-wide text-white/90">
                  ยังไม่พร้อมใช้งาน
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
