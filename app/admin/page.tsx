"use client";

import { useCallback, useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement,
  Tooltip, Legend,
} from "chart.js";
import { toApiUrl } from "@/lib/api-url";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type MoneyValue = { cents: number; baht: string; formatted: string };

type DashboardData = {
  generatedAt: string;
  kpis: {
    todayRevenue: MoneyValue;
    todayProfit: MoneyValue;
    yesterdayRevenue: MoneyValue;
    revenueChangePercent: number;
    todayOrders: number;
    todayTopups: MoneyValue;
    monthTopups: MoneyValue;
  };
  actionItems: {
    pendingDeposits: number;
    pendingGachaClaims: number;
    stuckOrders: number;
    processingOrders: number;
  };
  users: { total: number; newToday: number; banned: number };
  wallets: { count: number; totalBalance: MoneyValue; totalPoints: number };
  orders: {
    today: { total: number; success: number; failed: number; processing: number; revenue: MoneyValue; profit: MoneyValue };
    allTimeSuccess: number;
  };
  gacha: { today: { spins: number; wins: number; jackpots: number }; pendingClaims: number };
  catalog: {
    activeGames: number; activePacks: number;
    providers: { id: string; slug: string; displayName: string; isActive: boolean }[];
  };
  trend7d: { date: string; total: number; success: number; revenue: MoneyValue }[];
  recentActivities: {
    id: string; type: string; title: string; detail: string | null;
    creditChange: MoneyValue | null; pointChange: null;
    createdAt: string;
    user: { id: string; name: string; email: string; image: string | null };
  }[];
  recentFailedOrders: {
    id: string; status: string; amount: MoneyValue; lastError: string | null;
    createdAt: string;
    game: { name: string; slug: string };
    pack: { name: string };
    user: { id: string; name: string; email: string };
  }[];
};

type DashboardResponse = { ok: boolean; dashboard: DashboardData };

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

function fmtDate(d: string) {
  return new Date(d).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" });
}

function fmtTime(d: string) {
  return new Date(d).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
}

const activityColor: Record<string, string> = {
  GACHA_SPIN: "bg-blue-500/20 text-blue-300",
  GACHA_WIN: "bg-green-500/20 text-green-300",
  GAME_ORDER_FAILED: "bg-yellow-500/20 text-yellow-300",
  REFUND: "bg-emerald-500/20 text-emerald-300",
};

