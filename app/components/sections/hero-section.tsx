"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const games = [
  { id: 1, name: "Aftersoul", image: "🎮" },
  { id: 2, name: "Arena of Valor", image: "⚔️" },
  { id: 3, name: "Free Fire", image: "🔥" },
  { id: 4, name: "PUBG Mobile", image: "🎯" },
  { id: 5, name: "League of Legends", image: "👑" },
  { id: 6, name: "Linker", image: "🔗" },
  { id: 7, name: "Garena", image: "🎪" },
  { id: 8, name: "Valorant", image: "🎨" },
  { id: 9, name: "Roblox", image: "🧱" },
  { id: 10, name: "Genshin Impact", image: "✨" },
  { id: 11, name: "Honkai", image: "⭐" },
  { id: 12, name: "Ragnarok Online", image: "⚡" },
  { id: 13, name: "Ellin", image: "🌟" },
  { id: 14, name: "NCSoft", image: "🎭" },
  { id: 15, name: "Game Five", image: "🎲" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,#2a0a0a_0%,#120607_42%,#090909_70%)]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#ff2140]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#ff7a001f] blur-3xl" />

      <div className="relative z-20 mx-auto grid min-h-[80vh] w-full max-w-7xl items-center gap-8 px-4 py-12 sm:px-6 sm:py-14 lg:grid-cols-2 lg:gap-10 lg:px-8 lg:py-20">
        {/* Left Content */}
        <div>
   
          <h1 className="text-4xl text-pretty font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            <span className="shiny-text">เว็บเติมเกมราคาถูก</span>
            <br />
            <p className="text-lg font-bold text-[#B9EF31]">AUTO TOP-UP PLATFORM</p>

      
          </h1>
          <p className="mt-4 max-w-xl text-balance text-sm text-white/75 sm:mt-5 sm:text-base lg:text-lg">
            เติมเกมได้ 24 ชั่วโมงแบบเรียลไทม์
            จ่ายเสร็จระบบทำงานทันที ไม่ต้องรอแอดมิน
            พร้อมบริการช่วยเหลือเมื่อคุณต้องการ
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:flex-wrap sm:items-center">
            <Link
              href="/products"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#ff1536] px-5 text-sm font-bold tracking-wide text-white transition hover:bg-[#ff2a48] sm:w-auto"
            >
              เลือกเกมที่ต้องการเติม
            </Link>
            <Link
              href="/checkout"
              className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:text-white sm:w-auto"
            >
              วิธีเติมเงิน
            </Link>
          </div>
        
        </div>

        {/* Right Side - Game Carousel */}
        <div className="mt-8 block max-w-200 overflow-hidden rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-sm lg:mt-0 lg:block lg:p-6">
          <div className="space-y-3 lg:space-y-4">
            {[0, 1, 2].map((rowIndex) => (
              <Swiper
                key={rowIndex}
                modules={[Autoplay]}
                slidesPerView={3}
                breakpoints={{
                  768: {
                    slidesPerView: 5,
                  },
                  1024: {
                    slidesPerView: 5,
                  },
                  1280: {
                    slidesPerView: 5.5,
                  },
                }}
                spaceBetween={12}
                loop={true}
                speed={4200}
                allowTouchMove={false}
                className="w-full overflow-hidden"
                autoplay={{
                  delay: 0,
                  disableOnInteraction: false,
                  reverseDirection: rowIndex % 2 === 1,
                }}
              >
                {games.map((game) => (
                  <SwiperSlide key={`${rowIndex}-${game.id}`}>
                    <div className="h-20 rounded-2xl border border-white/10 bg-white/5 p-2 backdrop-blur-sm transition hover:border-white/20 hover:bg-white/10 lg:h-24 lg:p-3">
                      <div className="flex h-full items-center justify-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-[#ff1536]/20 to-[#ff7a00]/10 text-2xl shrink-0 lg:h-14 lg:w-14 lg:text-3xl">
                          {game.image}
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
