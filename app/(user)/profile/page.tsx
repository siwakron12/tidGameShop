"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import { authClient } from "@/lib/auth-client";
import { toApiUrl } from "@/lib/api-url";
import { useWalletContext } from "../../components/providers/wallet-context";
import DynamicHistoryTable from "./dynamic-history-table";
import GameTopupHistoryTable from "./game-topup-history-table";

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

type TopupItem = {
  id: string;
  channel: string;
  status: string;
  amount?: {
    cents?: number;
    baht?: string;
    formatted?: string;
  };
  createdAt: string;
};

type TopupsResponse = {
  ok?: boolean;
  items?: TopupItem[];
  pageInfo?: {
    hasMore?: boolean;
    nextCursor?: string | null;
  };
};

type PointTransactionItem = {
  id: string;
  kind: string;
  amount: number;
  refType?: string | null;
  note?: string | null;
  createdAt: string;
};

type PointTransactionsResponse = {
  ok?: boolean;
  items?: PointTransactionItem[];
  pageInfo?: {
    hasMore?: boolean;
    nextCursor?: string | null;
  };
};

function formatThaiDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function mapChannelName(channel: string) {
  if (channel === "TRUEWALLET_VOUCHER") {
    return "True Wallet";
  }

  return channel;
}

export default function ProfilePage() {
  const { walletBaht, points, isLoading: isWalletLoading, refreshBalances } =
    useWalletContext();
  const [session, setSession] = useState<unknown>(null);
  const [mainTab, setMainTab] = useState<"history" | "gameMock">("history");
  const [activeTab, setActiveTab] = useState<"wallet" | "points">("wallet");
  const [topupItems, setTopupItems] = useState<TopupItem[]>([]);
  const [pointItems, setPointItems] = useState<PointTransactionItem[]>([]);
  const [isLoadingTopups, setIsLoadingTopups] = useState(false);
  const [isLoadingPoints, setIsLoadingPoints] = useState(false);
  const [isLoadingMoreTopups, setIsLoadingMoreTopups] = useState(false);
  const [isLoadingMorePoints, setIsLoadingMorePoints] = useState(false);
  const [topupError, setTopupError] = useState<string | null>(null);
  const [pointsError, setPointsError] = useState<string | null>(null);
  const [topupsHasMore, setTopupsHasMore] = useState(false);
  const [pointsHasMore, setPointsHasMore] = useState(false);
  const [topupsNextCursor, setTopupsNextCursor] = useState<string | null>(null);
  const [pointsNextCursor, setPointsNextCursor] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSession = async () => {
      try {
        const result = await authClient.getSession();

        if (!cancelled) {
          const record = result as Record<string, unknown> | null;
          setSession((record?.data as unknown) ?? result ?? null);
        }
      } catch {
        if (!cancelled) {
          setSession(null);
        }
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    void refreshBalances();
  }, [refreshBalances]);

  const loadTopups = useCallback(async (cursor?: string | null) => {
    const isLoadMore = Boolean(cursor);

    if (isLoadMore) {
      setIsLoadingMoreTopups(true);
    } else {
      setIsLoadingTopups(true);
    }

    setTopupError(null);

    try {
      const queryPath = cursor
        ? `/api/topups?limit=20&cursor=${encodeURIComponent(cursor)}`
        : "/api/topups?limit=20";

      const response = await fetch(toApiUrl(queryPath), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error("กรุณาเข้าสู่ระบบใหม่");
      }

      if (!response.ok) {
        throw new Error("โหลดประวัติการเติมเงินไม่สำเร็จ");
      }

      const json = (await response.json()) as TopupsResponse;
      const incomingItems = Array.isArray(json.items) ? json.items : [];

      setTopupItems((previousItems) =>
        isLoadMore ? [...previousItems, ...incomingItems] : incomingItems,
      );
      setTopupsHasMore(Boolean(json.pageInfo?.hasMore));
      setTopupsNextCursor(json.pageInfo?.nextCursor ?? null);
    } catch (error) {
      if (!isLoadMore) {
        setTopupItems([]);
        setTopupsHasMore(false);
        setTopupsNextCursor(null);
      }

      setTopupError(
        error instanceof Error ? error.message : "โหลดประวัติการเติมเงินไม่สำเร็จ",
      );
    } finally {
      if (isLoadMore) {
        setIsLoadingMoreTopups(false);
      } else {
        setIsLoadingTopups(false);
      }
    }
  }, []);

  const loadPointTransactions = useCallback(async (cursor?: string | null) => {
    const isLoadMore = Boolean(cursor);

    if (isLoadMore) {
      setIsLoadingMorePoints(true);
    } else {
      setIsLoadingPoints(true);
    }

    setPointsError(null);

    try {
      const queryPath = cursor
        ? `/api/points/transactions?limit=20&cursor=${encodeURIComponent(cursor)}`
        : "/api/points/transactions?limit=20";

      const response = await fetch(toApiUrl(queryPath), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401) {
        throw new Error("กรุณาเข้าสู่ระบบใหม่");
      }

      if (!response.ok) {
        throw new Error("โหลดประวัติพอยต์ไม่สำเร็จ");
      }

      const json = (await response.json()) as PointTransactionsResponse;
      const incomingItems = Array.isArray(json.items) ? json.items : [];

      setPointItems((previousItems) =>
        isLoadMore ? [...previousItems, ...incomingItems] : incomingItems,
      );
      setPointsHasMore(Boolean(json.pageInfo?.hasMore));
      setPointsNextCursor(json.pageInfo?.nextCursor ?? null);
    } catch (error) {
      if (!isLoadMore) {
        setPointItems([]);
        setPointsHasMore(false);
        setPointsNextCursor(null);
      }

      setPointsError(
        error instanceof Error ? error.message : "โหลดประวัติพอยต์ไม่สำเร็จ",
      );
    } finally {
      if (isLoadMore) {
        setIsLoadingMorePoints(false);
      } else {
        setIsLoadingPoints(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadTopups(null);
  }, [loadTopups]);

  useEffect(() => {
    void loadPointTransactions(null);
  }, [loadPointTransactions]);

  const sessionRecord = session as Record<string, unknown> | null;
  const user = (sessionRecord?.user as SessionUser | undefined) ?? null;
  const userDisplayName = user?.name?.trim() || user?.email?.trim() || "ผู้ใช้งาน";
  const userEmail = user?.email?.trim() || "-";
  const userInitial = userDisplayName.slice(0, 1).toUpperCase();

  const profileMeta = useMemo(() => {
    const now = new Date().toISOString();

    return {
      joinedAt: formatThaiDateTime(now),
      lastLoginAt: formatThaiDateTime(now),
    };
  }, []);

  const isLeftTableLoading =
    activeTab === "wallet" ? isLoadingTopups : isLoadingPoints;
  const isLoadingMoreLeftTable =
    activeTab === "wallet" ? isLoadingMoreTopups : isLoadingMorePoints;
  const hasMoreLeftTable = activeTab === "wallet" ? topupsHasMore : pointsHasMore;

  const walletColumns = useMemo<ColumnDef<TopupItem, unknown>[]>(
    () => [
      {
        header: "วันที่",
        accessorFn: (row) => formatThaiDateTime(row.createdAt),
      },
      {
        header: "ช่องทาง",
        accessorFn: (row) => mapChannelName(row.channel),
      },
      {
        header: "จำนวน",
        accessorFn: (row) => `${row.amount?.formatted ?? "0.00"} ฿`,
        cell: ({ getValue }) => (
          <span className="font-semibold text-white">{String(getValue() ?? "-")}</span>
        ),
      },
      {
        header: "สถานะ",
        accessorFn: (row) => row.status,
        cell: ({ row }) => (
          <span
            className={`rounded-md px-2 py-1 text-xs font-semibold ${
              row.original.status === "SUCCESS"
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-yellow-500/15 text-yellow-400"
            }`}
          >
            {row.original.status}
          </span>
        ),
      },
    ],
    [],
  );

  const pointsColumns = useMemo<ColumnDef<PointTransactionItem, unknown>[]>(
    () => [
      {
        header: "วันที่",
        accessorFn: (row) => formatThaiDateTime(row.createdAt),
      },
      {
        header: "ประเภท",
        accessorFn: (row) => row.kind,
      },
      {
        header: "จำนวนพอยต์",
        accessorFn: (row) => row.amount,
        cell: ({ row }) => (
          <span
            className={`font-semibold ${
              row.original.amount >= 0 ? "text-emerald-400" : "text-[#ff6b80]"
            }`}
          >
            {row.original.amount > 0 ? `+${row.original.amount}` : row.original.amount}
          </span>
        ),
      },
      {
        header: "หมายเหตุ",
        accessorFn: (row) => row.note?.trim() || row.refType || "-",
        cell: ({ getValue }) => <span className="text-white/65">{String(getValue() ?? "-")}</span>,
      },
    ],
    [],
  );

  const handleLoadMore = async () => {
    if (activeTab === "wallet") {
      if (!topupsHasMore || !topupsNextCursor || isLoadingMoreTopups) {
        return;
      }

      await loadTopups(topupsNextCursor);
      return;
    }

    if (!pointsHasMore || !pointsNextCursor || isLoadingMorePoints) {
      return;
    }

    await loadPointTransactions(pointsNextCursor);
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">โปรไฟล์</h1>
          <p className="mt-1 text-sm text-white/55">ข้อมูลผู้ใช้งานและสถิติการใช้งานของคุณ</p>
        </div>

        <section className="mb-6 rounded-3xl border border-white/10 bg-[#050505] p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              {user?.image ? (
                <img
                  src={user.image}
                  alt="user avatar"
                  className="h-14 w-14 rounded-2xl object-cover"
                />
              ) : (
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-xl font-bold text-white">
                  {userInitial}
                </span>
              )}

              <div>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold text-white">{userDisplayName}</p>
                  <span className="rounded-full border border-white/20 bg-white/10 px-2 py-0.5 text-xs font-semibold text-white/80">
                    สมาชิก
                  </span>
                </div>
                <p className="text-base text-white/60">{userEmail}</p>
              </div>
            </div>

            <div className="text-left sm:text-right">
              <p className="text-sm font-semibold text-white/60">ยอดเงินคงเหลือ</p>
              <p className="text-4xl font-extrabold text-white">
                {isWalletLoading ? "..." : walletBaht} ฿
              </p>
              <p className="mt-1 text-sm text-white/50">แต้มสะสม {points}</p>
            </div>
          </div>

      
        </section>

        <section>
          <div className="rounded-3xl border border-white/10 bg-[#050505] p-5 sm:p-6">
            <div className="mb-5 rounded-2xl border border-white/15 bg-black p-1.5">
              <div className="flex flex-row gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <button
                  type="button"
                  onClick={() => setMainTab("history")}
                  className={`shrink-0  px-2 py-2 text-sm font-bold whitespace-nowrap transition ${
                    mainTab === "history"
                      ? "border-b-2 border-[#ff1536] text-white"
                      : "border-b-2 border-transparent text-white/70 hover:text-white"
                  }`}
                >
                  ประวัติการเงิน
                </button>
                <button
                  type="button"
                  onClick={() => setMainTab("gameMock")}
                  className={`shrink-0  px-2 py-2 text-sm font-bold whitespace-nowrap transition ${
                    mainTab === "gameMock"
                      ? "border-b-2 border-[#ff1536] text-white"
                      : "border-b-2 border-transparent text-white/70 hover:text-white"
                  }`}
                >
                  ประวัติเติมเกม
                </button>
              </div>
            </div>

            {mainTab === "history" ? (
              <>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-4xl font-bold text-white">ประวัติรายการ</h2>
                    <p className="mt-1 text-sm text-white/55">20 รายการล่าสุด</p>
                  </div>
                  <div className="rounded-xl border border-white/15 p-1 text-sm">
                    <div className="flex flex-row gap-1 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                      <button
                        type="button"
                        onClick={() => setActiveTab("wallet")}
                        className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition ${
                          activeTab === "wallet"
                            ? "bg-[#ff1536] text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        เติมเงิน
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTab("points")}
                        className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap transition ${
                          activeTab === "points"
                            ? "bg-[#ff1536] text-white"
                            : "text-white/70 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        พอยต์
                      </button>
                    </div>
                  </div>
                </div>

                {activeTab === "wallet" ? (
                  <DynamicHistoryTable
                    columns={walletColumns}
                    data={topupItems}
                    isLoading={isLoadingTopups}
                    error={topupError}
                    emptyText="ไม่มีข้อมูล"
                    hasMore={topupsHasMore}
                    isLoadingMore={isLoadingMoreTopups}
                    onLoadMore={() => {
                      void handleLoadMore();
                    }}
                  />
                ) : (
                  <DynamicHistoryTable
                    columns={pointsColumns}
                    data={pointItems}
                    isLoading={isLoadingPoints}
                    error={pointsError}
                    emptyText="ไม่มีข้อมูล"
                    hasMore={pointsHasMore}
                    isLoadingMore={isLoadingMorePoints}
                    onLoadMore={() => {
                      void handleLoadMore();
                    }}
                  />
                )}
              </>
            ) : (
              <GameTopupHistoryTable />
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
