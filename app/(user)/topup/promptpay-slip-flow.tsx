"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
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

const PROMPTPAY_PAYLOAD =
  "00460006000001010301402252026032872OQxUztpl0xBiqIQ5102TH91048D0C";

function formatDateTime(value?: string) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function wait(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export default function PromptpaySlipFlow() {
  const { refreshBalances } = useWalletContext();
  const [qrImage, setQrImage] = useState("");
  const [session, setSession] = useState<UploadSession | null>(null);
  const [statusDetail, setStatusDetail] =
    useState<UploadSessionStatusResponse | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [isUploadingSlip, setIsUploadingSlip] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  useEffect(() => {
    let mounted = true;

    const generateQr = async () => {
      try {
        const dataUrl = await QRCode.toDataURL(PROMPTPAY_PAYLOAD, {
          errorCorrectionLevel: "M",
          margin: 1,
          width: 420,
        });

        if (mounted) {
          setQrImage(dataUrl);
        }
      } catch {
        toast.error("สร้าง QR ไม่สำเร็จ");
      }
    };

    void generateQr();

    return () => {
      mounted = false;
    };
  }, []);

  const createUploadSession = async () => {
    setIsCreatingSession(true);

    try {
      const response = await fetch("/api/topups/slip/upload-session", {
        method: "POST",
        credentials: "include",
      });

      const payload = (await response
        .json()
        .catch(() => null)) as UploadSessionResponse | null;

      if (response.status === 401) {
        toast.error("กรุณาเข้าสู่ระบบก่อน");
        return null;
      }

      if (!response.ok || !payload?.ok || !payload.session) {
        toast.error("สร้าง upload session ไม่สำเร็จ");
        return null;
      }

      setSession(payload.session);
      setStatusDetail(null);
      return payload.session;
    } catch {
      toast.error("ไม่สามารถเชื่อมต่อระบบได้");
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  };

  const fetchSessionStatus = async (sessionId: string) => {
    const response = await fetch(`/api/topups/slip/upload-session/${sessionId}`, {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    const payload = (await response
      .json()
      .catch(() => null)) as UploadSessionStatusResponse | null;

    if (response.status === 401) {
      toast.error("กรุณาเข้าสู่ระบบก่อน");
      return null;
    }

    if (!response.ok || !payload?.ok || !payload.session) {
      toast.error("ตรวจสอบสถานะไม่สำเร็จ");
      return null;
    }

    setSession(payload.session);
    setStatusDetail(payload);
    return payload;
  };

  const resetSlipFile = () => {
    setSelectedFile(null);
    const fileInput = document.getElementById(
      "promptpay-slip-file",
    ) as HTMLInputElement | null;
    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedFile) {
      toast.error("กรุณาเลือกรูปสลิป");
      return;
    }

    setIsUploadingSlip(true);
    setIsCheckingStatus(true);

    try {
      const activeSession = session?.token ? session : await createUploadSession();

      if (!activeSession?.token) {
        return;
      }

      const formData = new FormData();
      formData.append("file", selectedFile);

      const response = await fetch(
        `/api/public/topups/slip/upload/${activeSession.token}`,
        {
          method: "POST",
          body: formData,
          credentials: "include",

        },
      );

      const payload = (await response.json().catch(() => null)) as Record<
        string,
        unknown
      > | null;
      console.log("Upload response:", payload);
      if (!response.ok || payload?.ok === false) {
        const message =
          typeof payload?.message === "string"
            ? payload.message
            : "อัปโหลดสลิปไม่สำเร็จ";
        toast.error(message); 
        return;
      }

      toast.success("อัปโหลดสลิปสำเร็จ กำลังตรวจสอบสถานะ...");

      let latestStatusPayload: UploadSessionStatusResponse | null = null;

      for (let attempt = 0; attempt < 8; attempt += 1) {
        latestStatusPayload = await fetchSessionStatus(activeSession.id);

        if (!latestStatusPayload?.session) {
          return;
        }

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

        if (attempt < 7) {
          await wait(1500);
        }
      }

      toast.info(
        `สถานะล่าสุด: ${latestStatusPayload?.session?.status ?? "PENDING"}`,
      );
      resetSlipFile();
    } catch {
      toast.error("ไม่สามารถอัปโหลดสลิปได้");
    } finally {
      setIsUploadingSlip(false);
      setIsCheckingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/15 bg-[#0a0a0a] p-5">
        <h3 className="text-lg font-bold text-white">ชำระผ่าน PromptPay</h3>
        <p className="mt-1 text-sm text-white/60">
          สแกน QR ด้านล่าง และเก็บสลิปเพื่ออัปโหลดยืนยันรายการ
        </p>

        <div className="mt-4 rounded-2xl border border-white/10 bg-white p-3">
          {qrImage ? (
            <img
              src={qrImage}
              alt="PromptPay QR"
              className="mx-auto h-auto w-full max-w-xs"
            />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-black/70">
              กำลังสร้าง QR...
            </div>
          )}
        </div>

        {/* <p className="mt-3 break-all text-xs text-white/50">
          {PROMPTPAY_PAYLOAD}
        </p> */}
      </div>

      <div className="rounded-2xl border border-white/15 bg-[#0a0a0a] p-5">
        <h3 className="text-lg font-bold text-white">ยืนยันสลิป</h3>
        <p className="mt-1 text-sm text-white/60">
          เลือกรูปสลิปแล้วกดปุ่มยืนยันครั้งเดียว ,
          อัปโหลด และเช็กสถานะให้ครบอัตโนมัติ
        </p>

       

        <div className="mt-5">
          <label className="mb-2 block text-sm font-semibold text-white/80">
            อัปโหลดรูปสลิป
          </label>
          <input
            id="promptpay-slip-file"
            type="file"
            accept="image/*"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setSelectedFile(file);
            }}
            className="block w-full cursor-pointer rounded-lg border border-white/15 bg-[#131313] p-2 text-sm text-white file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-3 file:py-1.5 file:text-white hover:file:bg-white/20"
          />

          <button
            type="button"
            onClick={handleConfirmPayment}
            disabled={isUploadingSlip || isCreatingSession || !selectedFile}
            className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploadingSlip || isCheckingStatus
              ? "กำลังยืนยันรายการ..."
              : "ยืนยันการชำระ"}
          </button>
        </div>

      </div>
    </div>
  );
}
