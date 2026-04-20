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
  pageInfo?: {
    hasMore?: boolean;
    nextCursor?: string;
  };
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
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const fetchGameOrders = useCallback(async (cursor?: string) => {
    if (cursor) setIsLoadingMore(true);
    else setIsLoading(true);
    if (!cursor) setError(null);

    try {
      const url = cursor ? toApiUrl(`/api/game-orders?cursor=${cursor}`) : toApiUrl("/api/game-orders");
      const response = await fetch(url, {
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
      if (cursor) {
        setItems((prev) => [...prev, ...(Array.isArray(json.items) ? json.items : [])]);
      } else {
        setItems(Array.isArray(json.items) ? json.items : []);
      }
      setNextCursor(json.pageInfo?.nextCursor || null);
      setHasMore(!!json.pageInfo?.hasMore);
    } catch (fetchError) {
      if (!cursor) setItems([]);
      setError(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดประวัติรายการ");
    } finally {
      if (cursor) setIsLoadingMore(false);
      else setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGameOrders();
  }, [fetchGameOrders]);

  const handleLoadMore = () => {
    if (hasMore && nextCursor && !isLoadingMore) {
      fetchGameOrders(nextCursor);
    }
  };

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
          <h2 className="text-lg lg:text-4xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
     
      </div>

      <DynamicHistoryTable
        columns={columns}
        data={items}
        isLoading={isLoading}
        error={error}
        emptyText="ไม่มีประวัติเติมเกม"
        loadingText="กำลังโหลดประวัติเติมเกม..."
      />
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
          </button>
        </div>
      )}
    </div>
  );
}
