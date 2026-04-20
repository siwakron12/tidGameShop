"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import { toApiUrl } from "@/lib/api-url";

type MoneyValue = { cents: number; baht: string; formatted: string };
type SlipData = {
  id: string; provider: string; transRef: string;
  amount: MoneyValue; verifiedAt: string;
  senderName: string | null; senderAccount: string | null;
  receiverName: string | null; receiverAccount: string | null;
  slipUrl: string | null;
};
type TopupItem = {
  id: string; userId: string; channel: string; status: string;
  amount: MoneyValue; failureCode: string | null; failureReason: string | null;
  createdAt: string; updatedAt: string;
  user: { id: string; name: string; email: string; image: string | null; role: string };
  slip: SlipData | null;
  trueWallet: null;
};
type TopupSummary = {
  from: string | null; to: string | null;
  totalSuccessAmount: MoneyValue;
  totalSuccessCount: number; totalFailedCount: number;
};
type TopupResponse = {
  ok: boolean; items: TopupItem[];
  pageInfo: { hasMore: boolean; nextCursor: string | null };
  summary: TopupSummary;
};

type Filters = {
  q: string; status: string; channel: string;
  from: string; to: string; limit: number;
};

const DEFAULT_FILTERS: Filters = {
  q: "", status: "", channel: "", from: "", to: "", limit: 20,
};

