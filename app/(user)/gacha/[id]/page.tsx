
"use client";
import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import dynamic from "next/dynamic";
const RewardPopup = dynamic(() => import("./reward_popup"), { ssr: false });
import { useParams } from "next/navigation";


import Image from "next/image";
import { toApiUrl } from "@/lib/api-url";
import { Dices } from "lucide-react";
import AuthModal from "@/app/components/ui/auth-modal";

const NO_IMAGE = "https://dummyimage.com/640x640/1a1a1a/9ca3af&text=NO+IMAGE";

export default function Page() {
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // ตรวจสอบ session แบบใหม่ รองรับทั้ง .user และ .data.user
    (async () => {
      try {
        const result = await authClient.getSession?.();
        const record = result as Record<string, unknown> | null;
        const nextSession = (record?.data as unknown) ?? result ?? null;
        const nextRecord = nextSession as Record<string, unknown> | null;
        const hasUser = Boolean(
          nextRecord && ("user" in nextRecord ? nextRecord.user : (nextRecord?.data as any)?.user)
        );
        setIsAuthenticated(hasUser);
      } catch {
        setIsAuthenticated(false);
      }
    })();
    if (!id) return;
    setLoading(true);
    fetch(toApiUrl(`/api/gacha/campaigns/${id}`))
      .then((res) => res.json())
      .then((json) => {
        if (json.ok) {
          setData(json);
          setError("");
        } else {
          setError("ไม่พบข้อมูลกล่องสุ่ม");
        }
      })
      .catch(() => setError("เกิดข้อผิดพลาดในการโหลดข้อมูล"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10 text-center text-white">กำลังโหลด...</div>;
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>;
  if (!data) return null;

  const { campaign, milestones } = data;

  async function handleSpin() {
    if (!isAuthenticated) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return;
    }
    try {
      const res = await fetch(toApiUrl("/api/gacha/spin"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignId: id,
          count: qty,
        }),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        alert(result.message || "เกิดข้อผิดพลาดในการสุ่ม");
        return;
      }
      setSpinResult(result);
    } catch (e) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  }

  return (
    <>
      {spinResult && (
        <RewardPopup result={spinResult} onClose={() => setSpinResult(null)} />
      )}
      <main className="mx-auto w-full max-w-7xl px-4 py-10 flex flex-col md:flex-row gap-8 ">
        {/* Layout: Left info, Right grid, Button bottom left */}
        <section className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="relative size-98 rounded-2xl overflow-hidden border border-white/10 bg-black mx-auto">
              <Image
                src={campaign.imageUrl || NO_IMAGE}
                alt={campaign.title}
                fill
                className="object-cover"
                unoptimized={!!campaign.imageUrl === false}
              />
            </div>
            <h1 className="text-2xl font-bold text-white mt-4 text-center">{campaign.title}</h1>
            <p className="text-white/70 mb-2 text-center">{campaign.description}</p>
            <span className="inline-block rounded-lg bg-[#ff1436] px-4 py-1 text-white font-bold text-lg mt-2">
              {campaign.spinPrice.formatted} บาท/สุ่ม
            </span>
          </div>
          {/* Quantity Selector and Total Price */}
          <div className="w-full mt-8 ">
            <div className="flex items-center w-full mx-auto rounded-2xl overflow-hidden border border-white/10 bg-[#181818]">
              <button
                type="button"
                aria-label="ลดจำนวน"
                className="w-12 h-12 flex items-center justify-center bg-white/5 text-2xl text-white/70 hover:bg-white/10 transition"
                onClick={() => setQty(q => Math.max(1, q - 1))}
              >
                -
              </button>
              <input
                id="qty"
                type="number"
                min={1}
                value={qty}
                onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                className="w-full text-center bg-transparent text-white text-xl font-bold outline-none border-0 appearance-none"
                style={{ MozAppearance: 'textfield' }}
              />
              <button
                type="button"
                aria-label="เพิ่มจำนวน"
                className="w-12 h-12 flex items-center justify-center bg-white/5 text-2xl text-white/70 hover:bg-white/10 transition"
                onClick={() => setQty(q => q + 1)}
              >
                +
              </button>
            </div>
            <div className="mt-4 w-full  mx-auto">
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ff1436] to-[#ff7a00] px-8 py-3 text-2xl font-extrabold text-white shadow-lg hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSpin}
                disabled={isAuthenticated === false}
              >
                <span className="flex space-x-1.5 items-center">
                  <Dices /> <p> สุ่มเลย! ({Number(qty * campaign.spinPrice.baht).toLocaleString()} บาท)</p>
                </span>
              </button>
              {isAuthenticated === false && (
                <div className="mt-2 text-center text-red-400 text-sm font-semibold">กรุณาเข้าสู่ระบบก่อน</div>
              )}
            </div>
          </div>

        </section>

        <section className="flex-1 flex  flex-col items-center md:items-end">
          <div className="w-full max-w-lg  rounded-2xl  border   border-white/15 bg-gradient-to-b from-[#181818] to-[#101010] p-6">
            <h2 className="text-lg border-l-4  border-red-500 pl-2 font-bold text-white mb-4 text-left">ของรางวัลที่มีโอกาสได้รับ</h2>
            <div className="grid grid-cols-3 gap-4">
              {milestones.map((m: any) => {
                // Determine border and aura color by poolType
                let borderColor = "border-white/10";
                let aura = "";
                if (m.poolType === "JACKPOT") {
                  borderColor = "border-yellow-400";
                  aura = "shadow-[0_0_24px_8px_rgba(250,204,21,0.2)]"; // gold aura
                } else if (m.poolType === "SMALL") {
                  borderColor = "border-gray-400";
                  aura = "shadow-[0_0_16px_4px_rgba(156,163,175,0.1)]"; // gray aura
                }
                return (
                  <div
                    key={m.id}
                    className={`rounded-xl border ${borderColor} bg-gradient-to-b from-[#232323] to-[#181818] p-4 flex flex-col items-center ${aura}`}
                  >

                    <div className={`relative w-16 h-16 mb-2 flex items-center justify-center`}>
                      <div className={`absolute inset-0 rounded-lg pointer-events-none ${aura}`}></div>
                      <Image
                        src={m.reward.imageUrl || NO_IMAGE}
                        alt={m.reward.title}
                        fill
                        className="object-cover rounded-lg border border-white/10 bg-black relative z-10"
                        unoptimized={!!m.reward.imageUrl === false}
                      />
                    </div>
                    <div className="text-white font-semibold text-base text-center">{m.reward.title}</div>
                    {m.reward.description && (
                      <div className="text-xs text-white/60 text-center mt-1">{m.reward.description}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}