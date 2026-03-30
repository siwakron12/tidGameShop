"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { User } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import AuthLoginForm from "./auth-login-form";
import AuthRegisterForm from "./auth-register-form";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: AuthTab;
};

type AuthTab = "login" | "register";

export default function AuthModal({
  isOpen,
  onClose,
  initialTab = "login",
}: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>(initialTab);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [isOpen, onClose]);

  if (typeof document === "undefined") {
    return null;
  }

  const closeModal = () => {
    if (isSubmitting) {
      return;
    }

    onClose();
  };

  const handleGoogleSignIn = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      const callbackURL =
        typeof window !== "undefined"
          ? `${window.location.origin}/`
          : "/";

      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      if (response?.error) {
        toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
      }
    } catch {
      toast.error("เข้าสู่ระบบด้วย Google ไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={closeModal}
          role="presentation"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full max-w-md rounded-2xl border border-white/10 bg-[#121212] p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="เข้าสู่ระบบหรือสมัครสมาชิก"
            initial={{ y: 24, scale: 0.96, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 18, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
          >
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center  gap-3">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white">
                  <User size={16} strokeWidth={2.2} />
                </span>
                <h2 className="text-xl font-bold text-white">บัญชีผู้ใช้</h2>
              </div>
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-md px-2 py-1 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ปิด
              </button>
            </div>

            <div className="mb-5">
              <div className="grid grid-cols-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login");
                  }}
                  disabled={isSubmitting}
                  className={`border-b-2 px-3 cursor-pointer py-2 text-sm font-semibold transition ${
                    activeTab === "login"
                      ? "border-[#ff001f] text-white"
                      : "border-transparent text-white/55 hover:text-white/80"
                  }`}
                >
                  เข้าสู่ระบบ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register");
                  }}
                  disabled={isSubmitting}
                  className={`border-b-2 px-3 cursor-pointer py-2 text-sm font-semibold transition ${
                    activeTab === "register"
                      ? "border-[#ff001f] text-white"
                      : "border-transparent text-white/55 hover:text-white/80"
                  }`}
                >
                  สมัครสมาชิก
                </button>
              </div>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {activeTab === "login" ? (
                <motion.div
                  key="login"
                  initial={{ x: -18, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 18, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <AuthLoginForm
                    onSuccess={closeModal}
                    onBusyChange={setIsSubmitting}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="register"
                  initial={{ x: 18, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -18, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <AuthRegisterForm
                    onSuccess={closeModal}
                    onBusyChange={setIsSubmitting}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="my-4 flex items-center gap-2 text-xs text-white/45">
              <span className="h-px flex-1 bg-white/10" />
              <span>หรือ</span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleGoogleSignIn}
              className="h-11 w-full rounded-xl border border-white/20 bg-[#111] text-sm font-bold tracking-wide text-white transition hover:bg-[#1a1a1a] disabled:cursor-not-allowed disabled:opacity-60"
            >
              เข้าสู่ระบบด้วย Google
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
