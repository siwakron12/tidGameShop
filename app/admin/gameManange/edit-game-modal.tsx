"use client";

import { useEffect, useState } from "react";
import { toApiUrl } from "@/lib/api-url";

type ProviderOption = {
  id: string;
  slug: string;
  displayName: string;
  isActive: boolean;
};

type ProvidersResponse = {
  ok: boolean;
  items: ProviderOption[];
};

export type EditGamePayload = {
  imageUrl: string;
  bannerUrl: string;
  description: string;
  name: string;
  slug: string;
  providerId: string;
  providerGameCode: string;
  uidLabel: string;
  uidPlaceholder: string;
  isActive: boolean;
};

type EditGameModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  game: {
    id: string;
    imageUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    name: string;
    slug: string;
    providerGameCode: string | null;
    uidLabel: string | null;
    uidPlaceholder: string | null;
    isActive: boolean;
    provider: {
      id: string;
      displayName: string;
      slug: string;
    } | null;
  } | null;
  onClose: () => void;
  onSubmit: (payload: EditGamePayload) => Promise<void>;
};

export default function EditGameModal({
  isOpen,
  isSubmitting,
  game,
  onClose,
  onSubmit,
}: EditGameModalProps) {
  const [imageUrl, setImageUrl] = useState("");
  const [bannerUrl, setBannerUrl] = useState("");
  const [description, setDescription] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [providerId, setProviderId] = useState("");
  const [providerGameCode, setProviderGameCode] = useState("");
  const [uidLabel, setUidLabel] = useState("");
  const [uidPlaceholder, setUidPlaceholder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !game) {
      return;
    }

    setImageUrl(game.imageUrl ?? "");
    setBannerUrl(game.bannerUrl ?? "");
    setDescription(game.description ?? "");
    setName(game.name);
    setSlug(game.slug);
    setProviderId(game.provider?.id ?? "");
    setProviderGameCode(game.providerGameCode ?? "");
    setUidLabel(game.uidLabel ?? "");
    setUidPlaceholder(game.uidPlaceholder ?? "");
    setIsActive(game.isActive);
  }, [game, isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let cancelled = false;

    const fetchProviders = async () => {
      setIsLoadingProviders(true);
      setProviderError(null);

      try {
        const response = await fetch(toApiUrl("/api/admin/providers"), {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("โหลด provider ไม่สำเร็จ");
        }

        const json = (await response.json()) as ProvidersResponse;
        if (!json.ok || !Array.isArray(json.items)) {
          throw new Error("ข้อมูล provider ไม่ถูกต้อง");
        }

        if (cancelled) {
          return;
        }

        setProviders(json.items);
      } catch (error) {
        if (cancelled) {
          return;
        }

        setProviders([]);
        setProviderError(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะโหลด provider");
      } finally {
        if (!cancelled) {
          setIsLoadingProviders(false);
        }
      }
    };

    void fetchProviders();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen || !game) {
    return null;
  }

  const handleSubmit = async () => {
    await onSubmit({
      imageUrl: imageUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      description: description.trim(),
      name: name.trim(),
      slug: slug.trim(),
      providerId: providerId.trim(),
      providerGameCode: providerGameCode.trim(),
      uidLabel: uidLabel.trim(),
      uidPlaceholder: uidPlaceholder.trim(),
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">แก้ไขเกม</h2>
        <p className="mt-1 text-sm text-white/70">แก้ไขข้อมูลเกม และบันทึกผ่าน API PATCH</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Image URL</span>
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Banner URL</span>
            <input
              value={bannerUrl}
              onChange={(event) => setBannerUrl(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              rows={2}
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Provider</span>
            <select
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              disabled={isSubmitting || isLoadingProviders}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="">
                {isLoadingProviders ? "กำลังโหลด provider..." : "เลือก provider"}
              </option>
              {providers.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.displayName} ({provider.slug}){provider.isActive ? "" : " - inactive"}
                </option>
              ))}
            </select>
            {providerError ? <span className="text-xs text-[#ff9ca8]">{providerError}</span> : null}
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Provider Code</span>
            <input
              value={providerGameCode}
              onChange={(event) => setProviderGameCode(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">UID Label</span>
            <input
              value={uidLabel}
              onChange={(event) => setUidLabel(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">UID Placeholder</span>
            <input
              value={uidPlaceholder}
              onChange={(event) => setUidPlaceholder(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">isActive</span>
            <select
              value={isActive ? "true" : "false"}
              onChange={(event) => setIsActive(event.target.value === "true")}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </select>
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
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