const statusStyle: Record<string, string> = {
  SUCCESS: "border-[#285336] bg-[#13261a] text-[#8de3ab]",
  FAILED: "border-[#7a2a34] bg-[#2b1418] text-[#ff9ca8]",
  REFUNDED: "border-[#6d4a1e] bg-[#2d2112] text-[#ffc98a]",
  PENDING: "border-[#2f4c77] bg-[#1a1f2b] text-[#8dc3ff]",
};

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(toApiUrl("/api/admin/dashboard"), {
        credentials: "include", cache: "no-store",
      });
      if (res.status === 401 || res.status === 403) throw new Error("ไม่มีสิทธิ์เข้าถึงข้อมูล");
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const json = (await res.json()) as DashboardResponse;
      if (!json.ok) throw new Error("ข้อมูลไม่ถูกต้อง");
      setData(json.dashboard);
    } catch (err) {
      setError(err instanceof Error ? err.message : "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void fetchDashboard(); }, [fetchDashboard]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <p className="text-white/50">กำลังโหลด dashboard...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8">
        <p className="text-[#ff9ca8]">{error ?? "ไม่พบข้อมูล"}</p>
        <button
          type="button"
          onClick={() => void fetchDashboard()}
          className="mt-3 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          ลองใหม่
        </button>
      </div>
    );
  }

  const { kpis, actionItems, users, wallets, orders, gacha, catalog, trend7d, recentActivities, recentFailedOrders } = data;
  const changeSign = kpis.revenueChangePercent >= 0 ? "▲" : "▼";
  const changeColor = kpis.revenueChangePercent >= 0 ? "text-[#8de3ab]" : "text-[#ff9ca8]";

  const chartData = {
    labels: trend7d.map((d) =>
      new Date(d.date).toLocaleDateString("th-TH", { day: "numeric", month: "short" })
    ),
    datasets: [
      {
        label: "รายได้ (฿)",
        data: trend7d.map((d) => d.revenue.cents / 100),
        backgroundColor: "#378ADD",
        borderRadius: 4,
        yAxisID: "y",
      },
      {
        label: "orders",
        data: trend7d.map((d) => d.total),
        backgroundColor: "#1D9E75",
        borderRadius: 4,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <div className="p-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">ภาพรวมระบบ</h1>
          <p className="mt-1 text-sm text-white/50">สร้างเมื่อ {fmtDate(data.generatedAt)}</p>
        </div>
        <button
          type="button"
          onClick={() => void fetchDashboard()}
          className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10"
        >
          รีเฟรช
        </button>
      </div>

      {/* KPI Row 1 */}
      <div className="mb-3 flex gap-3">
        {[
          {
            label: "รายได้วันนี้",
            value: `฿${kpis.todayRevenue.formatted}`,
            sub: <span className={changeColor}>{changeSign} {Math.abs(kpis.revenueChangePercent)}% จากเมื่อวาน (฿{kpis.yesterdayRevenue.formatted})</span>,
          },
          { label: "กำไรวันนี้", value: `฿${kpis.todayProfit.formatted}`, sub: `orders: ${kpis.todayOrders}` },
          { label: "ยอดเติมเงินวันนี้", value: `฿${kpis.todayTopups.formatted}`, sub: `เดือนนี้ ฿${kpis.monthTopups.formatted}` },
          { label: "ยอดเงินในกระเป๋า", value: `฿${wallets.totalBalance.formatted}`, sub: `${wallets.count} กระเป๋า · ${wallets.totalPoints.toLocaleString()} pts` },
        ].map((c) => (
          <div key={c.label} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/50">{c.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{c.value}</p>
            <p className="mt-1 text-[11px] text-white/50">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* KPI Row 2 */}
      <div className="mb-5 flex gap-3">
        {[
          { label: "ผู้ใช้ทั้งหมด", value: users.total, sub: `ใหม่วันนี้ ${users.newToday}` },
          { label: "เกมที่เปิดใช้", value: catalog.activeGames, sub: `${catalog.activePacks} packs` },
          { label: "ออเดอร์สำเร็จ (ตลอดกาล)", value: orders.allTimeSuccess, sub: `วันนี้ ${orders.today.success}` },
          { label: "Gacha วันนี้", value: gacha.today.spins, sub: `ชนะ ${gacha.today.wins} · jackpot ${gacha.today.jackpots}` },
        ].map((c) => (
          <div key={c.label} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <p className="text-xs text-white/50">{c.label}</p>
            <p className="mt-1 text-xl font-semibold text-white">{c.value}</p>
            <p className="mt-1 text-[11px] text-white/50">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Chart + Action Items */}
   <div className="mb-5 grid grid-cols-2 gap-5">
  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">รายได้ 7 วันย้อนหลัง</p>
    <div className="mb-3 flex gap-4 text-[11px] text-white/50">
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#378ADD" }} />รายได้ (฿)
      </span>
      <span className="flex items-center gap-1.5">
        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "#1D9E75" }} />orders
      </span>
    </div>

    {/* ✅ wrapper div กำหนด height ตรงนี้ */}
    <div style={{ position: "relative", height: 200 }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) =>
                  ctx.datasetIndex === 0
                    ? `฿${(ctx.parsed.y as number).toFixed(2)}`
                    : `${ctx.parsed.y} orders`,
              },
            },
          },
          scales: {
            x: {
              ticks: { font: { size: 11 }, color: "#888", autoSkip: false, maxRotation: 0 },
              grid: { display: false },
            },
            y: {
              position: "left",
              ticks: { font: { size: 11 }, color: "#888", callback: (v) => `฿${v}` },
              grid: { color: "rgba(255,255,255,0.06)" },
            },
            y1: {
              position: "right",
              ticks: { font: { size: 11 }, color: "#1D9E75", stepSize: 1 },
              grid: { display: false },
            },
          },
        }}
      />
    </div>
  </div>

  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
    <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">รายการต้องดำเนินการ</p>
    {[
      { label: "รอยืนยันเติมเงิน", value: actionItems.pendingDeposits, warn: actionItems.pendingDeposits > 0 },
      { label: "Gacha รอรับของรางวัล", value: actionItems.pendingGachaClaims, warn: actionItems.pendingGachaClaims > 0 },
      { label: "ออเดอร์ค้างอยู่", value: actionItems.stuckOrders, warn: actionItems.stuckOrders > 0 },
      { label: "ออเดอร์กำลังประมวล", value: actionItems.processingOrders, warn: false },
    ].map((item) => (
      <div key={item.label} className="flex items-center justify-between border-b border-white/8 py-2.5 last:border-b-0">
        <span className="text-sm text-white/80">{item.label}</span>
        <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${item.warn ? "border-[#6d4a1e] bg-[#2d2112] text-[#ffc98a]" : "border-[#285336] bg-[#13261a] text-[#8de3ab]"}`}>
          {item.value}
        </span>
      </div>
    ))}
    <div className="mt-4 border-t border-white/10 pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/50">Providers ที่ใช้งาน</p>
      <div className="flex flex-wrap gap-2">
        {catalog.providers.map((p) => (
          <span key={p.id} className="rounded-full border border-[#2f4c77] bg-[#1a1f2b] px-2.5 py-0.5 text-xs font-semibold text-[#8dc3ff]">
            {p.displayName}
          </span>
        ))}
      </div>
    </div>
  </div>
</div>

      {/* Activity + Failed Orders */}
      <div className="grid grid-cols-2 gap-5">
   <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">กิจกรรมล่าสุด</p>
  <div className="overflow-y-auto" style={{ maxHeight: 320 }}>
    {recentActivities.slice(0, 8).map((act) => (
      <div key={act.id} className="flex items-start gap-3  border-b border-white/8 py-2.5 last:border-b-0">
        <div className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${activityColor[act.type] ?? "bg-white/10 text-white/60"}`}>
          {initials(act.user.name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-white">{act.title}</p>
          <p className="text-[11px] text-white/50">
            {act.user.name}{act.creditChange ? ` · ${act.creditChange.cents > 0 ? "+" : ""}฿${act.creditChange.formatted}` : ""}
          </p>
        </div>
        <span className=" text-[11px] mr-4 text-white/40">{fmtTime(act.createdAt)}</span>
      </div>
    ))}
  </div>
</div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">ออเดอร์ล้มเหลวล่าสุด</p>
            {recentFailedOrders.length === 0 ? (
              <p className="py-4 text-center text-sm text-white/40">ไม่มีออเดอร์ล้มเหลว</p>
            ) : (
              recentFailedOrders.map((o) => (
                <div key={o.id} className="flex items-start justify-between gap-3 border-b border-white/8 py-2.5 last:border-b-0">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white">{o.game.name} — {o.pack.name}</p>
                    <p className="truncate text-[11px] text-white/50">{o.user.name} · {o.lastError}</p>
                    <p className="text-[11px] text-white/40">{fmtDate(o.createdAt)}</p>
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-semibold text-white">฿{o.amount.formatted}</p>
                    <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusStyle[o.status] ?? "border-white/20 bg-white/5 text-white/60"}`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-white/50">สถิติ orders วันนี้</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "ทั้งหมด", value: orders.today.total, color: "text-white" },
                { label: "สำเร็จ", value: orders.today.success, color: "text-[#8de3ab]" },
                { label: "ล้มเหลว", value: orders.today.failed, color: "text-[#ff9ca8]" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
                  <p className="text-[11px] text-white/50">{s.label}</p>
                  <p className={`mt-0.5 text-lg font-semibold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}