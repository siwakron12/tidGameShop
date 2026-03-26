"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const games = [
  { id: 1, name: "FF", image: "https://media.pocketgamer.biz/images/114095/77750/freefire_s470.jpg" },
  { id: 2, name: "MLBB", image: "https://i.pinimg.com/474x/82/55/03/8255033248d018b6c5f3d460b2deec16.jpg" },
  { id: 3, name: "Call of Duty", image: "https://cdn-www.bluestacks.com/bs-images/9c392a2f1834f7f9a279c87ef7d2683a.png" },
  { id: 4, name: "Black Clover", image: "https://i.wazt.net/topup/product-image/bcm.png" },
  { id: 5, name: "Delta Force", image: "https://play-lh.googleusercontent.com/utG-EAUp93da_Bp0-AeOS7M8xYWRcSYhjIcxKFxhfcSU32moPHIhL9IS-AT20gaJ8w" },
  { id: 6, name: "Haikyu Fly", image: "https://play-lh.googleusercontent.com/gkwNDUNhTjZVSsjwsc9z-nJVJvDcWX_1XYQ3ZOCIZvdVWw1Gpjw4WGBe3Zv4PZzWTwE" },
  { id: 7, name: "Undawn", image: "https://play-lh.googleusercontent.com/ni5062FXeA6oZ_INb45nEpVEk8OClJnCjUnlYrgKQmijtIQA4OKq7J2w-uJOuu5xfg" },
  { id: 8, name: "Valorant", image: "https://images.steamusercontent.com/ugc/1009310639741043947/C4780FD7B53B39EFE4A536842FC1281A48A1256F/?imw=512&&ima=fit&impolicy=Letterbox&imcolor=%23000000&letterbox=false" },
  { id: 9, name: "rov", image: "https://play-lh.googleusercontent.com/2RrzGOcirTAU4vPzLiZ3Us4k-E-RtPVBbWB-RkU5FAT9gVrTlUJL0nYVN6VlpSbGq_uHHaLsvwvtxm1Mjirxpg=w1024" },
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
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:text-white sm:w-auto"
            >
             
              ติดต่อเรา 
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
                          <img src={game.image} alt={game.name} className="h-auto w-full max-h-full rounded-2xl object-contain" />
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
