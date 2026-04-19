"use client";
import { useRef, useState } from "react";
import { useWalletContext } from "@/app/components/providers/wallet-context";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function PayForMobilePage() {
  const wallet = useWalletContext();
  const params = useParams();
  const token = params?.token as string;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File | null) => {
    if (!file) return;
    setSelectedFile(file);
  };

  const resetFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmPayment = async () => {
    if (!selectedFile || !token) return;
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const response = await fetch(`/api/public/topups/slip/upload/${token}`, {
        method: "POST",
        body: formData,
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok === false) {
        console.error("Upload error:", payload);
        toast.error(payload.provider.message || "อัปโหลดสลิปไม่สำเร็จ");
      } else {
        toast.success("อัปโหลดสลิปสำเร็จ ขอบคุณที่ใช้บริการของเรา!");
        resetFile();
        wallet.refreshBalances();
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black px-4">
      <div className="w-full max-w-md space-y-4">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">ยืนยันสลิปการชำระเงิน</h1>
          <p className="text-xs text-white/40 mt-1">อัปโหลดสลิปหลังจากโอนเงินผ่าน PromptPay</p>
        </div>

        {/* Upload Card */}
        <div className="rounded-2xl border border-white/10 bg-[#0d0d0d] p-5">
          <h3 className="text-base font-bold text-white mb-1">อัปโหลดสลิป</h3>
          <p className="text-xs text-white/40 mb-5">
            เลือกรูปสลิปแล้วกดปุ่มยืนยัน — ระบบจะตรวจสอบอัตโนมัติ
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
              "flex flex-col items-center justify-center w-full h-64 rounded-2xl border-2 border-dashed cursor-pointer transition mb-4",
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
                  onClick={(e) => { e.stopPropagation(); resetFile(); }}
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
                <span className="text-sm text-white/20 font-medium">
                  ลากไฟล์มาวาง หรือคลิกเพื่อเลือก
                </span>
                <span className="text-xs text-white/20 mt-1">รองรับ JPG, PNG, WEBP</span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isUploading || !selectedFile}
            className="inline-flex w-full items-center justify-center rounded-xl bg-[#ff001f] hover:bg-[#ff2742] px-4 py-3 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isUploading ? "กำลังยืนยันรายการ..." : "ยืนยันการชำระ"}
          </button>
        </div>

      </div>
    </div>
  );
}