"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";

type RewardItem = {
  id: string;
  title: string;
  kind: "CREDIT" | "POINT" | "MANUAL_CLAIM" | string;
};

type CampaignResponse = {
  id?: string;
  title?: string;
  rewards?: RewardItem[];
  milestones?: MilestoneItem[];
  message?: string;
};

type PoolType = "JACKPOT" | "SMALL" | "NONE";

type MoneyValue = {
  cents?: number;
  baht?: string;
  formatted?: string;
};

type MilestoneItem = {
  id: string;
  campaignId: string;
  poolType: PoolType;
  thresholdAmount: MoneyValue;
  deductAmount: MoneyValue;
  rewardId: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  reward?: RewardItem | null;
  _count?: {
    payouts?: number;
  };
};

type MilestoneTab = "create" | "edit" | "delete";

type CreateMilestonePayload = {
  campaignId: string;
  rewardId: string;
  poolType: PoolType;
  thresholdAmount: number;
  deductAmount: number;
  sortOrder: number;
};

type RewardSettingsPanelProps = {
  campaignId: string;
};

type UpdateMilestonePayload = Partial<{
  rewardId: string;
  poolType: PoolType;
  thresholdAmount: number;
  deductAmount: number;
  sortOrder: number;
  isActive: boolean;
}>;

function moneyToBaht(value: MoneyValue | null | undefined): string {
  if (!value) {
    return "0";
  }

  if (typeof value.cents === "number") {
    return (value.cents / 100).toFixed(2);
  }

  if (typeof value.baht === "string" && value.baht.trim()) {
    return value.baht;
  }

  if (typeof value.formatted === "string" && value.formatted.trim()) {
    return value.formatted;
  }

  return "0";
}

function moneyToNumber(value: MoneyValue | null | undefined): number {
  const parsed = Number(moneyToBaht(value));
  return Number.isNaN(parsed) ? 0 : parsed;
}

