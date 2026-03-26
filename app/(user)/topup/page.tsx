"use client";

import { useState } from "react";
import Link from "next/link";

const topupAmounts = [100, 300, 500, 1000, 2000, 5000];
const paymentMethods = [
  {
    id: "truewallet",
    name: "True Wallet",
    description: "เติมผ่าน True Wallet ของคุณ",
    icon: "💳",
    color: "from-[#ff6b00] to-[#ff8c1a]",
  },
  {
    id: "promptpay",
    name: "PromptPay",
    description: "เติมผ่าน PromptPay ของคุณ",
    icon: "📱",
    color: "from-[#076b99] to-[#0a8fcc]",
  },
];

export default function TopupPage() {
  const [selectedMethod, setSelectedMethod] = useState("truewallet");
  const [selectedAmount, setSelectedAmount] = useState(500);
  const [phoneOrId, setPhoneOrId] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleProceed = async () => {
    if (!phoneOrId.trim()) {
      alert("กรุณากรอกเบอร์โทรศัพท์หรือ ID");
      return;
    }

    setIsLoading(true);
    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false);
      alert(`เติมเงิน ${selectedAmount} บาท ผ่าน ${paymentMethods.find(m => m.id === selectedMethod)?.name}`);
    }, 1500);
  };

  const currentMethod = paymentMethods.find(m => m.id === selectedMethod);

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 hover:text-white">
            ← กลับไปหน้าหลัก
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">เติมเงินเข้าบัญชี</h1>
          <p className="mt-2 text-white/60">เลือกวิธีการเติมและจำนวนเงินที่ต้องการ</p>
        </div>

        {/* Coming Soon Banner */}
        <div className="mb-8 rounded-2xl border-2 border-yellow-500/40 bg-yellow-500/10 p-5 sm:p-6">
          <div className="flex gap-4">
            <div className="shrink-0 text-2xl">⚠️</div>
            <div className="flex-1">
              <h2 className="font-semibold text-yellow-400">ยังไม่พร้อมให้ใช้บริการ</h2>
              <p className="mt-1 text-sm text-yellow-200/80">
                ระบบเติมเงินอยู่ระหว่างการพัฒนา คาดว่าจะเปิดให้ใช้งานในเร็ว ๆ นี้ 
                ติดตามข้อมูลข่าวสารล่าสุดจากเรา
              </p>
            </div>
          </div>
        </div>

        <div className="opacity-40 pointer-events-none">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Left: Payment Method Selection */}
          <div className="lg:col-span-1">
            <h2 className="mb-4 text-xl font-bold text-white">เลือกวิธีการเติมเงิน</h2>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition ${
                    selectedMethod === method.id
                      ? "border-[#ff1536] bg-[#ff1536]/10"
                      : "border-white/15 hover:border-white/30"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-3xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white">{method.name}</p>
                      <p className="mt-1 text-xs text-white/60">{method.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right: Amount + Checkout */}
          <div className="lg:col-span-2">
            {/* Amount Selection */}
            <div className="mb-8 rounded-2xl border border-white/15 bg-[#0a0a0a] p-6">
              <h3 className="mb-4 text-lg font-semibold text-white">เลือกจำนวนเงิน</h3>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {topupAmounts.map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setSelectedAmount(amount)}
                    className={`rounded-xl border-2 py-3 font-semibold transition ${
                      selectedAmount === amount
                        ? "border-[#ff1536] bg-[#ff1536]/20 text-[#ff5f74]"
                        : "border-white/15 text-white hover:border-white/30"
                    }`}
                  >
                    {amount.toLocaleString()} ฿
                  </button>
                ))}
              </div>

              {/* Custom Amount */}
              <div className="mt-4 flex gap-2">
                <input
                  type="number"
                  placeholder="หรือกรอกจำนวนเองที่นี่"
                  className="flex-1 rounded-lg border border-white/15 bg-[#151515] px-4 py-2 text-white placeholder-white/40 focus:border-[#ff1536] focus:outline-none"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val > 0) setSelectedAmount(val);
                  }}
                />
              </div>
            </div>

            {/* Payment Method Details */}
            <div className={`mb-8 rounded-2xl border-2  ${currentMethod?.color} p-0.5`}>
              <div className="rounded-2xl bg-[#0a0a0a] p-6">
                <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
                  <span className="text-2xl">{currentMethod?.icon}</span>
                  {currentMethod?.name}
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white/80">
                      {currentMethod?.id === "truewallet"
                        ? " True Wallet"
                        : "เบอร์โทรศัพท์ PromptPay"}
                    </label>
                    <input  
                      type="tel"
                      placeholder="ใส่ vocherCode true wallet "
                      value={phoneOrId}
                      onChange={(e) => setPhoneOrId(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-white/15 bg-[#151515] px-4 py-3 text-white placeholder-white/40 focus:border-[#ff1536] focus:outline-none"
                    />
                  </div>

                  <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                    <p className="text-sm text-white/70">
                      {currentMethod?.id === "truewallet"
                        ? "คุณจะได้ชำระผ่าน True Wallet ของคุณ ยอดเงินที่ชำระจะถูกคิดตามอัตราของ True Wallet"
                        : "คุณจะได้ชำระผ่าน PromptPay โดยส่วนข้อมูลอื่น ๆ จะแสดงหลังจากกดดำเนินการต่อ"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary & Checkout */}
            <div className="rounded-2xl border border-white/15 bg-[#0a0a0a] p-6">
              {/* <div className="mb-6 space-y-3 border-b border-white/10 pb-6">
                <div className="flex items-center justify-between">
                  <span className="text-white/70">วิธีการเติม:</span>
                  <span className="font-semibold text-white">{currentMethod?.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">จำนวนเงิน:</span>
                  <span className="text-2xl font-bold text-[#ff1536]">{selectedAmount.toLocaleString()} ฿</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-white/70">ค่าธรรมเนียม:</span>
                  <span className="font-semibold text-white">0 ฿</span>
                </div>
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <span className="font-semibold text-white">รวมทั้งสิ้น:</span>
                  <span className="text-3xl font-bold text-white">{selectedAmount.toLocaleString()} ฿</span>
                </div>
              </div> */}

              <button
                onClick={handleProceed}
                disabled={isLoading || !phoneOrId.trim()}
                className="w-full rounded-xl bg-[#ff1536] py-4 font-bold text-white transition hover:bg-[#ff2a48] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "กำลังดำเนินการ..." : "ดำเนินการต่อ"}
              </button>

              <p className="mt-4 text-center text-xs text-white/50">
                ด้วยการกดปุ่มนี้ คุณยอมรับเงื่อนไขการให้บริการและนโยบายความเป็นส่วนตัว
              </p>
            </div>
          </div>
          </div>
        </div>
      </div>
    </main>
  );
}
