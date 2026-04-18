"use client";

import { useEffect, useState } from "react";

export type CreateCampaignPayload = {
  title: string;
  description: string;
  imageUrl: string;
  spinPrice: number;
  jackpotPercent: number;
  smallPrizePercent: number;
  profitPercent: number;
};

type CreateCampaignModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (payload: CreateCampaignPayload) => Promise<void>;
};

const initialForm = {
  title: "",
  description: "",
  imageUrl: "",
  spinPrice: "29",
  jackpotPercent: "40",
  smallPrizePercent: "35",
  profitPercent: "25",
};

export default function CreateCampaignModal({
  isOpen,
  isSubmitting,
  onClose,
  onSubmit,
}: CreateCampaignModalProps) {
  const [title, setTitle] = useState(initialForm.title);
  const [description, setDescription] = useState(initialForm.description);
  const [imageUrl, setImageUrl] = useState(initialForm.imageUrl);
  const [spinPrice, setSpinPrice] = useState(initialForm.spinPrice);
  const [jackpotPercent, setJackpotPercent] = useState(initialForm.jackpotPercent);
  const [smallPrizePercent, setSmallPrizePercent] = useState(initialForm.smallPrizePercent);
  const [profitPercent, setProfitPercent] = useState(initialForm.profitPercent);

  useEffect(() => {
    if (!isOpen) {
      setTitle(initialForm.title);
      setDescription(initialForm.description);
      setImageUrl(initialForm.imageUrl);
      setSpinPrice(initialForm.spinPrice);
      setJackpotPercent(initialForm.jackpotPercent);
      setSmallPrizePercent(initialForm.smallPrizePercent);
      setProfitPercent(initialForm.profitPercent);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    await onSubmit({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      spinPrice: Number(spinPrice),
      jackpotPercent: Number(jackpotPercent),
      smallPrizePercent: Number(smallPrizePercent),
      profitPercent: Number(profitPercent),
    });
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-xl rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">เพิ่มแคมเปญสุ่ม</h2>
        <p className="mt-1 text-sm text-white/70">กรอกข้อมูลเพื่อสร้าง gacha campaign ใหม่</p>

        <div className="mt-4 grid gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Title</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSubmitting}
              placeholder="สุ่มลุ้น ROV Skin"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="สุ่มรับ credit, point หรือของรางวัลพิเศษ!"
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">Image URL</span>
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              disabled={isSubmitting}
              placeholder="https://example.com/banner.png"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Spin Price (บาท)</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={spinPrice}
                onChange={(event) => setSpinPrice(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Jackpot %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={jackpotPercent}
                onChange={(event) => setJackpotPercent(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Small Prize %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={smallPrizePercent}
                onChange={(event) => setSmallPrizePercent(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Profit %</span>
              <input
                type="number"
                min="0"
                max="100"
                value={profitPercent}
                onChange={(event) => setProfitPercent(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>
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
            {isSubmitting ? "กำลังสร้าง..." : "สร้างแคมเปญ"}
          </button>
        </div>
      </div>
    </div>
  );
}