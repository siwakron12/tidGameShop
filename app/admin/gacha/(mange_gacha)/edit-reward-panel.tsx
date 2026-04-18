"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";

type RewardKind = "CREDIT" | "POINT" | "MANUAL_CLAIM";

type RewardItem = {
  id: string;
  campaignId: string;
  title: string;
  kind: RewardKind;
  imageUrl: string | null;
  rewardSatang: {
    cents?: number;
    baht?: string;
    formatted?: string;
  } | null;
  rewardPoints: number | null;
  claimMessage: string | null;
};

type CampaignResponse = {
  rewards?: RewardItem[];
};

type EditRewardPanelProps = {
  campaignId: string;
  refreshToken?: number;
};

type UpdateRewardPayload = Partial<{
  title: string;
  imageUrl: string | null;
  rewardSatang: number;
  rewardPoints: number;
  claimMessage: string;
}>;

function toRewardSatangInput(value: RewardItem["rewardSatang"]): string {
  if (!value) {
    return "0";
  }

  if (typeof value.cents === "number") {
    return String(Math.round(value.cents / 100));
  }

  if (value.baht) {
    return value.baht;
  }

  if (value.formatted) {
    return value.formatted;
  }

  return "0";
}

function rewardSatangToNumber(value: RewardItem["rewardSatang"]): number {
  if (!value) {
    return 0;
  }

  if (typeof value.cents === "number") {
    return Math.round(value.cents / 100);
  }

  const parsed = Number(value.baht ?? value.formatted ?? "0");
  return Number.isNaN(parsed) ? 0 : parsed;
}

function rewardKindLabel(kind: RewardKind): string {
  if (kind === "CREDIT") {
    return "CREDIT (เครดิต)";
  }

  if (kind === "POINT") {
    return "POINT (พอยต์)";
  }

  return "MANUAL_CLAIM (ติดต่อรับเอง)";
}

