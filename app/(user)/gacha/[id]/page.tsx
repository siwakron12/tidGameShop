"use client";
import React, { useCallback, useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import Swal from "sweetalert2";
import dynamic from "next/dynamic";
const RewardPopup = dynamic(() => import("./reward_popup"), { ssr: false });
import { useParams } from "next/navigation";
import { useWalletContext } from "../../../components/providers/wallet-context";
import Image from "next/image";
import { toApiUrl } from "@/lib/api-url";
import { Dices } from "lucide-react";
import AuthModal from "@/app/components/ui/auth-modal";

const NO_IMAGE = "https://dummyimage.com/640x640/1a1a1a/9ca3af&text=NO+IMAGE";

export default function Page() {
  const { refreshBalances } = useWalletContext();
  const { id } = useParams();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qty, setQty] = useState(1);
  const [spinResult, setSpinResult] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const loadSession = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    void loadSession();

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
  }, [id, loadSession]);

  const handleAuthModalClose = useCallback(async () => {
    setIsAuthModalOpen(false);
    await loadSession();
    await refreshBalances();
  }, [loadSession, refreshBalances]);

  if (loading) return <div className="p-10 text-center text-white">กำลังโหลด...</div>;
  if (error) return <div className="p-10 text-center text-red-400">{error}</div>;
  if (!data) return null;

  const { campaign, milestones } = data;

  async function handleSpin() {
    if (!isAuthenticated) {
      setIsAuthModalOpen(true);
      return;
    }

    const totalPrice = Number(qty * campaign.spinPrice.baht).toLocaleString();
    const confirm = await Swal.fire({
      title: "ยืนยันการสุ่ม",
      html: `<div style='font-size:1.2rem;'>จำนวน <b>${qty}</b> ครั้ง<br>ยอดที่ต้องจ่าย <span style='color:#ff1436;font-weight:bold;'>${totalPrice} บาท</span></div>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยันสุ่ม",
      cancelButtonText: "ยกเลิก",
      background: "#181818",
      color: "#fff",
      confirmButtonColor: "#ff1436",
      cancelButtonColor: "#374151",
    });
    if (!confirm.isConfirmed) return;

    try {
      const res = await fetch(toApiUrl("/api/gacha/spin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId: id, count: qty }),
        credentials: "include",
      });
      const result = await res.json();
      if (!res.ok || !result.ok) {
        toast.error(result.message || "เกิดข้อผิดพลาดในการสุ่ม");
        return;
      }
      await refreshBalances();
      setSpinResult(result);
    } catch {
      toast.error("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    }
  }

  return (
    <div className="bg-[#070707]">
      {spinResult && (
        <RewardPopup result={spinResult} onClose={() => setSpinResult(null)} />
      )}

      <main className="mx-auto  w-full max-w-7xl px-4 py-10 flex flex-col md:flex-row gap-8">
        {/* Left: info + spin */}
        <section className="flex-1 flex flex-col items-center justify-center gap-4">
          <div className="w-full flex flex-col items-center justify-center">
            <div className="relative size-98 rounded-2xl overflow-hidden border border-white/10 bg-black mx-auto">
              <Image
                src={campaign.imageUrl || NO_IMAGE}
                alt={campaign.title}
                fill
                className="object-cover"
              />
            </div>
            <h1 className="text-2xl font-bold text-white mt-4 text-center">{campaign.title}</h1>
            <p className="text-white/70 mb-2 text-center">{campaign.description}</p>
            <span className="inline-block rounded-lg bg-[#ff1436] px-4 py-1 text-white font-bold text-lg mt-2">
              {campaign.spinPrice.formatted} บาท/สุ่ม
            </span>
          </div>

          {/* Quantity + Spin button */}
          <div className="w-full mt-8">
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
                max={50}
                value={qty}
                onChange={e => setQty(Math.max(1, Math.min(50, Number(e.target.value))))}
                className="w-full text-center bg-transparent text-white text-xl font-bold outline-none border-0 appearance-none"
                style={{ MozAppearance: "textfield" }}
              />
              <button
                type="button"
                aria-label="เพิ่มจำนวน"
                className="w-12 h-12 flex items-center justify-center bg-white/5 text-2xl text-white/70 hover:bg-white/10 transition"
                onClick={() => setQty(q => Math.min(50, q + 1))}
                disabled={qty >= 50}
              >
                +
              </button>
            </div>

            <div className="mt-4 w-full mx-auto">
              <button
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-br from-[#ff1436] to-[#ff7a00] px-8 py-3 text-2xl font-extrabold text-white shadow-lg hover:scale-105 transition disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={handleSpin}
                disabled={isAuthenticated === null}
              >
                <span className="flex space-x-1.5 items-center">
                  <Dices />
                  {isAuthenticated === false ? (
                    <p>เข้าสู่ระบบเพื่อสุ่ม</p>
                  ) : (
                    <p>สุ่มเลย! ({Number(qty * campaign.spinPrice.baht).toLocaleString()} บาท)</p>
                  )}
                </span>
              </button>
            </div>
            <p className="text-white/60 text-sm mt-2  ">สุ่มได้มากสุด 50 ต่อครั้ง</p>
          </div>
        </section>

        {/* Right: rewards grid */}
        <section className="flex-1 flex flex-col items-center md:items-end">
          <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-gradient-to-b from-[#181818] to-[#101010] p-6">
            <h2 className="text-lg border-l-4 border-red-500 pl-2 font-bold text-white mb-4 text-left">
              ของรางวัลที่มีโอกาสได้รับ
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {milestones.map((m: any) => {
                let cardStyle: React.CSSProperties = {};
                let innerAuraStyle: React.CSSProperties = {};

                if (m.poolType === "JACKPOT") {
                  cardStyle = {
                    background: "linear-gradient(to bottom, #4a3800, #2a1f00)",
                    border: "1px solid #facc15",
                    boxShadow: "0 0 24px 8px rgba(250,204,21,0.35)",
                  };
                  innerAuraStyle = { boxShadow: "0 0 24px 8px rgba(250,204,21,0.35)" };
                } else if (m.poolType === "SMALL") {
                  cardStyle = {
                    background: "linear-gradient(to bottom, #3b1f6e, #1e0f3a)",
                    border: "1px solid #c084fc",
                    boxShadow: "0 0 24px 8px rgba(168,85,247,0.35)",
                  };
                  innerAuraStyle = { boxShadow: "0 0 24px 8px rgba(168,85,247,0.35)" };
                } else {
                  cardStyle = {
                    background: "linear-gradient(to bottom, #232323, #181818)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  };
                }

                return (
                  <div
                    key={m.id}
                    className="rounded-xl p-4 flex flex-col items-center"
                    style={cardStyle}
                  >
                    <div className="relative w-16 h-16 mb-2 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-lg pointer-events-none" style={innerAuraStyle} />
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

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={handleAuthModalClose}
        initialTab="login"
      />
    </div>
  );
}