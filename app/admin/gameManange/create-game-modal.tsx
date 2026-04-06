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

export type CreateGamePayload = {
  slug: string;
  name: string;
  providerId: string;
  providerGameCode: string;
  providerType: string;
  imageUrl: string;
  bannerUrl: string;
  description: string;
  uidLabel: string;
  uidPlaceholder: string;
  uidRequired: boolean;
  sortOrder: number;
};

type CreateGameModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateGamePayload) => Promise<void>;
};

const initialForm = {
  slug: "",
  name: "",
  providerId: "",
  providerGameCode: "",
  providerType: "mtopup",
  imageUrl: "",
  bannerUrl: "",
  description: "",
  uidLabel: "",
  uidPlaceholder: "",
  uidRequired: true,
  sortOrder: "1",
};

export default function CreateGameModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateGameModalProps) {
  const [slug, setSlug] = useState(initialForm.slug);
  const [name, setName] = useState(initialForm.name);
  const [providerId, setProviderId] = useState(initialForm.providerId);
  const [providerGameCode, setProviderGameCode] = useState(initialForm.providerGameCode);
  const [providerType, setProviderType] = useState(initialForm.providerType);
  const [imageUrl, setImageUrl] = useState(initialForm.imageUrl);
  const [bannerUrl, setBannerUrl] = useState(initialForm.bannerUrl);
  const [description, setDescription] = useState(initialForm.description);
  const [uidLabel, setUidLabel] = useState(initialForm.uidLabel);
  const [uidPlaceholder, setUidPlaceholder] = useState(initialForm.uidPlaceholder);
  const [uidRequired, setUidRequired] = useState(initialForm.uidRequired);
  const [sortOrder, setSortOrder] = useState(initialForm.sortOrder);
  const [providers, setProviders] = useState<ProviderOption[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [providerError, setProviderError] = useState<string | null>(null);

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

        const nextProviders = json.items;
        setProviders(nextProviders);

        if (nextProviders.length > 0) {
          const firstActive = nextProviders.find((item) => item.isActive);
          const defaultProviderId = (firstActive ?? nextProviders[0]).id;
          setProviderId((prev) => (prev ? prev : defaultProviderId));
        }
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

  useEffect(() => {
    if (!isOpen) {
      setSlug(initialForm.slug);
      setName(initialForm.name);
      setProviderId(initialForm.providerId);
      setProviderGameCode(initialForm.providerGameCode);
      setProviderType(initialForm.providerType);
      setImageUrl(initialForm.imageUrl);
      setBannerUrl(initialForm.bannerUrl);
      setDescription(initialForm.description);
      setUidLabel(initialForm.uidLabel);
      setUidPlaceholder(initialForm.uidPlaceholder);
      setUidRequired(initialForm.uidRequired);
      setSortOrder(initialForm.sortOrder);
      setProviderError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    await onSubmit({
      slug: slug.trim(),
      name: name.trim(),
      providerId: providerId.trim(),
      providerGameCode: providerGameCode.trim(),
      providerType: providerType.trim(),
      imageUrl: imageUrl.trim(),
      bannerUrl: bannerUrl.trim(),
      description: description.trim(),
      uidLabel: uidLabel.trim(),
      uidPlaceholder: uidPlaceholder.trim(),
      uidRequired,
      sortOrder: Number(sortOrder),
    });
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">เพิ่มเกม</h2>
        <p className="mt-1 text-sm text-white/70">กรอกข้อมูลเกมใหม่สำหรับ /api/admin/games (POST)</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">slug</span>
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              disabled={isSubmitting}
              placeholder="rov"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="ROV (Arena of Valor)"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">providerId</span>
            <select
              value={providerId}
              onChange={(event) => setProviderId(event.target.value)}
              disabled={isSubmitting || isLoadingProviders}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
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
            <span className="text-xs font-semibold text-white/60">providerGameCode</span>
            <input
              value={providerGameCode}
              onChange={(event) => setProviderGameCode(event.target.value)}
              disabled={isSubmitting}
              placeholder="rov"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">providerType</span>
            <input
              value={providerType}
              onChange={(event) => setProviderType(event.target.value)}
              disabled={isSubmitting}
              placeholder="mtopup"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">imageUrl</span>
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              disabled={isSubmitting}
              placeholder="https://example.com/rov.png"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">bannerUrl</span>
            <input
              value={bannerUrl}
              onChange={(event) => setBannerUrl(event.target.value)}
              disabled={isSubmitting}
              placeholder="https://example.com/rov-banner.png"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              rows={2}
              placeholder="เติม ROV Coupon"
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">uidLabel</span>
            <input
              value={uidLabel}
              onChange={(event) => setUidLabel(event.target.value)}
              disabled={isSubmitting}
              placeholder="Player ID"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">uidPlaceholder</span>
            <input
              value={uidPlaceholder}
              onChange={(event) => setUidPlaceholder(event.target.value)}
              disabled={isSubmitting}
              placeholder="เช่น 12345678"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={uidRequired}
              onChange={(event) => setUidRequired(event.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4"
            />
            <span className="text-sm text-white/80">uidRequired</span>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">sortOrder</span>
            <input
              type="number"
              min="0"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              disabled={isSubmitting}
              placeholder="1"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
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
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "กำลังสร้าง..." : "สร้างเกม"}
          </button>
        </div>
      </div>
    </div>
  );
}
