"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type AuthLoginFormProps = {
  onSuccess: () => void;
  onBusyChange: (isBusy: boolean) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    if (
      typeof record.message === "string" &&
      record.message.trim().length > 0
    ) {
      return record.message;
    }
  }

  return fallback;
}

export default function AuthLoginForm({
  onSuccess,
  onBusyChange,
}: AuthLoginFormProps) {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password) {
      toast.error("กรอกอีเมลและรหัสผ่านให้ครบ");
      return;
    }

    setIsSubmitting(true);
    onBusyChange(true);

    try {
      const response = await authClient.signIn.email({ email, password });

      if (response?.error) {
        toast.error(getErrorMessage(response.error, "เข้าสู่ระบบไม่สำเร็จ"));
        return;
      }

      toast.success("เข้าสู่ระบบสำเร็จ");

      console.log("Login response data:", response);

      router.refresh();

      onSuccess();
    } catch (error) {
      toast.error(getErrorMessage(error, "เข้าสู่ระบบไม่สำเร็จ"));
    } finally {
      setIsSubmitting(false);
      onBusyChange(false);
    }
  };

  const closeForgotModal = () => {
    if (isResetSubmitting) {
      return;
    }

    setIsForgotModalOpen(false);
  };

  const handleForgotPasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!resetEmail.trim()) {
      toast.error("กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน");
      return;
    }

    setIsResetSubmitting(true);
    onBusyChange(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 700));
      toast.success(`Mock สำเร็จ: ส่งลิงก์รีเซ็ตไปที่ ${resetEmail.trim()}`);
      setIsForgotModalOpen(false);
    } finally {
      setIsResetSubmitting(false);
      onBusyChange(false);
    }
  };

  return (
    <>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
        />
        <input
          type="password"
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
        />
        <div className="-mt-1 flex justify-end">
          <button
            type="button"
            onClick={() => {
              setResetEmail(email.trim());
              setIsForgotModalOpen(true);
            }}
            disabled={isSubmitting}
            className="text-xs font-semibold text-white/65 transition hover:text-white"
          >
            ลืมรหัสผ่าน?
          </button>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full rounded-xl bg-[#ff001f] text-sm font-black tracking-wide text-white transition hover:bg-[#ff2742]"
        >
          {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
        </button>
      </form>

      {isForgotModalOpen ? (
        <div
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 px-4"
          onClick={closeForgotModal}
          role="presentation"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#151515] p-5 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="ลืมรหัสผ่าน"
          >
            <h3 className="text-lg font-bold text-white">ลืมรหัสผ่าน</h3>
            <p className="mt-1 text-sm text-white/60">
              กรอกอีเมลเพื่อรับลิงก์รีเซ็ตรหัสผ่าน 
            </p>

            <form className="mt-4 space-y-3" onSubmit={handleForgotPasswordSubmit}>
              <input
                type="email"
                value={resetEmail}
                onChange={(event) => setResetEmail(event.target.value)}
                placeholder="อีเมล"
                autoComplete="email"
                disabled={isResetSubmitting}
                className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
              />

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={closeForgotModal}
                  disabled={isResetSubmitting}
                  className="h-10 rounded-xl border border-white/20 text-sm font-semibold text-white/80 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={isResetSubmitting}
                  className="h-10 rounded-xl bg-[#ff001f] text-sm font-bold text-white transition hover:bg-[#ff2742] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isResetSubmitting ? "กำลังส่ง..." : "ส่งลิงก์"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