export default function EditRewardPanel({ campaignId, refreshToken = 0 }: EditRewardPanelProps) {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [selectedRewardId, setSelectedRewardId] = useState("");

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rewardSatang, setRewardSatang] = useState("0");
  const [rewardPoints, setRewardPoints] = useState("0");
  const [claimMessage, setClaimMessage] = useState("");

  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedReward = useMemo(
    () => rewards.find((item) => item.id === selectedRewardId) ?? null,
    [rewards, selectedRewardId],
  );

  const loadRewards = async (showErrorToast = true) => {
    setIsLoadingRewards(true);

    try {
      const response = await fetch(toApiUrl(`/api/admin/gacha/campaigns/${campaignId}`), {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      let messageFromApi = "";
      let payload: CampaignResponse = {};
      try {
        payload = (await response.json()) as CampaignResponse;
      } catch {
        payload = {};
      }

      if (!response.ok) {
        if (typeof (payload as { message?: string })?.message === "string") {
          messageFromApi = (payload as { message?: string }).message ?? "";
        }
        throw new Error(messageFromApi || "โหลดรายการ reward ไม่สำเร็จ");
      }

      const nextRewards = Array.isArray(payload.rewards) ? payload.rewards : [];
      setRewards(nextRewards);

      if (nextRewards.length === 0) {
        setSelectedRewardId("");
        return;
      }

      setSelectedRewardId((current) => {
        const exists = nextRewards.some((reward) => reward.id === current);
        return exists ? current : nextRewards[0]?.id ?? "";
      });
    } catch (error) {
      if (showErrorToast) {
        toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะโหลด rewards");
      }
    } finally {
      setIsLoadingRewards(false);
    }
  };

  useEffect(() => {
    void loadRewards();
  }, [campaignId, refreshToken]);

  useEffect(() => {
    if (!selectedReward) {
      setTitle("");
      setImageUrl("");
      setRewardSatang("0");
      setRewardPoints("0");
      setClaimMessage("");
      return;
    }

    setTitle(selectedReward.title ?? "");
    setImageUrl(selectedReward.imageUrl ?? "");
    setRewardSatang(toRewardSatangInput(selectedReward.rewardSatang));
    setRewardPoints(String(selectedReward.rewardPoints ?? 0));
    setClaimMessage(selectedReward.claimMessage ?? "");
  }, [selectedReward]);

  const handleSubmit = async () => {
    if (!selectedReward) {
      toast.error("ไม่พบ reward ที่ต้องการแก้ไข");
      return;
    }

    const payload: UpdateRewardPayload = {};

    const nextTitle = title.trim();
    if (!nextTitle) {
      toast.error("กรุณากรอกชื่อรางวัล");
      return;
    }
    if (nextTitle !== selectedReward.title) {
      payload.title = nextTitle;
    }

    const nextImageUrl = imageUrl.trim() || null;
    if (nextImageUrl !== selectedReward.imageUrl) {
      payload.imageUrl = nextImageUrl;
    }

    if (selectedReward.kind === "CREDIT") {
      const nextAmount = Number(rewardSatang);
      if (Number.isNaN(nextAmount) || nextAmount <= 0) {
        toast.error("กรุณากรอกจำนวนเครดิตให้ถูกต้อง");
        return;
      }

      const currentAmount = rewardSatangToNumber(selectedReward.rewardSatang);
      if (nextAmount !== currentAmount) {
        payload.rewardSatang = nextAmount;
      }
    }

    if (selectedReward.kind === "POINT") {
      const nextAmount = Number(rewardPoints);
      if (Number.isNaN(nextAmount) || nextAmount <= 0) {
        toast.error("กรุณากรอกจำนวน point ให้ถูกต้อง");
        return;
      }

      const currentAmount = selectedReward.rewardPoints ?? 0;
      if (nextAmount !== currentAmount) {
        payload.rewardPoints = nextAmount;
      }
    }

    if (selectedReward.kind === "MANUAL_CLAIM") {
      const nextMessage = claimMessage.trim();
      if (!nextMessage) {
        toast.error("กรุณากรอกข้อความการรับรางวัล");
        return;
      }

      const currentMessage = selectedReward.claimMessage ?? "";
      if (nextMessage !== currentMessage) {
        payload.claimMessage = nextMessage;
      }
    }

    if (Object.keys(payload).length === 0) {
      toast.info("ยังไม่มีข้อมูลที่เปลี่ยนแปลง");
      return;
    }

    setIsSaving(true);

    try {
      console.log("[PATCH Reward Payload]:", payload);

      const response = await fetch(toApiUrl(`/api/admin/gacha/rewards/${selectedReward.id}`), {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[PATCH Response]", {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });

      let messageFromApi = "";
      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
        const msg = (responseBody as { message?: string })?.message;
        if (typeof msg === "string") {
          messageFromApi = msg;
        }
      } catch {
        messageFromApi = "";
      }

      if (!response.ok) {
        console.error("[PATCH Error Response Body]:", responseBody);
        throw new Error(messageFromApi || `HTTP ${response.status}: บันทึกการแก้ไข reward ไม่สำเร็จ`);
      }

      toast.success(messageFromApi || "บันทึกการแก้ไข reward สำเร็จ");
      await loadRewards(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะบันทึก reward");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm text-white/65">Campaign ID </p>
        <p className="mt-1 text-sm text-white">{campaignId}</p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">เลือกรางวัลที่ต้องการแก้ไข</p>
        <div className="mt-3 grid gap-3">
          {isLoadingRewards ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/60">
              กำลังโหลด rewards...
            </div>
          ) : rewards.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/60">
              ยังไม่มี reward ในแคมเปญนี้
            </div>
          ) : (
            rewards.map((reward) => (
              <button
                key={reward.id}
                type="button"
                onClick={() => setSelectedRewardId(reward.id)}
                disabled={isSaving}
                className={`rounded-xl border px-4 py-3 text-left transition ${
                  selectedRewardId === reward.id
                    ? "border-sky-400/50 bg-sky-500/15"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
                } disabled:cursor-not-allowed disabled:opacity-60`}
              >
                <p className="text-sm font-semibold text-white">{reward.title}</p>
                <p className="mt-0.5 text-xs text-white/55">
                  {reward.kind} | {reward.id}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {selectedReward ? (
        <div className="grid gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">ประเภท (เปลี่ยนไม่ได้)</span>
            <input
              value={rewardKindLabel(selectedReward.kind)}
              disabled
              className="h-10 rounded-lg border border-white/15 bg-black/30 px-3 text-sm text-white/70 outline-none disabled:cursor-not-allowed"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">ชื่อรางวัล</span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              disabled={isSaving}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          {selectedReward.kind === "CREDIT" ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">จำนวนเครดิต (rewardSatang)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={rewardSatang}
                onChange={(event) => setRewardSatang(event.target.value)}
                disabled={isSaving}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          ) : null}

          {selectedReward.kind === "POINT" ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">จำนวนพอยต์ (rewardPoints)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={rewardPoints}
                onChange={(event) => setRewardPoints(event.target.value)}
                disabled={isSaving}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          ) : null}

          {selectedReward.kind === "MANUAL_CLAIM" ? (
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">ข้อความรับรางวัล (claimMessage)</span>
              <textarea
                rows={3}
                value={claimMessage}
                onChange={(event) => setClaimMessage(event.target.value)}
                disabled={isSaving}
                className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          ) : null}

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">ลิงก์รูป (imageUrl)</span>
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              disabled={isSaving}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="rounded-lg border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/60">
          {isLoadingRewards ? "กำลังโหลด rewards..." : "ยังไม่มี reward ในแคมเปญนี้"}
        </div>
      )}
    </div>
  );
}
