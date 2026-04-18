"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={<main className="min-h-screen bg-[#090909] px-4 py-10 text-white" />}
    >
      <ResetPasswordContent />
    </Suspense>
  );
}

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") ?? "", [searchParams]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tokenPreview =
    token.length > 18 ? `${token.slice(0, 8)}...${token.slice(-8)}` : token;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      toast.error("ไม่พบ token ในลิงก์");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("กรอกรหัสผ่านใหม่ให้ครบ");
      return;
    }

    if (newPassword.length < 8) {
      toast.error("รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("รหัสผ่านใหม่และยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(toApiUrl("/api/auth/reset-password"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok || payload?.ok === false) {
        toast.error(payload?.message || "รีเซ็ตรหัสผ่านไม่สำเร็จ");
      } else {
        toast.success("รีเซ็ตรหัสผ่านเรียบร้อย");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch {
      toast.error("เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#090909] px-4 py-10 text-white">
      <div className="pointer-events-none absolute -left-24 top-0 h-56 w-56 rounded-full bg-[#ff001f]/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-16 bottom-10 h-48 w-48 rounded-full bg-[#ffffff]/10 blur-3xl" />

      <div className="relative mx-auto w-full max-w-md">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#ff4b60]">
            Password Recovery
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Reset Password</h1>
         
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm">
         

          <form className="space-y-3" onSubmit={handleSubmit}>
            <input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="รหัสผ่านใหม่"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl border border-white/15 bg-[#151515] px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#ff001f]"
            />

            <input
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="ยืนยันรหัสผ่านใหม่"
              autoComplete="new-password"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl border border-white/15 bg-[#151515] px-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-[#ff001f]"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="h-11 w-full rounded-xl bg-[#ff001f] text-sm font-black tracking-wide text-white transition hover:bg-[#ff2e47] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "กำลังรีเซ็ต" : "รีเซ็ตรหัสผ่าน "}
            </button>
          </form>

          <div className="mt-4 text-center text-xs text-white/55">
            <Link href="/" className="underline underline-offset-4 hover:text-white">
              กลับหน้าแรก
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
