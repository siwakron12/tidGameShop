"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import { toApiUrl } from "@/lib/api-url";

type PointTransactionItem = {
  id: string;
  kind: string;
  amount: number | string;
  refType: string | null;
  refId: string | null;
  note: string | null;
  createdAt: string;
};

type PointTransactionsResponse = {
  ok: boolean;
  items: PointTransactionItem[];
  pageInfo?: {
    hasMore?: boolean;
    nextCursor?: string | null;
  };
};

type UserPointTransactionsTableProps = {
  userId: string;
};

function formatPointAmount(value: PointTransactionItem["amount"]): string {
  if (typeof value === "number") {
    return `${Math.trunc(value)}`;
  }

  if (typeof value === "string") {
    return value;
  }

  return "0";
}

export default function UserPointTransactionsTable({ userId }: UserPointTransactionsTableProps) {
  const [items, setItems] = useState<PointTransactionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const fetchTransactions = useCallback(
    async (cursor?: string | null, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      setError(null);

      try {
        const params = new URLSearchParams({ limit: "20" });
        if (cursor) {
          params.set("cursor", cursor);
        }

        const response = await fetch(
          toApiUrl(`/api/admin/users/${userId}/point-transactions?${params.toString()}`),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (response.status === 401 || response.status === 403) {
          throw new Error("ไม่มีสิทธิ์เข้าถึงรายการพอยต์");
        }

        if (!response.ok) {
          throw new Error("โหลดรายการพอยต์ไม่สำเร็จ");
        }

        const json = (await response.json()) as PointTransactionsResponse;
        if (!json.ok) {
          throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
        }

        const nextItems = Array.isArray(json.items) ? json.items : [];
        setItems((prev) => (append ? [...prev, ...nextItems] : nextItems));

        const next = json.pageInfo?.nextCursor ?? null;
        const more = Boolean(json.pageInfo?.hasMore && next);
        setNextCursor(next);
        setHasMore(more);
      } catch (fetchError) {
        if (!append) {
          setItems([]);
          setHasMore(false);
          setNextCursor(null);
        }

        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "เกิดข้อผิดพลาดขณะโหลดรายการพอยต์",
        );
      } finally {
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [userId],
  );

  useEffect(() => {
    void fetchTransactions();
  }, [fetchTransactions]);

  const onLoadMore = useCallback(() => {
    if (!nextCursor || isLoadingMore) {
      return;
    }

    void fetchTransactions(nextCursor, true);
  }, [fetchTransactions, isLoadingMore, nextCursor]);

  const columns = useMemo<ColumnDef<PointTransactionItem, unknown>[]>(
    () => [
      {
        header: "เวลา",
        accessorKey: "createdAt",
        cell: ({ row }) =>
          new Date(row.original.createdAt).toLocaleString("th-TH", {
            dateStyle: "short",
            timeStyle: "short",
          }),
      },
      {
        header: "ประเภท",
        accessorKey: "kind",
      },
      {
        header: "จำนวนพอยต์",
        accessorKey: "amount",
        cell: ({ row }) => formatPointAmount(row.original.amount),
      },
      {
        header: "อ้างอิง",
        accessorKey: "refType",
        cell: ({ row }) => row.original.refType ?? "-",
      },
      {
        header: "หมายเหตุ",
        accessorKey: "note",
        cell: ({ row }) => row.original.note ?? "-",
      },
    ],
    [],
  );

  return (
    <TableAdmin
      columns={columns}
      data={items}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      onLoadMore={onLoadMore}
      error={error}
      emptyText="ไม่พบธุรกรรมพอยต์"
      loadingText="กำลังโหลดธุรกรรมพอยต์..."
    />
  );
}