export default function AdminTopupsPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [qInput, setQInput] = useState("");
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [items, setItems] = useState<TopupItem[]>([]);
  const [summary, setSummary] = useState<TopupSummary | null>(null);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildUrl = useCallback((f: Filters, cur: string | null) => {
    const params = new URLSearchParams();
    params.set("limit", String(f.limit));
    if (f.q) params.set("q", f.q);
    if (f.status) params.set("status", f.status);
    if (f.channel) params.set("channel", f.channel);
    if (f.from) params.set("from", f.from);
    if (f.to) params.set("to", f.to);
    if (cur) params.set("cursor", cur);
    return toApiUrl(`/api/admin/topups?${params.toString()}`);
  }, []);

  const fetchTopups = useCallback(async (f: Filters, append = false) => {
    const cur = append ? cursor : null;
    if (!append) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);

    try {
      const res = await fetch(buildUrl(f, cur), { credentials: "include", cache: "no-store" });
      if (res.status === 401 || res.status === 403) throw new Error("ไม่มีสิทธิ์เข้าถึงข้อมูล");
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");

      const json = (await res.json()) as TopupResponse;
      if (!json.ok) throw new Error("ข้อมูลไม่ถูกต้อง");

      setItems(prev => append ? [...prev, ...json.items] : json.items);
      setSummary(json.summary);
      setCursor(json.pageInfo.nextCursor);
      setHasMore(json.pageInfo.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [buildUrl, cursor]);

  useEffect(() => {
    void fetchTopups(filters, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    setQInput(filters.q);
  }, [filters.q]);

  const handleReset = () => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    setQInput("");
    setFilters(DEFAULT_FILTERS);
  };

  const columns = useMemo<ColumnDef<TopupItem, unknown>[]>(() => [
    {
      header: "ผู้ใช้",
      id: "user",
      cell: ({ row }) => {
        const u = row.original.user;
        return (
          <div className="flex items-center gap-2">
            <div>
              <p className="text-sm font-semibold text-white">{u.name}</p>
              <p className="text-[11px] text-white/50">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      header: "Channel",
      accessorKey: "channel",
      cell: ({ row }) => (
        <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/60">
          {row.original.channel}
        </span>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const s = row.original.status;
        const cls =
          s === "SUCCESS" ? "border-[#285336] bg-[#13261a] text-[#8de3ab]"
          : s === "FAILED" ? "border-[#7a2a34] bg-[#2b1418] text-[#ff9ca8]"
          : "border-[#6d4a1e] bg-[#2d2112] text-[#ffc98a]";
        return <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{s}</span>;
      },
    },
    {
      header: "ยอดเงิน",
      id: "amount",
      cell: ({ row }) => (
        <span className="font-semibold tabular-nums text-white">
          ฿{row.original.amount.formatted}
        </span>
      ),
    },
    {
      header: "ผู้โอน",
      id: "sender",
      cell: ({ row }) => row.original.slip?.senderName ?? "-",
    },
    {
      header: "วันที่",
      accessorKey: "createdAt",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleString("th-TH", {
          dateStyle: "short", timeStyle: "short",
        }),
    },
  ], []);

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white md:text-3xl">ธุรกรรมเติมเงิน</h1>
        <p className="mt-1 text-sm text-white/50">รายการ topup ทั้งหมด</p>
      </div>

      {summary && (
        <div className="mb-5 flex  gap-3">
          {[
            { label: "ยอดสำเร็จรวม", value: `฿${summary.totalSuccessAmount.formatted}`, green: true },
            { label: "รายการสำเร็จ", value: summary.totalSuccessCount },
            { label: "รายการล้มเหลว", value: summary.totalFailedCount, red: true },
            { label: "แสดงผล", value: items.length },
          ].map((c) => (
            <div key={c.label} className="rounded-xl w-full border border-white/10 bg-white/5 px-4 py-3">
              <p className="text-xs text-white/50">{c.label}</p>
              <p className={`mt-1 text-xl font-semibold ${c.green ? "text-[#8de3ab]" : c.red ? "text-[#ff9ca8]" : "text-white"}`}>
                {c.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="flex flex-wrap items-end gap-3">

          {/* ค้นหา — debounce 400ms */}
          <label className="flex flex-col gap-1 flex-1 min-w-[180px]">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">ค้นหา (email / ชื่อ)</span>
            <input
              type="text"
              value={qInput}
              onChange={e => {
                const val = e.target.value;
                setQInput(val);
                if (searchTimer.current) clearTimeout(searchTimer.current);
                searchTimer.current = setTimeout(() => {
                  setFilters(p => ({ ...p, q: val }));
                }, 400);
              }}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  if (searchTimer.current) clearTimeout(searchTimer.current);
                  setFilters(p => ({ ...p, q: qInput }));
                }
              }}
              placeholder="testadmin@email.com"
              className="h-9 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/30"
            />
          </label>

          {/* status, channel — fetch ทันที */}
          {(["status", "channel"] as const).map(key => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{key}</span>
              <select
                value={filters[key]}
                onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
                className="h-9 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none"
              >
                <option value="">ทั้งหมด</option>
                {key === "status"
                  ? ["SUCCESS", "FAILED", "PENDING"].map(v => <option key={v} value={v}>{v}</option>)
                  : ["SLIP_VERIFY", "TRUE_WALLET"].map(v => <option key={v} value={v}>{v}</option>)
                }
              </select>
            </label>
          ))}

          {/* from, to — fetch ทันที */}
          {(["from", "to"] as const).map(key => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">
                {key === "from" ? "จากวันที่" : "ถึงวันที่"}
              </span>
              <input
                type="date"
                value={filters[key]}
                onChange={e => setFilters(p => ({ ...p, [key]: e.target.value }))}
                className="h-9 rounded-lg border border-white/15 bg-white px-3 text-sm text-black outline-none"
              />
            </label>
          ))}

          {/* limit — fetch ทันที */}
          <label className="flex flex-col gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">Limit</span>
            <select
              value={filters.limit}
              onChange={e => setFilters(p => ({ ...p, limit: Number(e.target.value) }))}
              className="h-9 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none"
            >
              {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </label>

          <button
            type="button"
            onClick={handleReset}
            className="h-9 rounded-lg border border-white/20 bg-white/5 px-4 text-sm text-white hover:bg-white/10"
          >
            รีเซ็ต
          </button>
        </div>
      </div>

      <TableAdmin
        columns={columns}
        data={items}
        isLoading={isLoading}
        error={error}
        emptyText="ไม่พบรายการ"
        loadingText="กำลังโหลดรายการ..."
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={() => fetchTopups(filters, true)}
      />
    </div>
  );
}