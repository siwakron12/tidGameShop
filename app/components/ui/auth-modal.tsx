"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type AuthTab = "login" | "register";

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<AuthTab>("login");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!mounted) {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={onClose}
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
              <h2 className="text-xl font-bold text-white">บัญชีผู้ใช้</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md px-2 py-1 text-sm font-semibold text-white/70 transition hover:bg-white/10 hover:text-white"
              >
                ปิด
              </button>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-xl bg-white/5 p-1">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  activeTab === "login"
                    ? "bg-[#ff001f] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                เข้าสู่ระบบ
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                  activeTab === "register"
                    ? "bg-[#ff001f] text-white"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                สมัครสมาชิก
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {activeTab === "login" ? (
                <motion.form
                  key="login"
                  className="space-y-3"
                  initial={{ x: -18, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 18, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <input
                    type="email"
                    placeholder="อีเมล"
                    className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
                  />
                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
                  />
                  <button
                    type="button"
                    className="h-11 w-full rounded-xl bg-[#ff001f] text-sm font-black tracking-wide text-white transition hover:bg-[#ff2742]"
                  >
                    เข้าสู่ระบบ
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="register"
                  className="space-y-3"
                  initial={{ x: 18, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -18, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                >
                  <input
                    type="text"
                    placeholder="ชื่อผู้ใช้"
                    className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
                  />
                  <input
                    type="email"
                    placeholder="อีเมล"
                    className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
                  />
                  <input
                    type="password"
                    placeholder="รหัสผ่าน"
                    className="h-11 w-full rounded-xl border border-white/15 bg-[#1d1d1d] px-3 text-sm text-white outline-none placeholder:text-white/45 focus:border-[#ff001f]"
                  />
                  <button
                    type="button"
                    className="h-11 w-full rounded-xl bg-[#ff001f] text-sm font-black tracking-wide text-white transition hover:bg-[#ff2742]"
                  >
                    สมัครสมาชิก
                  </button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
