"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { toApiUrl } from "@/lib/api-url";
import DynamicHistoryTable from "./dynamic-history-table";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "PARTIAL_SUCCESS";

type GameTopupHistoryItem = {
  id: string;
  createdAt: string;
  gameUid: string;
  amount: {
    formatted: string;
  };
  game: {
    name: string;
  } | null;
  pack: {
    name: string;
  } | null;
  status: OrderStatus;
};

type GameOrdersResponse = {
  ok: boolean;
  items: GameTopupHistoryItem[];
};

const statusMeta: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: {
    label: "รอดำเนินการ",
    className: "border-[#7a6430] bg-[#2f2712] text-[#ffd67c]",
  },
  PROCESSING: {
    label: "กำลังทำรายการ",
    className: "border-[#2f4c77] bg-[#161f2e] text-[#9dc8ff]",
  },
  SUCCESS: {
    label: "สำเร็จ",
    className: "border-[#2d6a40] bg-[#14281a] text-[#8ce7ad]",
  },
  FAILED: {
    label: "ล้มเหลว",
    className: "border-[#7a2a34] bg-[#2b1418] text-[#ff9ca8]",
  },
  REFUNDED: {
    label: "คืนเงินแล้ว",
    className: "border-[#6a3d79] bg-[#26162d] text-[#dfb5ff]",
  },
  PARTIAL_SUCCESS: {
    label: "สำเร็จบางส่วน",
    className: "border-[#1d6f6a] bg-[#102825] text-[#8be8df]",
  },
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

type GameTopupHistoryTableProps = {
  title?: string;
  subtitle?: string;
};

export default function GameTopupHistoryTable({
  title = "ประวัติเติมเกม",
  subtitle = "รายการเติมเกมทั้งหมดของคุณ",
}: GameTopupHistoryTableProps) {
  const [items, setItems] = useState<GameTopupHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGameOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(toApiUrl("/api/game-orders"), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์เข้าถึงประวัติรายการ");
      }

      if (!response.ok) {
        throw new Error("โหลดประวัติรายการไม่สำเร็จ");
      }

      const json = (await response.json()) as GameOrdersResponse;

      if (!json.ok) {
        throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
      }
      setItems(Array.isArray(json.items) ? json.items : []);
    } catch (fetchError) {
      setItems([]);
      setError(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดประวัติรายการ");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchGameOrders();
  }, [fetchGameOrders]);

  const columns = useMemo<ColumnDef<GameTopupHistoryItem, unknown>[]>(
    () => [
      {
        header: "วันที่",
        accessorKey: "createdAt",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        header: "UID",
        accessorKey: "gameUid",
        cell: ({ row }) => (
          <span className="max-w-55 truncate" title={row.original.gameUid}>
            {row.original.gameUid || "-"}
          </span>
        ),
      },
      {
        header: "จำนวน",
        id: "amount",
        cell: ({ row }) => `฿${row.original.amount.formatted}`,
      },
      {
        header: "เกม",
        id: "game",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span>{row.original.game?.name || "-"}</span>
            <span className="text-xs text-white/55">{row.original.pack?.name || "-"}</span>
          </div>
        ),
      },
      {
        header: "สถานะ",
        accessorKey: "status",
        cell: ({ row }) => {
          const meta = statusMeta[row.original.status];
          return (
            <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${meta.className}`}>
              {meta.label}
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-[#050505] p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-4xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-white/60 transition hover:text-white"
        >
          ดูทั้งหมด
        </button>
      </div>

      <DynamicHistoryTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        error={error}
        emptyText="ไม่มีประวัติเติมเกม"
        loadingText="กำลังโหลดประวัติเติมเกม..."
      />
    </div>
  );
}
