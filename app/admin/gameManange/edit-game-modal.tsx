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
  providerType: string;
  uidLabel: string;
  uidPlaceholder: string;
  isActive: boolean;
  serverRequired: boolean;
  serverLabel: string;
  serverOptions: Array<{ value: string; label: string }>;
  tags: string[];
  isRecommended: boolean;
  howToImg: string;
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
    providerType: string | null;
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
  const [providerType, setProviderType] = useState("");
  const [uidLabel, setUidLabel] = useState("");
  const [uidPlaceholder, setUidPlaceholder] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [serverRequired, setServerRequired] = useState(false);
  const [serverLabel, setServerLabel] = useState("");
  const [serverOptions, setServerOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [serverOptionValue, setServerOptionValue] = useState("");
  const [serverOptionLabel, setServerOptionLabel] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isRecommended, setIsRecommended] = useState(false);
  const [howToImg, setHowToImg] = useState("");
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
    setProviderType(game.providerType ?? "");
    setUidLabel(game.uidLabel ?? "");
    setUidPlaceholder(game.uidPlaceholder ?? "");
    setIsActive(game.isActive);
    setServerRequired((game as any).serverRequired ?? false);
    setServerLabel((game as any).serverLabel ?? "");
    setServerOptions((game as any).serverOptions ?? []);
    setServerOptionValue("");
    setServerOptionLabel("");
    setTags((game as any).tags ?? []);
    setTagInput("");
    setIsRecommended((game as any).isRecommended ?? false);
    setHowToImg((game as any).howToImg ?? "");
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
      providerType: providerType.trim(),
      uidLabel: uidLabel.trim(),
      uidPlaceholder: uidPlaceholder.trim(),
      isActive,
      serverRequired,
      serverLabel: serverLabel.trim(),
      serverOptions: serverOptions.map((option) => ({
        value: option.value.trim(),
        label: option.label.trim(),
      })),
      tags: tags.map((tag) => tag.trim()).filter(Boolean),
      isRecommended,
      howToImg: howToImg.trim(),
    });
  };

  const addTag = () => {
    const nextTag = tagInput.trim();
    if (!nextTag) return;
    setTags((current) => (current.includes(nextTag) ? current : [...current, nextTag]));
    setTagInput("");
  };

  const removeTag = (indexToRemove: number) => {
    setTags((current) => current.filter((_, index) => index !== indexToRemove));
  };
          
  const addServerOption = () => {
    const nextValue = serverOptionValue.trim();
    const nextLabel = serverOptionLabel.trim();
    if (!nextValue || !nextLabel) return;
    setServerOptions((current) => [...current, { value: nextValue, label: nextLabel }]);
    setServerOptionValue("");
    setServerOptionLabel("");
  };

  const removeServerOption = (indexToRemove: number) => {
    setServerOptions((current) => current.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">แก้ไขเกม</h2>
        <p className="mt-1 text-sm text-white/70">แก้ไขข้อมูลเกม และบันทึกผ่าน API PATCH</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
                              {/* HOW TO IMG FIELD */}
                          
                    {/* TAGS FIELD */}
       

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
                                <span className="text-xs font-semibold text-white/60">How To Image URL</span>
                                <input
                                  value={howToImg}
                                  onChange={(event) => setHowToImg(event.target.value)}
                                  disabled={isSubmitting}
                                  placeholder="URL ของภาพวิธีเติมเกม"
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
            <span className="text-xs font-semibold text-white/60">Provider Type</span>
            <input
              value={providerType}
              onChange={(event) => setProviderType(event.target.value)}
              disabled={isSubmitting}
              placeholder="mtopup"
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
               <label className="flex items-center gap-2 pt-1 md:col-span-2">
                      <input
                        type="checkbox"
                        checked={serverRequired}
                        onChange={(event) => setServerRequired(event.target.checked)}
                        disabled={isSubmitting}
                        className="h-4 w-4"
                      />
                      <span className="text-sm text-white/80">serverRequired</span>
                    </label>

                    <label className="flex flex-col gap-1 md:col-span-2">
                      <span className="text-xs font-semibold text-white/60">serverLabel</span>
                      <input
                        value={serverLabel}
                        onChange={(event) => setServerLabel(event.target.value)}
                        disabled={isSubmitting || !serverRequired}
                        placeholder="Zone ID"
                        className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </label>

                    <div className="md:col-span-2">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-xs font-semibold text-white/60">serverOptions</span>
                        <span className="text-[11px] text-white/45">
                          {serverRequired ? "required" : "optional"}
                        </span>
                      </div>

                      <div className="mt-2 grid gap-2 md:grid-cols-[1fr_1fr_auto]">
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-white/60 mb-1" htmlFor="serverOptionValue">Value</label>
                          <input
                            id="serverOptionValue"
                            value={serverOptionValue}
                            onChange={(event) => setServerOptionValue(event.target.value)}
                            disabled={isSubmitting || !serverRequired}
                            placeholder="2685"
                            className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>
                        <div className="flex flex-col">
                          <label className="text-xs font-semibold text-white/60 mb-1" htmlFor="serverOptionLabel">Label</label>
                          <input
                            id="serverOptionLabel"
                            value={serverOptionLabel}
                            onChange={(event) => setServerOptionLabel(event.target.value)}
                            disabled={isSubmitting || !serverRequired}
                            placeholder="Asia (2685)"
                            className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </div>
                        <div className="flex items-end h-full">
                          <button
                            type="button"
                            onClick={addServerOption}
                            disabled={isSubmitting || !serverRequired}
                            className="h-10 rounded-lg border border-white/20 px-4 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            เพิ่ม
                          </button>
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {serverOptions.map((option, index) => (
                          <div
                            key={`${option.value}-${index}`}
                            className="flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/80"
                          >
                            <span>
                              {option.label} · {option.value}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeServerOption(index)}
                              disabled={isSubmitting || !serverRequired}
                              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#7a2a34] bg-[#2b1418] text-base font-bold leading-none text-[#ff9ca8] hover:bg-[#3a1a20] hover:text-[#ffc1c8] disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                       <div className="md:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-semibold text-white/60">tags</span>
              <span className="text-[11px] text-white/45">optional</span>
            </div>

            <div className="mt-2 grid gap-2 md:grid-cols-[1fr_auto]">
              <input
                value={tagInput}
                onChange={(event) => setTagInput(event.target.value)}
                disabled={isSubmitting}
                placeholder="Battle Royale"
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
              />
              <button
                type="button"
                onClick={addTag}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/20 px-4 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
              >
                เพิ่มแท็ก
              </button>
            </div>

            <div className="mt-2 flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <div
                  key={`${tag}-${index}`}
                  className="flex items-center gap-2 rounded-full border border-[#35552a] bg-[#1f2b18] px-3 py-1 text-xs text-[#9ee37d]"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(index)}
                    disabled={isSubmitting}
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#7a2a34] bg-[#2b1418] text-base font-bold leading-none text-[#ff9ca8] hover:bg-[#3a1a20] hover:text-[#ffc1c8] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
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

        {/* isRecommended toggle */}
        <div className="mt-5 flex flex-col gap-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isRecommended}
              onChange={(e) => setIsRecommended(e.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4"
            />
            <span className="text-sm text-white/80">isRecommended</span>
          </label>

          <div className="flex items-center justify-end gap-2">
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
    </div>
  );
}
