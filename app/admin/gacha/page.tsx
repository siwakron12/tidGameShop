"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import { toApiUrl } from "@/lib/api-url";
import { toast } from "sonner";
import CreateCampaignModal, { type CreateCampaignPayload } from "./create-campaign-modal";
import ManageCampaignModal from "./manage-campaign-modal";
import type { EditGachaUpdatedData } from "./(mange_gacha)/edit-gacha-panel";

type MoneyValue = {
  cents: number;
  baht: string;
  formatted: string;
};

type GachaCampaign = {
  id: string;
  title: string;
  description: string;
  imageUrl: string | null;
  status: "ACTIVE" | "PAUSED" | "ENDED" | string;
  isRecommended: boolean;
  tags: string[];
  spinPrice: MoneyValue;
  jackpotPercent: number;
  smallPrizePercent: number;
  profitPercent: number;
  pools: {
    jackpot: MoneyValue;
    small: MoneyValue;
    profit: MoneyValue;
    total: MoneyValue;
  };
  progressStepPct: number;
  startsAt: string | null;
  endsAt: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    rewards: number;
    milestones: number;
    actions: number;
    payouts: number;
  };
};

type GachaCampaignsResponse = {
  ok: boolean;
  items: GachaCampaign[];
};

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function moneyText(value: MoneyValue | null | undefined) {
  if (!value) {
    return "0.00";
  }

  return value.formatted || value.baht || "0.00";
}

function statusBadgeClass(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-[#2d6a40] bg-[#14281a] text-[#8ce7ad]";
    case "PAUSED":
      return "border-[#7a6430] bg-[#2f2712] text-[#ffd67c]";
    case "ENDED":
      return "border-[#7a2a34] bg-[#2b1418] text-[#ff9ca8]";
    default:
      return "border-white/15 bg-white/5 text-white/70";
  }
}

