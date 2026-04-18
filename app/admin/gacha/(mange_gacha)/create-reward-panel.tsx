"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";
import EditRewardPanel from "./edit-reward-panel";

type RewardKind = "CREDIT" | "POINT" | "MANUAL_CLAIM";
type RewardTab = "create" | "edit";

const rewardKindOptions: Array<{ value: RewardKind; label: string }> = [
  { value: "CREDIT", label: "CREDIT (ได้เงิน)" },
  { value: "POINT", label: "POINT (ได้ point)" },
  { value: "MANUAL_CLAIM", label: "MANUAL_CLAIM (ติดต่อรับเอง)" },
];

type CreateRewardPanelProps = {
  campaignId: string;
};

type CreateRewardPayload = {
  campaignId: string;
  title: string;
  kind: RewardKind;
  imageUrl: string;
  rewardSatang?: number;
  rewardPoints?: number;
  claimMessage?: string;
};

export default function CreateRewardPanel({ campaignId }: CreateRewardPanelProps) {
  const [activeTab, setActiveTab] = useState<RewardTab>("create");
  const [editRefreshToken, setEditRefreshToken] = useState(0);
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<RewardKind>("CREDIT");
  const [imageUrl, setImageUrl] = useState("");
  const [rewardSatang, setRewardSatang] = useState("0");
  const [rewardPoints, setRewardPoints] = useState("0");
  const [claimMessage, setClaimMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const helperText = useMemo(() => {
    if (kind === "CREDIT") {
      return "ระบุจำนวนเครดิตที่ต้องการให้ผู้ใช้";
    }

    if (kind === "POINT") {
      return "ระบุจำนวน point ที่ต้องการให้ผู้ใช้";
    }

    return "ระบุข้อความสำหรับขั้นตอนการติดต่อรับรางวัล";
  }, [kind]);

  const handleSubmit = async () => {
    const payload: CreateRewardPayload = {
      campaignId,
      title: title.trim(),
      kind,
      imageUrl: imageUrl.trim(),
    };

    if (!payload.title) {
      toast.error("กรุณากรอกชื่อรางวัล");
      return;
    }



    if (kind === "CREDIT") {
      const satang = Number(rewardSatang);
      if (Number.isNaN(satang) || satang <= 0) {
        toast.error("กรุณากรอกจำนวนเครดิตให้ถูกต้อง");
        return;
      }
      payload.rewardSatang = satang;
    }

    if (kind === "POINT") {
      const points = Number(rewardPoints);
      if (Number.isNaN(points) || points <= 0) {
        toast.error("กรุณากรอกจำนวน point ให้ถูกต้อง");
        return;
      }
      payload.rewardPoints = points;
    }

    if (kind === "MANUAL_CLAIM") {
      const message = claimMessage.trim();
      if (!message) {
        toast.error("กรุณากรอกข้อความการรับรางวัล");
        return;
      }
      payload.claimMessage = message;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(toApiUrl("/api/admin/gacha/rewards"), {
        method: "POST",
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
        throw new Error(messageFromApi || "สร้างรางวัลไม่สำเร็จ");
      }

      toast.success(messageFromApi || "สร้างรางวัลสำเร็จ");

      setTitle("");
      setImageUrl("");
      setRewardSatang("0");
      setRewardPoints("0");
      setClaimMessage("");
      setKind("CREDIT");
      setEditRefreshToken((value) => value + 1);
      setActiveTab("edit");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะสร้างรางวัล");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-blue-500/30 p-4">
        <p className="text-sm text-white/65">Campaign ID</p>
        <p className="mt-1 text-sm text-white">{campaignId}</p>
      </div>

      <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "create" ? "bg-emerald-500/20 text-emerald-100" : "text-white/65 hover:text-white"
          }`}
        >
          Create Reward
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "edit" ? "bg-sky-500/20 text-sky-100" : "text-white/65 hover:text-white"
          }`}
        >
          Edit Reward
        </button>
      </div>

      {activeTab === "create" ? (
        <>
          <div className="grid gap-3">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Reward Title</span>
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Reward Type</span>
              <select
                value={kind}
                onChange={(event) => setKind(event.target.value as RewardKind)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              >
                {rewardKindOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <p className="text-xs text-white/55">{helperText}</p>

            {kind === "CREDIT" ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Credit Amount (rewardSatang)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={rewardSatang}
                  onChange={(event) => setRewardSatang(event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            ) : null}

            {kind === "POINT" ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Point Amount (rewardPoints)</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={rewardPoints}
                  onChange={(event) => setRewardPoints(event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            ) : null}

            {kind === "MANUAL_CLAIM" ? (
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">Claim Message (claimMessage)</span>
                <textarea
                  rows={3}
                  value={claimMessage}
                  onChange={(event) => setClaimMessage(event.target.value)}
                  disabled={isSubmitting}
                  className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>
            ) : null}

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">Image URL</span>
              <input
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "กำลังสร้าง..." : "สร้างรางวัล"}
            </button>
          </div>
        </>
      ) : (
        <EditRewardPanel campaignId={campaignId} refreshToken={editRefreshToken} />
      )}
    </div>
  );
}