export default function RewardSettingsPanel({ campaignId }: RewardSettingsPanelProps) {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [milestones, setMilestones] = useState<MilestoneItem[]>([]);
  const [campaignTitle, setCampaignTitle] = useState("");
  const [isLoadingRewards, setIsLoadingRewards] = useState(false);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<MilestoneTab>("create");

  const [selectedMilestoneId, setSelectedMilestoneId] = useState("");
  const [rewardId, setRewardId] = useState("");
  const [poolType, setPoolType] = useState<PoolType>("JACKPOT");
  const [thresholdAmount, setThresholdAmount] = useState("500");
  const [deductAmount, setDeductAmount] = useState("200");
  const [sortOrder, setSortOrder] = useState("1");
  const [isActive, setIsActive] = useState(true);

  const selectedMilestone = useMemo(
    () => milestones.find((item) => item.id === selectedMilestoneId) ?? null,
    [milestones, selectedMilestoneId],
  );

  useEffect(() => {
    const loadCampaign = async () => {
      setIsLoadingRewards(true);
      setIsLoadingMilestones(true);

      try {
        const response = await fetch(toApiUrl(`/api/admin/gacha/campaigns/${campaignId}`), {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        let payload: CampaignResponse = {};
        try {
          payload = (await response.json()) as CampaignResponse;
        } catch {
          payload = {};
        }

        if (!response.ok) {
          throw new Error(payload.message || "โหลดข้อมูล campaign ไม่สำเร็จ");
        }

        setCampaignTitle(payload.title || "");
        const nextRewards = Array.isArray(payload.rewards) ? payload.rewards : [];
        const nextMilestones = Array.isArray(payload.milestones) ? payload.milestones : [];
        setRewards(nextRewards);
        setMilestones(nextMilestones);
        setRewardId((current) => {
          const hasCurrent = nextRewards.some((item) => item.id === current);
          if (hasCurrent) {
            return current;
          }
          return nextRewards[0]?.id ?? "";
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะโหลดข้อมูล campaign");
      } finally {
        setIsLoadingRewards(false);
        setIsLoadingMilestones(false);
      }
    };

    void loadCampaign();
  }, [campaignId]);

  useEffect(() => {
    if (!selectedMilestone) {
      if (activeTab !== "create") {
        setSelectedMilestoneId(milestones[0]?.id ?? "");
      }
      return;
    }

    setRewardId(selectedMilestone.rewardId);
    setPoolType(selectedMilestone.poolType);
    setThresholdAmount(moneyToBaht(selectedMilestone.thresholdAmount));
    setDeductAmount(moneyToBaht(selectedMilestone.deductAmount));
    setSortOrder(String(selectedMilestone.sortOrder ?? 0));
    setIsActive(Boolean(selectedMilestone.isActive));
  }, [activeTab, milestones, selectedMilestone]);

  useEffect(() => {
    if (activeTab === "create") {
      return;
    }

    if (milestones.length === 0) {
      setSelectedMilestoneId("");
      return;
    }

    setSelectedMilestoneId((current) => {
      const exists = milestones.some((item) => item.id === current);
      return exists ? current : milestones[0]?.id ?? "";
    });
  }, [activeTab, milestones]);

  const reloadCampaign = async () => {
    const response = await fetch(toApiUrl(`/api/admin/gacha/campaigns/${campaignId}`), {
      method: "GET",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    let payload: CampaignResponse = {};
    try {
      payload = (await response.json()) as CampaignResponse;
    } catch {
      payload = {};
    }

    if (!response.ok) {
      throw new Error(payload.message || "โหลดข้อมูล campaign ไม่สำเร็จ");
    }

    setCampaignTitle(payload.title || "");
    setRewards(Array.isArray(payload.rewards) ? payload.rewards : []);
    setMilestones(Array.isArray(payload.milestones) ? payload.milestones : []);
  };

  const handleSubmit = async () => {
    if (!rewardId) {
      toast.error("กรุณาเลือก reward");
      return;
    }

    const threshold = Number(thresholdAmount);
    if (Number.isNaN(threshold) || threshold <= 0) {
      toast.error("กรุณากรอก thresholdAmount เป็นจำนวนบาทที่มากกว่า 0");
      return;
    }

    const deduct = Number(deductAmount);
    if (Number.isNaN(deduct) || deduct <= 0) {
      toast.error("กรุณากรอก deductAmount เป็นจำนวนบาทที่มากกว่า 0");
      return;
    }

    const sort = Number(sortOrder);
    if (!Number.isInteger(sort) || sort < 0) {
      toast.error("กรุณากรอก sortOrder เป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป");
      return;
    }

    const payload: CreateMilestonePayload = {
      campaignId,
      rewardId,
      poolType,
      thresholdAmount: threshold,
      deductAmount: deduct,
      sortOrder: sort,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(toApiUrl("/api/admin/gacha/milestones"), {
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
        throw new Error(messageFromApi || "สร้าง milestone ไม่สำเร็จ");
      }

      toast.success(messageFromApi || "สร้าง milestone สำเร็จ");
      setActiveTab("edit");
      await reloadCampaign();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะสร้าง milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedMilestone) {
      toast.error("กรุณาเลือก milestone ที่ต้องการแก้ไข");
      return;
    }

    const payload: UpdateMilestonePayload = {};

    const nextRewardId = rewardId.trim();
    if (nextRewardId && nextRewardId !== selectedMilestone.rewardId) {
      payload.rewardId = nextRewardId;
    }

    if (poolType !== selectedMilestone.poolType) {
      payload.poolType = poolType;
    }

    const nextThreshold = Number(thresholdAmount);
    if (Number.isNaN(nextThreshold) || nextThreshold <= 0) {
      toast.error("กรุณากรอก thresholdAmount เป็นจำนวนบาทที่มากกว่า 0");
      return;
    }
    if (nextThreshold !== moneyToNumber(selectedMilestone.thresholdAmount)) {
      payload.thresholdAmount = nextThreshold;
    }

    const nextDeduct = Number(deductAmount);
    if (Number.isNaN(nextDeduct) || nextDeduct <= 0) {
      toast.error("กรุณากรอก deductAmount เป็นจำนวนบาทที่มากกว่า 0");
      return;
    }
    if (nextDeduct !== moneyToNumber(selectedMilestone.deductAmount)) {
      payload.deductAmount = nextDeduct;
    }

    const nextSortOrder = Number(sortOrder);
    if (!Number.isInteger(nextSortOrder) || nextSortOrder < 0) {
      toast.error("กรุณากรอก sortOrder เป็นจำนวนเต็มตั้งแต่ 0 ขึ้นไป");
      return;
    }
    if (nextSortOrder !== selectedMilestone.sortOrder) {
      payload.sortOrder = nextSortOrder;
    }

    if (isActive !== selectedMilestone.isActive) {
      payload.isActive = isActive;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("ยังไม่มีข้อมูลที่เปลี่ยนแปลง");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(toApiUrl(`/api/admin/gacha/milestones/${selectedMilestone.id}`), {
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
        throw new Error(messageFromApi || "แก้ไข milestone ไม่สำเร็จ");
      }

      toast.success(messageFromApi || "แก้ไข milestone สำเร็จ");
      await reloadCampaign();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะแก้ไข milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedMilestone) {
      toast.error("กรุณาเลือก milestone ที่ต้องการลบ");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(toApiUrl(`/api/admin/gacha/milestones/${selectedMilestone.id}`), {
        method: "DELETE",
        credentials: "include",
      });

      let messageFromApi = "";
      let responseBody: unknown = null;
      try {
        responseBody = await response.json();
        const message = (responseBody as { message?: string; action?: string })?.message;
        if (typeof message === "string") {
          messageFromApi = message;
        }
      } catch {
        responseBody = null;
      }

      if (!response.ok) {
        throw new Error(messageFromApi || "ลบ milestone ไม่สำเร็จ");
      }

      const action = (responseBody as { action?: string })?.action;
      if (action === "deleted") {
        toast.success(messageFromApi || "ลบ milestone สำเร็จ");
      } else if (action === "deactivated") {
        toast.success(messageFromApi || "ปิด milestone สำเร็จ");
      } else {
        toast.success(messageFromApi || "ดำเนินการกับ milestone สำเร็จ");
      }

      await reloadCampaign();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "เกิดข้อผิดพลาดขณะลบ milestone");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCreatedAt = (value: string) =>
    new Date(value).toLocaleString("th-TH", {
      dateStyle: "short",
      timeStyle: "short",
    });

  const milestoneStatusText = (milestone: MilestoneItem) =>
    milestone.isActive ? "ใช้งานอยู่" : "ปิดใช้งาน";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-white/10 bg-black/30 p-4">
        <p className="text-sm text-white/65">Campaign</p>
        <p className="mt-1 text-sm text-white">{campaignTitle || campaignId}</p>
        <p className="mt-1 text-xs text-white/45">{campaignId}</p>
      </div>

      <div className="inline-flex rounded-lg border border-white/10 bg-black/30 p-1">
        <button
          type="button"
          onClick={() => setActiveTab("create")}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "create" ? "bg-emerald-500/20 text-emerald-100" : "text-white/65 hover:text-white"
          }`}
        >
          สร้าง Milestone
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("edit")}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "edit" ? "bg-sky-500/20 text-sky-100" : "text-white/65 hover:text-white"
          }`}
        >
          แก้ไข / ปิด
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("delete")}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
            activeTab === "delete" ? "bg-rose-500/20 text-rose-100" : "text-white/65 hover:text-white"
          }`}
        >
          ลบ
        </button>
      </div>

      <div className="rounded-xl border border-sky-500/20 bg-sky-500/10 p-4">
        <p className="text-sm font-semibold text-sky-100">Milestone Rule</p>
        <p className="mt-1 text-xs text-sky-100/80">
          thresholdAmount และ deductAmount ส่งเป็นหน่วย "บาท" และถ้า milestone หลายตัวมี poolType + thresholdAmount เท่ากัน ระบบจะสุ่มเลือก 1 ตัว
        </p>
      </div>

      <div className="rounded-xl border border-white/10 bg-black/20 p-4">
        <p className="text-sm font-semibold text-white">รายการ Milestone</p>
        <div className="mt-3 grid gap-3">
          {isLoadingMilestones ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/60">
              กำลังโหลด milestone...
            </div>
          ) : milestones.length === 0 ? (
            <div className="rounded-lg border border-dashed border-white/15 bg-white/5 p-4 text-sm text-white/60">
              ยังไม่มี milestone ในแคมเปญนี้
            </div>
          ) : (
            milestones.map((milestone) => {
              const payouts = milestone._count?.payouts ?? 0;

              return (
                <button
                  key={milestone.id}
                  type="button"
                  onClick={() => {
                    setSelectedMilestoneId(milestone.id);
                    if (activeTab !== "delete") {
                      setActiveTab("edit");
                    }
                  }}
                  className={`rounded-xl border px-4 py-3 text-left transition ${
                    selectedMilestoneId === milestone.id
                      ? "border-sky-400/50 bg-sky-500/15"
                      : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/7"
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {milestone.reward?.title || milestone.rewardId}
                      </p>
                      <p className="mt-0.5 text-xs text-white/55">
                        {milestone.poolType} | sortOrder {milestone.sortOrder} | {milestoneStatusText(milestone)}
                      </p>
                    </div>
                    <div className="text-right text-xs text-white/55">
                      <div>payouts {payouts}</div>
                      <div>{formatCreatedAt(milestone.createdAt)}</div>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-1 text-sm text-white/75 md:grid-cols-3">
                    <div>threshold: ฿{moneyToBaht(milestone.thresholdAmount)}</div>
                    <div>deduct: ฿{moneyToBaht(milestone.deductAmount)}</div>
                    <div>rewardId: {milestone.rewardId}</div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {activeTab === "create" ? (
        <div className="grid gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">รางวัล (rewardId)</span>
            <select
              value={rewardId}
              onChange={(event) => setRewardId(event.target.value)}
              disabled={isLoadingRewards || isSubmitting || rewards.length === 0}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {rewards.length === 0 ? <option value="">ไม่มี reward</option> : null}
              {rewards.map((reward) => (
                <option key={reward.id} value={reward.id}>
                  {reward.title} [{reward.kind}] ({reward.id})
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">ประเภทพูล (poolType)</span>
            <select
              value={poolType}
              onChange={(event) => setPoolType(event.target.value as PoolType)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="JACKPOT">JACKPOT</option>
              <option value="SMALL">SMALL</option>
              <option value="NONE">NONE</option>
            </select>
          </label>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">ยอดพูลถึง (thresholdAmount, บาท)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={thresholdAmount}
                onChange={(event) => setThresholdAmount(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-white/60">จำนวนที่หักจากพูล (deductAmount, บาท)</span>
              <input
                type="number"
                min="1"
                step="1"
                value={deductAmount}
                onChange={(event) => setDeductAmount(event.target.value)}
                disabled={isSubmitting}
                className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">ลำดับการทำงาน (sortOrder)</span>
            <input
              type="number"
              min="0"
              step="1"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoadingRewards || rewards.length === 0}
              className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "กำลังสร้าง..." : "สร้าง milestone"}
            </button>
          </div>
        </div>
      ) : activeTab === "edit" ? (
        <div className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">เลือก milestone</span>
            <select
              value={selectedMilestoneId}
              onChange={(event) => setSelectedMilestoneId(event.target.value)}
              disabled={isLoadingMilestones || milestones.length === 0 || isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {milestones.length === 0 ? <option value="">ไม่มี milestone</option> : null}
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.reward?.title || milestone.rewardId} | {milestone.poolType} | ฿{moneyToBaht(milestone.thresholdAmount)}
                </option>
              ))}
            </select>
          </label>

          {selectedMilestone ? (
            <div className="grid gap-3">
              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">รางวัล (rewardId)</span>
                <select
                  value={rewardId}
                  onChange={(event) => setRewardId(event.target.value)}
                  disabled={isSubmitting || rewards.length === 0}
                  className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {rewards.map((reward) => (
                    <option key={reward.id} value={reward.id}>
                      {reward.title} [{reward.kind}] ({reward.id})
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">ประเภทพูล (poolType)</span>
                <select
                  value={poolType}
                  onChange={(event) => setPoolType(event.target.value as PoolType)}
                  disabled={isSubmitting}
                  className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="JACKPOT">JACKPOT</option>
                  <option value="SMALL">SMALL</option>
                  <option value="NONE">NONE</option>
                </select>
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">ยอดพูลถึง (thresholdAmount, บาท)</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={thresholdAmount}
                    onChange={(event) => setThresholdAmount(event.target.value)}
                    disabled={isSubmitting}
                    className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>

                <label className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-white/60">จำนวนที่หักจากพูล (deductAmount, บาท)</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={deductAmount}
                    onChange={(event) => setDeductAmount(event.target.value)}
                    disabled={isSubmitting}
                    className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </label>
              </div>

              <label className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-white/60">ลำดับการทำงาน (sortOrder)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  disabled={isSubmitting}
                  className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/75">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  disabled={isSubmitting}
                  className="h-4 w-4 rounded border-white/20 bg-black/40"
                />
                <span>เปิดใช้งาน milestone นี้</span>
              </label>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={isSubmitting || isLoadingMilestones || milestones.length === 0}
                  className="rounded-lg border border-sky-400/40 bg-sky-500/15 px-4 py-2 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsActive(false)}
                  disabled={isSubmitting || isLoadingMilestones || milestones.length === 0}
                  className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  ปิด milestone
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="space-y-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">เลือก milestone ที่ต้องการลบ</span>
            <select
              value={selectedMilestoneId}
              onChange={(event) => setSelectedMilestoneId(event.target.value)}
              disabled={isLoadingMilestones || milestones.length === 0 || isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              {milestones.length === 0 ? <option value="">ไม่มี milestone</option> : null}
              {milestones.map((milestone) => (
                <option key={milestone.id} value={milestone.id}>
                  {milestone.reward?.title || milestone.rewardId} | payouts {(milestone._count?.payouts ?? 0)}
                </option>
              ))}
            </select>
          </label>

          {selectedMilestone ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-100">
              <p className="font-semibold">ก่อนลบ</p>
              <p className="mt-1 text-rose-100/80">
                ถ้า milestone นี้มี payouts แล้ว ระบบฝั่ง API จะทำ soft delete / deactivate แทนการลบถาวร
              </p>
              <p className="mt-2 text-xs text-rose-100/70">
                {selectedMilestone.reward?.title || selectedMilestone.rewardId} | {selectedMilestone.poolType} | payouts {(selectedMilestone._count?.payouts ?? 0)}
              </p>
            </div>
          ) : null}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isSubmitting || isLoadingMilestones || milestones.length === 0}
              className="rounded-lg border border-rose-400/40 bg-rose-500/15 px-4 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "กำลังลบ..." : "ลบ milestone"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
