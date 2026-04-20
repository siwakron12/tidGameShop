"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

type AuthRegisterFormProps = {
  onSuccess: () => void;
  onBusyChange: (isBusy: boolean) => void;
  onAcceptTermsChange?: (accept: boolean) => void;
};

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === "string" && error.trim().length > 0) {
    return error;
  }

  if (error && typeof error === "object") {
    const record = error as Record<string, unknown>;

    if (typeof record.message === "string" && record.message.trim().length > 0) {
      return record.message;
    }
  }

  return fallback;
}

export default function AuthRegisterForm({ onSuccess, onBusyChange, onAcceptTermsChange }: AuthRegisterFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const hasMinLength = password.length >= 8;
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const passwordMatched = confirmPassword.length > 0 && password === confirmPassword;
  const shouldShowPasswordGuide = password.length > 0 || confirmPassword.length > 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const missingRequirements: string[] = [];

    if (!name.trim()) {
      missingRequirements.push("กรอกชื่อผู้ใช้");
    }

    if (!email.trim()) {
      missingRequirements.push("กรอกอีเมล");
    }

    if (!password) {
      missingRequirements.push("กรอกรหัสผ่าน");
    }

    if (!confirmPassword) {
      missingRequirements.push("กรอกยืนยันรหัสผ่าน");
    }

    if (password && !/[a-z]/.test(password)) {
      missingRequirements.push("รหัสผ่านต้องมีตัวพิมพ์เล็ก");
    }

    if (password && !/[A-Z]/.test(password)) {
      missingRequirements.push("รหัสผ่านต้องมีตัวพิมพ์ใหญ่");
    }

    if (password && !/[0-9]/.test(password)) {
      missingRequirements.push("รหัสผ่านต้องมีตัวเลข");
    }

    if (password && password.length < 8) {
      missingRequirements.push("รหัสผ่านอย่างน้อย 8 ตัวอักษร");
    }

    if (password && confirmPassword && password !== confirmPassword) {
      missingRequirements.push("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
    }

    if (missingRequirements.length > 0) {
      toast.error(`กรุณาตรวจสอบข้อมูล: ${missingRequirements.join(" • ")}`);
      return;
    }

    setIsSubmitting(true);
    onBusyChange(true);

    try {
      const response = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      if (response?.error) {
        toast.error(getErrorMessage(response.error, "สมัครสมาชิกไม่สำเร็จ"));
        return;
      }

      toast.success("สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...");

      onSuccess();

    } catch (error) {
      toast.error(getErrorMessage(error, "สมัครสมาชิกไม่สำเร็จ"));
    } finally {
      setIsSubmitting(false);
      onBusyChange(false);
    }
  };

  // แจ้ง parent ทุกครั้งที่ acceptTerms เปลี่ยน (ถ้ามี prop นี้)
  function handleAcceptTermsChange(checked: boolean) {
    setAcceptTerms(checked);
    if (onAcceptTermsChange) onAcceptTermsChange(checked);
  }

  return (
    <form className="space-y-3" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="ชื่อผู้ใช้"
        value={name}
        onChange={(event) => setName(event.target.value)}
        autoComplete="name"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
      />
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
        autoComplete="new-password"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
      />
      <input
        type="password"
        placeholder="ยืนยันรหัสผ่าน"
        value={confirmPassword}
        onChange={(event) => setConfirmPassword(event.target.value)}
        autoComplete="new-password"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
      />

      {shouldShowPasswordGuide ? (
        <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs">
          <p className="mb-2 font-semibold text-white/80">รหัสผ่านต้องมี:</p>
          <div className="space-y-1.5">
            <p className={hasMinLength ? "text-emerald-400" : "text-white/55"}>
              {hasMinLength ? "✓" : "•"} อย่างน้อย 8 ตัวอักษร
            </p>
            <p className={hasLowercase ? "text-emerald-400" : "text-white/55"}>
              {hasLowercase ? "✓" : "•"} ตัวพิมพ์เล็ก (a-z)
            </p>
            <p className={hasUppercase ? "text-emerald-400" : "text-white/55"}>
              {hasUppercase ? "✓" : "•"} ตัวพิมพ์ใหญ่ (A-Z)
            </p>
            <p className={hasNumber ? "text-emerald-400" : "text-white/55"}>
              {hasNumber ? "✓" : "•"} ตัวเลข (0-9)
            </p>
            <p className={passwordMatched ? "text-emerald-400" : "text-white/55"}>
              {passwordMatched ? "✓" : "•"} รหัสผ่านและยืนยันรหัสผ่านตรงกัน
            </p>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 mt-2">
        <input
          id="acceptTerms"
          type="checkbox"
          checked={acceptTerms}
          onChange={e => handleAcceptTermsChange(e.target.checked)}
          disabled={isSubmitting}
          className="h-4 w-4"
          style={{ accentColor: "#ff001f" }}
        />
        <label htmlFor="acceptTerms" className="text-xs text-white/70 select-none cursor-pointer">
          ฉันยอมรับ <a href="/terms" target="_blank" className="underline text-white/80">เงื่อนไขการใช้งาน</a>
        </label>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !acceptTerms}
        className="h-11 w-full rounded-xl bg-[#ff001f] text-sm font-black tracking-wide text-white transition hover:bg-[#ff2742] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>

      {/* ปุ่ม Login ด้วย Google (ถ้ามี) - ย้ายไปควบคุมใน AuthModal */}

    </form>
  );
}
