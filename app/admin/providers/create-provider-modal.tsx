"use client";

import { useEffect, useState } from "react";

export type CreateProviderPayload = {
  slug: string;
  displayName: string;
  baseUrl: string;
  username: string;
  password: string;
  callbackIps: string[];
};

type CreateProviderModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateProviderPayload) => Promise<void>;
};

const initialForm = {
  slug: "",
  displayName: "",
  baseUrl: "",
  username: "",
  password: "",
  callbackIpsText: "",
};

export default function CreateProviderModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateProviderModalProps) {
  const [slug, setSlug] = useState(initialForm.slug);
  const [displayName, setDisplayName] = useState(initialForm.displayName);
  const [baseUrl, setBaseUrl] = useState(initialForm.baseUrl);
  const [username, setUsername] = useState(initialForm.username);
  const [password, setPassword] = useState(initialForm.password);
  const [callbackIpsText, setCallbackIpsText] = useState(initialForm.callbackIpsText);

  useEffect(() => {
    if (!isOpen) {
      setSlug(initialForm.slug);
      setDisplayName(initialForm.displayName);
      setBaseUrl(initialForm.baseUrl);
      setUsername(initialForm.username);
      setPassword(initialForm.password);
      setCallbackIpsText(initialForm.callbackIpsText);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    const callbackIps = callbackIpsText
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    await onSubmit({
      slug: slug.trim(),
      displayName: displayName.trim(),
      baseUrl: baseUrl.trim(),
      username: username.trim(),
      password,
      callbackIps,
    });
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">เพิ่ม Provider</h2>
        <p className="mt-1 text-sm text-white/70">กรอกข้อมูลสำหรับสร้าง provider ใหม่</p>

        <div className="mt-4 grid gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              disabled={isSubmitting}
              placeholder="เช่น wondd"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Display Name</span>
            <input
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              disabled={isSubmitting}
              placeholder="เช่น WONDD"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Base URL</span>
            <input
              value={baseUrl}
              onChange={(event) => setBaseUrl(event.target.value)}
              disabled={isSubmitting}
              placeholder="https://www.example.com"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Username</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                disabled={isSubmitting}
                placeholder="Provider username"
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Password</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={isSubmitting}
                placeholder="Provider password"
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Callback IPs (คั่นด้วย comma หรือขึ้นบรรทัดใหม่)</span>
            <textarea
              value={callbackIpsText}
              onChange={(event) => setCallbackIpsText(event.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="เช่น 1.1.1.1,2.2.2.2"
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "กำลังสร้าง..." : "สร้าง Provider"}
          </button>
        </div>
      </div>
    </div>
  );
}