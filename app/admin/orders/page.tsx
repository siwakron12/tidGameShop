"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { toApiUrl } from "@/lib/api-url";
import TableAdmin from "../(uiAdmin)/TableAdmin";

type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "REFUNDED"
  | "PARTIAL_SUCCESS";

type StatusFilter = OrderStatus | "ALL";

type GameOrder = {
  id: string;
  gameUid: string;
  status: OrderStatus;
  paidWith: string;
  providerSlug: string | null;
  providerTxId: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
  amount: {
    formatted: string;
  };
  costAmount: {
    formatted: string;
  };
  profit: {
    formatted: string;
  };
  game: {
    name: string;
    slug: string;
  } | null;
  pack: {
    name: string;
  } | null;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
  lastError: string | null;
};

type GameOrdersResponse = {
  ok: boolean;
  items: GameOrder[];
  pageInfo?: {
    hasMore?: boolean;
    nextCursor?: string | null;
  };
};

const statusOptions: Array<{ value: StatusFilter; label: string }> = [
  { value: "ALL", label: "ทุกสถานะ" },
  { value: "PENDING", label: "รอดำเนินการ" },
  { value: "PROCESSING", label: "กำลังทำรายการ" },
  { value: "SUCCESS", label: "สำเร็จ" },
  { value: "FAILED", label: "ล้มเหลว" },
  { value: "REFUNDED", label: "คืนเงินแล้ว" },
  { value: "PARTIAL_SUCCESS", label: "สำเร็จบางส่วน" },
];

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

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("th-TH", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<GameOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingActionKey, setPendingActionKey] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [q, setQ] = useState("");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();

      if (statusFilter !== "ALL") {
        params.set("status", statusFilter);
      }

      if (q.trim()) {
        params.set("q", q.trim());
      }

      const query = params.toString();
      const endpoint = query
        ? `/api/admin/game-orders?${query}`
        : "/api/admin/game-orders";

      const response = await fetch(toApiUrl(endpoint), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์เข้าถึงข้อมูลรายการสั่งซื้อ");
      }

      if (!response.ok) {
        throw new Error("โหลดข้อมูลรายการสั่งซื้อไม่สำเร็จ");
      }

      const json = (await response.json()) as GameOrdersResponse;

      if (!json.ok) {
        throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
      }

      setOrders(Array.isArray(json.items) ? json.items : []);
    } catch (fetchError) {
      setOrders([]);
      setError(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดรายการสั่งซื้อ");
    } finally {
      setIsLoading(false);
    }
  }, [q, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onResetFilters = () => {
    setStatusFilter("ALL");
    setQ("");
  };

  const performOrderAction = useCallback(
    async (
      order: GameOrder,
      action: "retry" | "refund",
      firstTitle: string,
      firstText: string,
      successText: string,
    ) => {
      const firstConfirm = await Swal.fire({
        title: firstTitle,
        text: firstText,
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "ยืนยัน",
        cancelButtonText: "ยกเลิก",
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#374151",
      });

      if (!firstConfirm.isConfirmed) {
        return;
      }

      const actionKey = `${action}:${order.id}`;
      setPendingActionKey(actionKey);

      try {
        const response = await fetch(
          toApiUrl(`/api/admin/game-orders/${order.id}/${action}`),
          {
            method: "POST",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          },
        );

        let messageFromApi = "";
        try {
          const json = (await response.json()) as { message?: string };
          if (typeof json?.message === "string") {
            messageFromApi = json.message;
          }
        } catch {
          messageFromApi = "";
        }

        if (response.status === 401 || response.status === 403) {
          throw new Error("ไม่มีสิทธิ์ทำรายการนี้");
        }

        if (!response.ok) {
          throw new Error(messageFromApi || "ทำรายการไม่สำเร็จ");
        }

        await Swal.fire({
          title: "สำเร็จ",
          text: successText,
          icon: "success",
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#16a34a",
        });

        await fetchOrders();
      } catch (actionError) {
        const message =
          actionError instanceof Error ? actionError.message : "เกิดข้อผิดพลาดในการทำรายการ";
        toast.error(message);
      } finally {
        setPendingActionKey(null);
      }
    },
    [fetchOrders],
  );

  const onRetryOrder = useCallback(
    async (order: GameOrder) => {
      await performOrderAction(
        order,
        "retry",
        "ยืนยันบังคับจ่ายอีกรอบ",
        `ต้องการบังคับจ่ายอีกรอบสำหรับออเดอร์ #${order.id.slice(-6)} ใช่หรือไม่`,
        "ส่งคำสั่งบังคับจ่ายอีกรอบเรียบร้อย",
      );
    },
    [performOrderAction],
  );

  const onRefundOrder = useCallback(
    async (order: GameOrder) => {
      await performOrderAction(
        order,
        "refund",
        "ยืนยันบังคับคืนเงิน",
        `ต้องการบังคับคืนเงินสำหรับออเดอร์ #${order.id.slice(-6)} ใช่หรือไม่`,
        "ส่งคำสั่งบังคับคืนเงินเรียบร้อย",
      );
    },
    [performOrderAction],
  );

  const columns = useMemo<ColumnDef<GameOrder, unknown>[]>(
    () => [
      {
        header: "ผู้ใช้",
        id: "user",
        cell: ({ row }) => {
          const user = row.original.user;
          return (
            <div className="flex flex-col">
              <span className="font-medium text-white">{user?.name || "-"}</span>
              <span className="text-xs text-white/55">{user?.email || "-"}</span>
            </div>
          );
        },
      },
      {
        header: "เกม/แพ็ก",
        id: "game",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-white">{row.original.game?.name || "-"}</span>
            <span className="text-xs text-white/55">{row.original.pack?.name || "-"}</span>
          </div>
        ),
      },
      {
        header: "Game UID",
        accessorKey: "gameUid",
        cell: ({ row }) => (
          <span className="max-w-55 truncate text-white/85" title={row.original.gameUid}>
            {row.original.gameUid || "-"}
          </span>
        ),
      },
      {
        header: "ยอดขาย",
        id: "amount",
        cell: ({ row }) => `฿${row.original.amount.formatted}`,
      },
      {
        header: "ต้นทุน",
        id: "costAmount",
        cell: ({ row }) => `฿${row.original.costAmount.formatted}`,
      },
      {
        header: "กำไร",
        id: "profit",
        cell: ({ row }) => {
          const isPositive = Number(row.original.profit.formatted) >= 0;
          return (
            <span className={isPositive ? "text-[#8ce7ad]" : "text-[#ff9ca8]"}>
              ฿{row.original.profit.formatted}
            </span>
          );
        },
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
      {
        header: "ผู้ให้บริการ",
        id: "provider",
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="uppercase text-white/85">{row.original.providerSlug || "-"}</span>
            <span className="text-xs text-white/55">TX: {row.original.providerTxId || "-"}</span>
          </div>
        ),
      },
      {
        header: "เวลา",
        id: "createdAt",
        cell: ({ row }) => formatDateTime(row.original.createdAt),
      },
      {
        header: "จัดการ",
        id: "actions",
        cell: ({ row }) => {
          const order = row.original;
          const canRetry = order.status !== "SUCCESS";
          const canRefund = order.status !== "REFUNDED";
          const isRetrying = pendingActionKey === `retry:${order.id}`;
          const isRefunding = pendingActionKey === `refund:${order.id}`;
          const isBusy = isRetrying || isRefunding;

          return (
            <div className="flex items-center gap-2">
              {canRetry ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void onRetryOrder(order)}
                  className="rounded-lg border border-[#2f4c77] bg-[#1a1f2b] px-2.5 py-1.5 text-xs font-semibold text-[#9dc8ff] hover:bg-[#20293a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRetrying ? "กำลังส่ง..." : "บังคับจ่ายอีกรอบ"}
                </button>
              ) : null}
              {canRefund ? (
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => void onRefundOrder(order)}
                  className="rounded-lg border border-[#7a2a34] bg-[#2b1418] px-2.5 py-1.5 text-xs font-semibold text-[#ff9ca8] hover:bg-[#3a1a20] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isRefunding ? "กำลังส่ง..." : "บังคับคืนเงิน"}
                </button>
              ) : null}
            </div>
          );
        },
      },
    ],
    [onRefundOrder, onRetryOrder, pendingActionKey],
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Game Orders</h1>
        <p className="mt-2 text-sm text-white/60">ตรวจสอบรายการสั่งซื้อเกม พร้อมตัวกรองสถานะและค้นหาผู้ใช้</p>
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">สถานะ</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col gap-1 lg:col-span-2">
            <span className="text-xs font-semibold text-white/60">ค้นหาชื่อผู้ใช้ (q)</span>
            <input
              type="text"
              value={q}
              onChange={(event) => setQ(event.target.value)}
              placeholder="เช่น admin"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchOrders()}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            ค้นหา
          </button>
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            รีเซ็ต
          </button>
          <span className="text-xs text-white/55">ทั้งหมด {orders.length} รายการ</span>
        </div>
      </div>

      <TableAdmin
        columns={columns}
        data={orders}
        isLoading={isLoading}
        error={error}
        emptyText="ไม่พบรายการสั่งซื้อ"
        loadingText="กำลังโหลดรายการสั่งซื้อ..."
      />
    </div>
  );
}
