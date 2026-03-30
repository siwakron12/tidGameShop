"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useWalletContext } from "../../components/providers/wallet-context";
import PromptpaySlipFlow from "./promptpay-slip-flow";

const paymentMethods = [
  {
    id: "truewallet",
    name: "True Wallet",
    description: "เติมผ่านลิงก์ซองอั่งเปา True Wallet",
    icon: "https://i.pinimg.com/564x/f5/3d/58/f53d58e983d9f5861bc1c922b2290512.jpg",
    color: "from-[#ff6b00] to-[#ff8c1a]",
    enabled: true,
  },
  {
    id: "promptpay",
    name: "PromptPay (Slip)",
    description: "สแกน QR + อัปโหลดสลิป + เช็กสถานะ",
    icon: "https://play-lh.googleusercontent.com/GvujuF3wamhOIulvX-dWtx3GOyfjLW7BQki87Xd875TJzYANBQGGENtHNfS4uw8xx4Y",
    color: "from-[#076b99] to-[#0a8fcc]",
    enabled: true,
  },
] as const;

export default function TopupPage() {
  const { refreshBalances } = useWalletContext();
  const [selectedMethod, setSelectedMethod] = useState<string>("truewallet");
  const [voucherUrl, setVoucherUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const currentMethod = paymentMethods.find((m) => m.id === selectedMethod);

  const handleProceed = async () => {
    if (selectedMethod !== "truewallet") {
      toast.info("รองรับเฉพาะ True Wallet ชั่วคราว");
      return;
    }

    const normalizedVoucherUrl = voucherUrl.trim();

    if (!normalizedVoucherUrl) {
      toast.error("กรุณากรอกลิงก์ซองอั่งเปา True Wallet");
      return;
    }

    if (!normalizedVoucherUrl.includes("gift.truemoney.com/campaign")) {
      toast.error("รูปแบบลิงก์ซองอั่งเปาไม่ถูกต้อง");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/topups/truewallet", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voucherUrl: normalizedVoucherUrl,
        }),
      });

      const result = (await response.json().catch(() => null)) as
        | Record<string, unknown>
        | null;

      if (response.status === 401) {
        toast.error("กรุณาเข้าสู่ระบบก่อนเติมเงิน");
        return;
      }

      if (!response.ok || result?.ok === false) {
        const message =
          typeof result?.message === "string"
            ? result.message
            : "เติมเงินไม่สำเร็จ กรุณาลองใหม่";
        toast.error(message);
        return;
      }

      toast.success("เติมเงินสำเร็จ");
      setVoucherUrl("");
      await refreshBalances();
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อระบบเติมเงินได้");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white"
          >
            ← กลับไปหน้าหลัก
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">เติมเงินเข้าบัญชี</h1>
          <p className="mt-2 text-white/60">เลือกวิธีการเติมเงินที่ต้องการ</p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <h2 className="mb-4 text-xl font-bold text-white">เลือกวิธีการเติมเงิน</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => {
                    setSelectedMethod(method.id);
                  }}
                  disabled={!method.enabled}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                    selectedMethod === method.id
                      ? "border-[#ff1536] bg-[#ff1536]/10"
                      : "border-white/15 hover:border-white/30"
                  } ${!method.enabled ? "cursor-not-allowed opacity-55" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <img src={method.icon} alt={method.name} className="size-14 rounded-lg" />
                    <div className="flex-1">
                      <p className="font-semibold text-white">{method.name}</p>
                      <p className="mt-1 text-xs text-white/60">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedMethod === "truewallet" ? (
              <>
                <div className={`mb-8 rounded-2xl border-2 ${currentMethod?.color} p-0.5`}>
                  <div className="rounded-2xl bg-[#0a0a0a] p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                      {/* <span className="text-2xl">{currentMethod?.icon}</span> */}
                      {currentMethod?.name}
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-white/80">
                          ลิงก์ซองอั่งเปา True Wallet
                        </label>
                        <input
                          type="url"
                          placeholder="https://gift.truemoney.com/campaign/?v=..."
                          value={voucherUrl}
                          onChange={(event) => setVoucherUrl(event.target.value)}
                          disabled={isLoading}
                          className="mt-2 w-full rounded-lg border border-white/15 bg-[#151515] px-4 py-3 text-white placeholder:text-white/40 focus:border-[#ff1536] focus:outline-none"
                        />
                      </div>

                      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                        <p className="text-sm text-white/70">
                          ใส่ลิงก์ซองอั่งเปาแล้วกดปุ่มเติมเงิน ระบบจะตรวจสอบและเพิ่มยอดให้อัตโนมัติ
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/15 bg-[#0a0a0a] p-6">
                  <button
                    type="button"
                    onClick={handleProceed}
                    disabled={isLoading || !voucherUrl.trim()}
                    className="w-full rounded-xl bg-[#ff1536] py-4 font-bold text-white transition hover:bg-[#ff2a48] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isLoading ? "กำลังเติมเงิน..." : "เติมเงินด้วย True Wallet"}
                  </button>

                  <p className="mt-4 text-center text-xs text-white/50">
                    ด้วยการกดปุ่มนี้ คุณยอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว
                  </p>
                </div>
              </>
            ) : (
              <PromptpaySlipFlow />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