export default function AdminGachaPage() {
  const [campaigns, setCampaigns] = useState<GachaCampaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false);
  const [isManageModalOpen, setIsManageModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<GachaCampaign | null>(null);
  const [activeManageMenu, setActiveManageMenu] = useState<"edit" | "rewards" | "reward-settings">("edit");

  const fetchCampaigns = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(toApiUrl("/api/admin/gacha/campaigns"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์เข้าถึงข้อมูล gacha");
      }

      if (!response.ok) {
        throw new Error("โหลดข้อมูล gacha ไม่สำเร็จ");
      }

      const json = (await response.json()) as GachaCampaignsResponse;

      if (!json.ok) {
        throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
      }

      setCampaigns(Array.isArray(json.items) ? json.items : []);
    } catch (fetchError) {
      setCampaigns([]);
      setError(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดข้อมูล gacha");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleCreateCampaign = useCallback(
    async (payload: CreateCampaignPayload) => {
      if (!payload.title) {
        toast.error("กรุณากรอกชื่อแคมเปญ");
        return;
      }

      if (!payload.description) {
        toast.error("กรุณากรอกรายละเอียดแคมเปญ");
        return;
      }

      const numberFields = [
        payload.spinPrice,
        payload.jackpotPercent,
        payload.smallPrizePercent,
        payload.profitPercent,
      ];

      if (numberFields.some((value) => Number.isNaN(value))) {
        toast.error("กรุณากรอกตัวเลขให้ถูกต้อง");
        return;
      }

      setIsCreatingCampaign(true);

      try {
        const response = await fetch(toApiUrl("/api/admin/gacha/campaigns"), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("ไม่มีสิทธิ์สร้างแคมเปญ gacha");
        }

        let messageFromApi = "";
        try {
          const json = (await response.json()) as { message?: string };
          if (typeof json.message === "string") {
            messageFromApi = json.message;
          }
        } catch {
          messageFromApi = "";
        }

        if (!response.ok) {
          throw new Error(messageFromApi || "สร้างแคมเปญไม่สำเร็จ");
        }

        toast.success(messageFromApi || "สร้างแคมเปญสำเร็จ");
        setIsCreateModalOpen(false);
        await fetchCampaigns();
      } catch (createError) {
        toast.error(createError instanceof Error ? createError.message : "เกิดข้อผิดพลาดขณะสร้างแคมเปญ");
      } finally {
        setIsCreatingCampaign(false);
      }
    },
    [fetchCampaigns],
  );

  const openManageModal = useCallback((campaign: GachaCampaign) => {
    setSelectedCampaign(campaign);
    setActiveManageMenu("edit");
    setIsManageModalOpen(true);
  }, []);

  const handleCampaignUpdated = useCallback(
    async (updated: EditGachaUpdatedData) => {
      setCampaigns((prev) =>
        prev.map((item) => {
          if (item.id !== updated.id) {
            return item;
          }

          const spin = updated.spinPrice.toFixed(2);

          return {
            ...item,
            title: updated.title,
            description: updated.description,
            imageUrl: updated.imageUrl || null,
            status: updated.status,
            jackpotPercent: updated.jackpotPercent,
            smallPrizePercent: updated.smallPrizePercent,
            profitPercent: updated.profitPercent,
            spinPrice: {
              ...item.spinPrice,
              cents: Math.round(updated.spinPrice * 100),
              baht: spin,
              formatted: spin,
            },
          };
        }),
      );

      setSelectedCampaign((prev) => {
        if (!prev || prev.id !== updated.id) {
          return prev;
        }

        const spin = updated.spinPrice.toFixed(2);

        return {
          ...prev,
          title: updated.title,
          description: updated.description,
          imageUrl: updated.imageUrl || null,
          status: updated.status,
          jackpotPercent: updated.jackpotPercent,
          smallPrizePercent: updated.smallPrizePercent,
          profitPercent: updated.profitPercent,
          spinPrice: {
            ...prev.spinPrice,
            cents: Math.round(updated.spinPrice * 100),
            baht: spin,
            formatted: spin,
          },
        };
      });

      await fetchCampaigns();
    },
    [fetchCampaigns],
  );

  const columns = useMemo<ColumnDef<GachaCampaign>[]>(
    () => [
      {
        accessorKey: "title",
        header: "แคมเปญ",
        cell: ({ row }) => {
          const campaign = row.original;

          return (
            <div className="min-w-60 space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white">{campaign.title}</span>
                {campaign.isRecommended ? (
                  <span className="rounded-full border border-[#7a6430] bg-[#2f2712] px-2 py-0.5 text-[11px] font-semibold text-[#ffd67c]">
                    แนะนำ
                  </span>
                ) : null}
              </div>
              <p className="max-w-85 whitespace-normal text-sm text-white/60">{campaign.description}</p>
            </div>
          );
        },
      },
      {
        accessorKey: "status",
        header: "สถานะ",
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(status)}`}>
              {status}
            </span>
          );
        },
      },
      {
        accessorKey: "spinPrice",
        header: "ราคาเล่น",
        cell: ({ row }) => <span className="font-medium text-white">{moneyText(row.original.spinPrice)}</span>,
      },
      {
        accessorKey: "jackpotPercent",
        header: "อัตราจ่าย",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-white/80">
            <div>Jackpot {row.original.jackpotPercent}%</div>
            <div>Small {row.original.smallPrizePercent}%</div>
            <div>Profit {row.original.profitPercent}%</div>
          </div>
        ),
      },
      {
        accessorKey: "progressStepPct",
        header: "สุ่มครั้งละ",
        cell: ({ row }) => (
          <span className="font-medium text-white">{row.original.progressStepPct}</span>
        ),
      },
      {
        accessorKey: "pools.total.formatted",
        header: "Pool",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-white/80">
            <div>J: {moneyText(row.original.pools.jackpot)}</div>
            <div>S: {moneyText(row.original.pools.small)}</div>
            <div>P: {moneyText(row.original.pools.profit)}</div>
            <div className="font-semibold text-white">รวม: {moneyText(row.original.pools.total)}</div>
          </div>
        ),
      },
      {
        accessorKey: "_count.rewards",
        header: "สถิติ",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-white/80">
            <div>Rewards {row.original._count.rewards}</div>
            <div>Milestones {row.original._count.milestones}</div>
            <div>Actions {row.original._count.actions}</div>
            <div>Payouts {row.original._count.payouts}</div>
          </div>
        ),
      },
      {
        accessorKey: "startsAt",
        header: "ช่วงเวลา",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-white/80">
            <div>เริ่ม: {formatDateTime(row.original.startsAt)}</div>
            <div>สิ้นสุด: {formatDateTime(row.original.endsAt)}</div>
          </div>
        ),
      },
      {
        accessorKey: "updatedAt",
        header: "อัปเดตล่าสุด",
        cell: ({ row }) => (
          <div className="space-y-1 text-sm text-white/80">
            <div>สร้าง: {formatDateTime(row.original.createdAt)}</div>
            <div>แก้ไข: {formatDateTime(row.original.updatedAt)}</div>
          </div>
        ),
      },
      {
        id: "actions",
        header: "จัดการ",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => openManageModal(row.original)}
            className="rounded-lg border border-blue-400/40 bg-blue-500/15 px-3 py-1.5 text-xs font-semibold text-blue-100 transition hover:bg-blue-500/25"
          >
            จัดการ
          </button>
        ),
      },
    ],
    [openManageModal],
  );

  return (
    <div className="p-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Gacha Campaigns</h1>
          <p className="text-sm text-white/55">ข้อมูลแคมเปญจาก /api/admin/gacha/campaigns</p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] transition hover:bg-[#2a3a23]"
        >
          + เพิ่มแคมเปญ
        </button>
      </div>

      <TableAdmin
        columns={columns}
        data={campaigns}
        isLoading={isLoading}
        error={error}
        emptyText="ยังไม่มีแคมเปญ gacha"
        loadingText="กำลังโหลดข้อมูล gacha..."
      />

      <CreateCampaignModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreatingCampaign}
        onClose={() => {
          if (!isCreatingCampaign) {
            setIsCreateModalOpen(false);
          }
        }}
        onSubmit={handleCreateCampaign}
      />

      <ManageCampaignModal
        isOpen={isManageModalOpen}
        campaign={selectedCampaign}
        activeMenu={activeManageMenu}
        onChangeMenu={setActiveManageMenu}
        onCampaignUpdated={handleCampaignUpdated}
        onClose={() => setIsManageModalOpen(false)}
      />
    </div>
  );
}