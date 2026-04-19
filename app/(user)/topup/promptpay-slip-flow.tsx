"use client";

import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import generatePayload from "promptpay-qr";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";
import { useWalletContext } from "../../components/providers/wallet-context";

type UploadSession = {
  id: string;
  token: string;
  status: string;
  topupId: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
};

type UploadSessionResponse = {
  ok?: boolean;
  session?: UploadSession;
};

type UploadSessionStatusResponse = {
  ok?: boolean;
  session?: UploadSession;
  topup?: {
    id: string;
    status: string;
    channel: string;
    amount?: {
      cents?: number;
      baht?: string;
      formatted?: string;
    };
    failureCode?: string | null;
    failureReason?: string | null;
  };
};

type Props = {
  isLoggedIn: boolean;
  onRequestLogin: () => void;
};

const PROMPTPAY_PHONE = "0990072634";
const PRESET_AMOUNTS = [20, 50, 100, 200, 500, 1000];

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function PromptpaySlipFlow({ isLoggedIn, onRequestLogin }: Props) {
  const { refreshBalances } = useWalletContext();

  const [qrImage, setQrImage] = useState("");
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [session, setSession] = useState<UploadSession | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [payMobileUrl, setPayMobileUrl] = useState("");
  const [showMobileQr, setShowMobileQr] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // สร้าง QR เมื่อ amount เปลี่ยน
  useEffect(() => {
    let mounted = true;
    const generateQr = async () => {
      try {
        const payload = generatePayload(PROMPTPAY_PHONE, {
          amount: amount ?? undefined,
        });
        const dataUrl = await QRCode.toDataURL(payload, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 420,
          color: { dark: "#000000", light: "#ffffff" },
        });
        if (mounted) setQrImage(dataUrl);
      } catch {
        toast.error("สร้าง QR ไม่สำเร็จ");
      }
    };
    void generateQr();
    return () => { mounted = false; };
  }, [amount]);

  // สร้าง upload session อัตโนมัติเมื่อเข้าเพจ
  useEffect(() => {
    const autoCreate = async () => {
      const s = await createUploadSession();
      if (s?.token) {
        setPayMobileUrl(`${window.origin}/payForMobile/${s.token}`);
      }
    };
    void autoCreate();
  }, []);

  const handleSelectPreset = (val: number) => {
    setAmount(val);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (val: string) => {
    setCustomAmount(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const num = parseFloat(val);
      setAmount(!isNaN(num) && num > 0 ? num : null);
    }, 400);
  };

  const createUploadSession = async () => {
    setIsCreatingSession(true);
    try {
      const response = await fetch(toApiUrl("/api/topups/slip/upload-session"), {
        method: "POST",
        credentials: "include",
      });
      const payload = (await response.json().catch(() => null)) as UploadSessionResponse | null;

      if (response.status === 401) { toast.error("กรุณาเข้าสู่ระบบก่อน"); return null; }
      if (!response.ok || !payload?.ok || !payload.session) { toast.error("สร้าง upload session ไม่สำเร็จ"); return null; }

      setSession(payload.session);
      return payload.session;
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อระบบได้");
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const fetchSessionStatus = async (sessionId: string) => {
    const response = await fetch(toApiUrl(`/api/topups/slip/upload-session/${sessionId}`), {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as UploadSessionStatusResponse | null;

    if (response.status === 401) { toast.error("กรุณาเข้าสู่ระบบก่อน"); return null; }
    if (!response.ok || !payload?.ok || !payload.session) { toast.error("ตรวจสอบสถานะไม่สำเร็จ"); return null; }

    setSession(payload.session);
    return payload;
  };

  const resetSlipFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
  };

  // ปุ่มยืนยัน (mobile) — ดัก login
  const handleConfirmPayment = async () => {
    if (!isLoggedIn) {
      onRequestLogin();
      return;
    }

    if (!selectedFile) { toast.error("กรุณาเลือกรูปสลิป"); return; }

    setIsUploadingSlip(true);
    setIsCheckingStatus(true);

    try {
      const activeSession = session?.token ? session : await createUploadSession();
      if (!activeSession?.token) return;

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        toApiUrl(`/api/public/topups/slip/upload/${activeSession.token}`),
        { method: "POST", body: formData, credentials: "include" },
      );

      const payload = (await response.json().catch(() => null)) as Record<string, unknown> | null;

      if (!response.ok || payload?.ok === false) {
        let message = "อัปโหลดสลิปไม่สำเร็จ";
        if (payload?.provider && typeof payload.provider === "object" && "message" in payload.provider) {
          const msg = (payload.provider as { message?: string }).message;
          if (typeof msg === "string" && msg.trim()) message = msg;
        }
        toast.error(message);
        return;
      }

      toast.success("อัปโหลดสลิปสำเร็จ กำลังตรวจสอบสถานะ...");

      let latestStatusPayload: UploadSessionStatusResponse | null = null;

      for (let attempt = 0; attempt < 8; attempt++) {
        latestStatusPayload = await fetchSessionStatus(activeSession.id);
        if (!latestStatusPayload?.session) return;

        const status = latestStatusPayload.session.status;
        if (status === "SUCCESS") {
          toast.success("เติมเงินสำเร็จ");
          resetSlipFile();
          await refreshBalances();
          return;
        }
        if (status === "FAILED") {
          const reason = latestStatusPayload.topup?.failureReason;
          toast.error(reason?.trim() ? reason : "รายการไม่สำเร็จ");
          resetSlipFile();
          return;
        }
        if (attempt < 7) await wait(1500);
      }

      toast.info(`สถานะล่าสุด: ${latestStatusPayload?.session?.status ?? "PENDING"}`);
      resetSlipFile();
    } catch {
      toast.error("ไม่สามารถอัปโหลดสลิปได้");
    } finally {
      setIsUploadingSlip(false);
      setIsCheckingStatus(false);
    }
  };

  // ปุ่ม desktop QR มือถือ — ดัก login
  const handleShowMobileQr = () => {
    if (!isLoggedIn) {
      onRequestLogin();
      return;
    }
    setShowMobileQr((v) => !v);
  };

  const isLoading = isUploadingSlip || isCheckingStatus;

  return (
    <div className="space-y-4">

      {/* ── Card 1: QR + Amount Picker ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-bold text-white">ชำระผ่าน PromptPay</h3>
          <span className="text-xs text-white/40 bg-white/5 rounded-full px-3 py-1">
            099-007-2634
          </span>
        </div>
        <p className="text-xs text-white/40 mb-5">
          เลือกจำนวนเงิน → สแกน QR → อัปโหลดสลิปยืนยัน
        </p>

        {/* Preset amount buttons */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {PRESET_AMOUNTS.map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => handleSelectPreset(val)}
              className={[
                "rounded-xl py-2.5 text-sm font-semibold border transition",
                amount === val && !customAmount
                  ? "bg-white text-black border-white"
                  : "bg-white/5 text-white/70 border-white/10 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              ฿{val.toLocaleString("th-TH")}
            </button>
          ))}
        </div>

        {/* Custom amount input */}
        <input
          type="number"
          min={1}
          value={customAmount}
          placeholder="กรอกจำนวนเงินเอง (บาท)"
          onChange={(e) => handleCustomAmountChange(e.target.value)}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-white/30 mb-5"
        />

        {/* QR */}
        <div className="rounded-2xl border border-white/10 w-fit mx-auto bg-white p-3 mb-3">
          {qrImage ? (
            <div>
              <p className="text-blue-600 text-center text-sm font-bold mb-2">สแกน QR PromptPay</p>
              <img src={qrImage} alt="PromptPay QR" className="mx-auto" />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center text-sm text-black/40">
              กำลังสร้าง QR...
            </div>
          )}
        </div>

        {amount && (
          <p className="text-center text-xs text-white/40">
            จำนวน{" "}
            <span className="text-white font-semibold">
              ฿{amount.toLocaleString("th-TH")}
            </span>{" "}
            · PromptPay 099-007-2634
          </p>
        )}
      </div>

      {/* ── Card 2: Upload slip ── */}
      <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5">
        <h3 className="text-base font-bold text-white mb-1">ยืนยันสลิป</h3>
        <p className="text-xs text-white/40 mb-5">
          เลือกรูปสลิปแล้วกดปุ่มยืนยันครั้งเดียว — อัปโหลดและเช็กสถานะอัตโนมัติ
        </p>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFileSelect(e.dataTransfer.files?.[0] ?? null);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={[
            "flex flex-col items-center justify-center w-full h-48 rounded-2xl border-2 border-dashed cursor-pointer transition mb-4",
            selectedFile
              ? "border-emerald-500/60 bg-emerald-500/5"
              : isDragging
              ? "border-[#ff001f]/60 bg-[#ff001f]/5"
              : "border-white/15 bg-white/[0.02] hover:bg-white/5 hover:border-white/25",
          ].join(" ")}
        >
          {selectedFile ? (
            <div className="flex flex-col items-center gap-2 px-4 text-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#34d399" strokeWidth="1.5"/>
                <path d="M8 12l3 3 5-5" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-sm font-semibold text-emerald-400 break-all">
                {selectedFile.name}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); resetSlipFile(); }}
                className="text-xs text-white/30 hover:text-white/60 transition mt-1"
              >
                เปลี่ยนไฟล์
              </button>
            </div>
          ) : (
            <>
              <svg className="mb-2 opacity-40" width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 3v12m0-12L8 7m4-4 4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                <rect x="3" y="15" width="18" height="6" rx="2" stroke="white" strokeWidth="1.2"/>
              </svg>
              <span className="text-sm text-white/40 font-medium">
                ลากไฟล์มาวาง หรือคลิกเพื่อเลือก
              </span>
              <span className="text-xs text-white/20 mt-1">รองรับ JPG, PNG, WEBP</span>
            </>
          )}
        </div>

        <input
          ref={fileInputRef}
          id="promptpay-slip-file"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
        />

        {/* ปุ่ม desktop: QR มือถือ */}
       
          <div className="hidden lg:block mb-3">
            <button
              type="button"
              onClick={handleShowMobileQr}
              className="w-full rounded-xl bg-[#ff001f] hover:bg-[#ff2742] px-4 py-3 text-sm font-bold text-white transition focus:outline-none"
            >
              {!isLoggedIn
                ? "เข้าสู่ระบบเพื่อชำระสลิปผ่านมือถือ"
                : showMobileQr
                ? "ซ่อน QR มือถือ"
                : "ชำระสลิปผ่านมือถือ — ไม่ต้องโยกไฟล์"}
            </button>

            {showMobileQr && (
              <div className="mt-4 flex flex-col items-center gap-3">
                <p className="text-xs text-white/50">
                  สแกน QR นี้ด้วยมือถือเพื่อเปิดหน้าอัปโหลดสลิปโดยตรง
                </p>
                <div className="rounded-xl bg-white p-3">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(payMobileUrl)}`}
                    alt="Mobile Payment QR"
                    className="mx-auto w-[200px] h-[200px]"
                  />
                </div>
                <a
                  href={payMobileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 underline break-all"
                >
                  {payMobileUrl}
                </a>
              </div>
            )}
          </div>

        {/* ปุ่ม mobile: ยืนยันการชำระ */}
        <button
          type="button"
          onClick={handleConfirmPayment}
          disabled={isLoading || isCreatingSession}
          className="lg:hidden inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading
            ? "กำลังยืนยันรายการ..."
            : !isLoggedIn
            ? "เข้าสู่ระบบเพื่อยืนยันการชำระ"
            : "ยืนยันการชำระ"}
        </button>
      </div>

    </div>
  );
}