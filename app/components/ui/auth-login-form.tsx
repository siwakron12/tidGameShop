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

  return (
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
      <button
        type="submit"
        disabled={isSubmitting}
        className="h-11 w-full rounded-xl bg-[#ff001f] text-sm font-black tracking-wide text-white transition hover:bg-[#ff2742]"
      >
        {isSubmitting ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>
    </form>
  );
}
