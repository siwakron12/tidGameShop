"use client";
import { useEffect, useState } from "react";

type SummaryType = {
  since: string;
  totalCount: number;
  byType: { type: string; count: number }[];
};

type ApiSummaryResponse = {
  ok: boolean;
  summary: SummaryType;
};

const colorMap: Record<string, React.CSSProperties> = {
  GACHA_SPIN: { background: "#14532d", border: "1px solid #15803d", color: "#86efac" },
  CREDIT_ADJUST: { background: "#713f12", border: "1px solid #a16207", color: "#fde047" },
  GACHA_WIN: { background: "#1e3a5f", border: "1px solid #1d4ed8", color: "#93c5fd" },
  POINT_EARN: { background: "#500724", border: "1px solid #9d174d", color: "#f9a8d4" },
};

const defaultStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  border: "1px solid rgba(255,255,255,0.15)",
  color: "rgba(255,255,255,0.8)",
};

export default function NotiSummary() {
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/admin/activities/summary");
        const json: ApiSummaryResponse = await res.json();
        if (!json.ok) throw new Error("โหลดข้อมูลสรุปล้มเหลว");
        setSummary(json.summary);
      } catch (e: any) {
        setError(e.message || "เกิดข้อผิดพลาด");
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, []);

  if (loading) return (
    <div className="mb-4 p-4 rounded-xl border border-white/15 bg-white/5 text-white/60">กำลังโหลดสรุป...</div>
  );
  if (error) return (
    <div className="mb-4 p-4 rounded-xl border border-red-400/30 bg-red-400/10 text-red-300">{error}</div>
  );
  if (!summary) return null;

  return (
    <div className="mb-4 flex gap-4 flex-wrap items-stretch">
      <div
        className="flex-1 min-w-[180px] max-w-xs p-5 rounded-xl flex flex-col justify-between"
        style={{ background: "#171717", border: "1px solid #404040", color: "white" }}
      >
        <div className="text-sm mb-1" style={{ color: "rgba(255,255,255,0.6)" }}>ทั้งหมด</div>
        <div className="text-2xl font-bold">{summary.totalCount.toLocaleString()}</div>
        <div className="text-xs mt-2" style={{ color: "rgba(255,255,255,0.3)" }}>
          ตั้งแต่ {new Date(summary.since).toLocaleString("th-TH")}
        </div>
      </div>
      {summary.byType.map((t) => (
        <div
          key={t.type}
          className="flex-1 min-w-[180px] max-w-xs p-5 rounded-xl flex flex-col justify-between"
          style={colorMap[t.type] || defaultStyle}
        >
          <div className="text-sm mb-1 uppercase tracking-wide" style={{ opacity: 0.8 }}>{t.type}</div>
          <div className="text-2xl font-bold">{t.count.toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
}