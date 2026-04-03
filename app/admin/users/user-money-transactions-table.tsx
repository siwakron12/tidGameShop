"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import { toApiUrl } from "@/lib/api-url";

type MoneyAmount = {
  cents?: number;
  baht?: string;
  formatted?: string;
};

type MoneyTransactionItem = {
  id: string;
  kind: string;
  amount: MoneyAmount | number | string;
  refType: string | null;
  refId: string | null;
  note: string | null;
  createdAt: string;
};

type MoneyTransactionsResponse = {
  ok: boolean;
  items: MoneyTransactionItem[];
  pageInfo?: {
    hasMore?: boolean;
    nextCursor?: string | null;
  };
};

type UserMoneyTransactionsTableProps = {
  userId: string;
};

function formatMoneyAmount(value: MoneyTransactionItem["amount"]): string {
  if (typeof value === "number") {
    return value.toFixed(2);
  }

  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    if (typeof value.formatted === "string") {
      return value.formatted;
    }

    if (typeof value.baht === "string") {
      return value.baht;
    }

    if (typeof value.cents === "number") {
      return (value.cents / 100).toFixed(2);
    }
  }

  return "0.00";
}

export default function UserMoneyTransactionsTable({ userId }: UserMoneyTransactionsTableProps) {
  const [items, setItems] = useState<MoneyTransactionItem[]>([]);
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
          toApiUrl(`/api/admin/users/${userId}/transactions?${params.toString()}`),
          {
            method: "GET",
            credentials: "include",
            cache: "no-store",
          },
        );

        if (response.status === 401 || response.status === 403) {
          throw new Error("ไม่มีสิทธิ์เข้าถึงรายการธุรกรรม");
        }

        if (!response.ok) {
          throw new Error("โหลดรายการธุรกรรมไม่สำเร็จ");
        }

        const json = (await response.json()) as MoneyTransactionsResponse;
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
            : "เกิดข้อผิดพลาดขณะโหลดรายการธุรกรรม",
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

  const columns = useMemo<ColumnDef<MoneyTransactionItem, unknown>[]>(
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
        header: "จำนวนเงิน",
        accessorKey: "amount",
        cell: ({ row }) => formatMoneyAmount(row.original.amount),
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
      emptyText="ไม่พบธุรกรรมเงิน"
      loadingText="กำลังโหลดธุรกรรมเงิน..."
    />
  );
}
