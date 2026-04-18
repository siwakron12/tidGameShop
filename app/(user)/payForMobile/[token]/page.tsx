"use client";
import { useState } from "react";
import { useWalletContext } from "@/app/components/providers/wallet-context";
import { toast } from "sonner";
import { useParams } from "next/navigation";

export default function PayForMobilePage() {
    const wallet = useWalletContext();
    const params = useParams();
    const token = params?.token as string;
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    // const [uploadResult, setUploadResult] = useState<string | null>(null);

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
                toast.error(payload?.message || "อัปโหลดสลิปไม่สำเร็จ");
            } else {
                toast.success("อัปโหลดสลิปสำเร็จ กรุณารอสถานะยืนยัน");
                wallet.refreshBalances();
            }
        } catch {
            toast.error("เกิดข้อผิดพลาดในการอัปโหลด");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black px-2">
            <h1 className="text-2xl font-bold text-white mb-4">อัปโหลดสลิปเพื่อยืนยันการชำระเงิน</h1>
            <div className="bg-white p-4 rounded-xl shadow-lg w-full max-w-md">


                <div className="mt-5">
                    <label className="mb-2 block text-sm font-semibold text-black/80">
                        อัปโหลดรูปสลิป
                    </label>
                    <div
                        id="promptpay-slip-dropzone"
                        className="flex flex-col items-center justify-center w-full h-56 rounded-2xl border-4 border-dashed border-black/20 bg-gray-100 text-black text-lg font-semibold cursor-pointer transition hover:bg-black/5 mb-4"
                        onDragOver={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.add("border-[#ff001f]");
                        }}
                        onDragLeave={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove("border-[#ff001f]");
                        }}
                        onDrop={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            e.currentTarget.classList.remove("border-[#ff001f]");
                            const file = e.dataTransfer.files?.[0] ?? null;
                            setSelectedFile(file);
                        }}
                        onClick={() => {
                            document.getElementById("promptpay-slip-file")?.click();
                        }}
                    >
                        {selectedFile ? (
                            <span className="text-green-600">เลือกไฟล์แล้ว: {selectedFile.name}</span>
                        ) : (
                            <span className="">ลากและวางไฟล์สลิปที่นี่ หรือคลิกเพื่อเลือกไฟล์</span>
                        )}
                    </div>
                    <input
                        id="promptpay-slip-file"
                        type="file"
                        accept="image/*"
                        style={{ display: "none" }}
                        onChange={event => {
                            const file = event.target.files?.[0] ?? null;
                            setSelectedFile(file);
                        }}
                    />

                    <button
                        type="button"
                        onClick={handleConfirmPayment}
                        disabled={isUploading || !selectedFile}
                        className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-black/15 bg-[#ff001f] px-4 py-3 text-sm font-bold text-white transition hover:bg-[#ff2742] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isUploading ? "กำลังยืนยันรายการ..." : "ยืนยันการชำระ"}
                    </button>
                    {/* แจ้งเตือนด้วย toast */}
                </div>
            </div>
        </div>
    );
}
