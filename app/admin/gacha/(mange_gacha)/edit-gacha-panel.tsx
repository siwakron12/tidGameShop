"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";

type CampaignStatus = "ACTIVE" | "PAUSED" | "ENDED";

type MoneyValue = {
  baht?: string;
  formatted?: string;
};

type CampaignForEdit = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: string;
  spinPrice: MoneyValue | number;
  jackpotPercent: number;
  smallPrizePercent: number;
  profitPercent: number;
};

export type EditGachaUpdatedData = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  spinPrice: number;
  jackpotPercent: number;
  smallPrizePercent: number;
  profitPercent: number;
  status: CampaignStatus;
};

type EditGachaPanelProps = {
  campaign: CampaignForEdit;
  onUpdated?: (updated: EditGachaUpdatedData) => Promise<void> | void;
};

type UpdateCampaignPayload = {
  title: string;
  description: string;
  imageUrl: string;
  spinPrice: number;
  jackpotPercent: number;
  smallPrizePercent: number;
  profitPercent: number;
  status: CampaignStatus;
};

function extractSpinPrice(value: MoneyValue | number): string {
  if (typeof value === "number") {
    return value.toString();
  }

  if (value?.baht) {
    return value.baht;
  }

  if (value?.formatted) {
    return value.formatted.replace(/,/g, "");
  }

  return "0";
}

export default function EditGachaPanel({ campaign, onUpdated }: EditGachaPanelProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [spinPrice, setSpinPrice] = useState("0");
  const [jackpotPercent, setJackpotPercent] = useState("0");
  const [smallPrizePercent, setSmallPrizePercent] = useState("0");
  const [profitPercent, setProfitPercent] = useState("0");
  const [status, setStatus] = useState<CampaignStatus>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setTitle(campaign.title ?? "");
    setDescription(campaign.description ?? "");
    setImageUrl(campaign.imageUrl ?? "");
    setSpinPrice(extractSpinPrice(campaign.spinPrice));
    setJackpotPercent(String(campaign.jackpotPercent ?? 0));
    setSmallPrizePercent(String(campaign.smallPrizePercent ?? 0));
    setProfitPercent(String(campaign.profitPercent ?? 0));

    if (campaign.status === "PAUSED" || campaign.status === "ENDED" || campaign.status === "ACTIVE") {
      setStatus(campaign.status);
    } else {
      setStatus("ACTIVE");
    }
  }, [campaign]);

  const handleSubmit = async () => {
    const payload: UpdateCampaignPayload = {
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      spinPrice: Number(spinPrice),
      jackpotPercent: Number(jackpotPercent),
      smallPrizePercent: Number(smallPrizePercent),
      profitPercent: Number(profitPercent),
      status,
    };

    if (!payload.title) {
      toast.error("กรุณากรอกชื่อแคมเปญ");
      return;
    }

    if (!payload.description) {
      toast.error("กรุณากรอกรายละเอียดแคมเปญ");
      return;
    }

    const numbers = [
      payload.spinPrice,
      payload.jackpotPercent,
      payload.smallPrizePercent,
      payload.profitPercent,
    ];

    if (numbers.some((value) => Number.isNaN(value))) {
      toast.error("กรุณากรอกตัวเลขให้ถูกต้อง");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(toApiUrl(`/api/admin/gacha/campaigns/${campaign.id}`), {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      let messageFromApi = "";
      try {
        const json = (await response.json()) as { message?: string };
        if (typeof json?.message === "string") {
          messageFromApi = json.message;
        }
      } catch {
        messageFromApi = "";
      }

      if (!response.ok) {
        throw new Error(messageFromApi || "บันทึกการแก้ไขไม่สำเร็จ");
      }

      toast.success(messageFromApi || "บันทึกการแก้ไขสำเร็จ");
      await onUpdated?.({
        id: campaign.id,
        title: payload.title,
        description: payload.description,
        imageUrl: payload.imageUrl,
        spinPrice: payload.spinPrice,
        jackpotPercent: payload.jackpotPercent,
        smallPrizePercent: payload.smallPrizePercent,
        profitPercent: payload.profitPercent,
        status: payload.status,
      });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะบันทึกการแก้ไข");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm text-white/65">Campaign ID</p>
        <p className="mt-1 text-sm text-white">{campaign.id}</p>
      </div>

      <div className="grid gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white/60">Title</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white/60">Description</span>
          <textarea
            rows={3}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
            className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-white/60">Image URL</span>
          <input
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            disabled={isSubmitting}
            className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
            <span className="text-xs font-semibold text-white/60">Status</span>
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as CampaignStatus)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="PAUSED">PAUSED</option>
              <option value="ENDED">ENDED</option>
            </select>
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

      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="rounded-lg border border-blue-400/40 bg-blue-500/15 px-4 py-2 text-sm font-semibold text-blue-100 transition hover:bg-blue-500/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
        </button>
      </div>
    </div>
  );
}
