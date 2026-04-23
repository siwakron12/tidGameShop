"use client";


import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/swiper.css";
import Image from "next/image";
import Link from "next/link";
const NO_IMAGE = "https://dummyimage.com/640x640/1a1a1a/9ca3af&text=NO+IMAGE";
import { ArrowRight } from "lucide-react";
export type GachaCampaign = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: string;
  isRecommended: boolean;
  tags: string[];
  spinPrice: {
    cents: number;
    baht: string;
    formatted: string;
  };
  startsAt: string | null;
  endsAt: string | null;
};


async function fetchGachaCampaigns(): Promise<GachaCampaign[]> {
  try {
    const res = await fetch("/api/gacha/campaigns", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to fetch");
    const data = await res.json();
    if (data.ok && Array.isArray(data.items)) {
      return data.items;
    }
    return [];
  } catch {
    return [];
  }
}

import { useEffect, useState } from "react";



export default function GachaSection() {
  const [campaigns, setCampaigns] = useState<GachaCampaign[]>([]);
  useEffect(() => {
    fetchGachaCampaigns().then(setCampaigns);
  }, []);

  return (
    <section className="border-b border-white/10 bg-[#070707] py-12">
      <div className="mx-auto w-full max-w-7xl px-4">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#ff5f74]">GACHA CAMPAIGNS</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">สุ่มกาชา ลุ้นรางวัล</h2>
          </div>
          <div className="flex items-center hover:text-white transition-all">
           <Link href="/gacha" className="flex items-center gap-1 text-sm text-gray-400/80 hover:text-white transition">
            ดูทั้งหมด
            <ArrowRight className="text-lg" />
          </Link>
   
          </div>

        </div>
        <Swiper
          modules={[Autoplay]}
          slidesPerView={1.2}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
          spaceBetween={20}
          loop={true}
          autoplay={{ delay: 3500, disableOnInteraction: false }}
          className="w-full"
        >
          {campaigns.length === 0 && (
            <SwiperSlide>
              <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#181818] to-[#101010] p-5 items-center justify-center">
                <span className="text-white/60">ไม่พบแคมเปญกาชา</span>
              </div>
            </SwiperSlide>
          )}
          {campaigns.map((c) => (
            <SwiperSlide key={c.id}>
              <div className="flex flex-col h-full rounded-2xl border border-white/10 bg-gradient-to-b from-[#181818] to-[#101010] p-5">
                <div className="flex-1 flex items-center justify-center mb-4">
                  
                        <div className="relative w-[390px] sm:size-98 mx-auto  h-auto ">
                               <Image
                                 src={c.imageUrl || NO_IMAGE}
                                 alt={c.title}
                                 width={450}
                                 height={450}
                                 className="rounded-xl border object-cover border-white/10 bg-black w-full h-auto"
                               />
                             </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{c.title}</h3>
                <p className="text-sm text-white/70 mb-2">{c.description}</p>
                <div className="mt-auto flex items-center justify-between">
                  <span className="text-[#B9EF31] font-bold">{c.spinPrice.formatted} บาท/สุ่ม</span>
                  <Link
                    href={`/gacha/${c.id}`}
                    className="rounded-lg bg-[#ff1536] px-4 py-2 text-white font-bold text-xs hover:bg-[#ff2a48]"
                  >
                    สุ่มเลย
                  </Link>

                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
