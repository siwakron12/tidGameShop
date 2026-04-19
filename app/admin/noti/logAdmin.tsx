"use client";
import { useEffect, useState } from "react";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  adminId: string;
  action: string;
  target: string;
  before: any;
  after: any;
  note: string | null;
  ipAddress: string;
  createdAt: string;
}

interface AuditLogResponse {
  ok: boolean;
  items: AuditLog[];
  pageInfo: {
    hasMore: boolean;
    nextCursor?: string;
  };
}

export default function LogAdmin() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [limit] = useState(20);
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [adminId, setAdminId] = useState("");
  const [action, setAction] = useState("");
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchLogs(true, { adminId: "", action: "" });
  }, []);

  const fetchLogs = async (reset = false, overrides?: { adminId?: string; action?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("limit", limit.toString());
      if (!reset && cursor) params.set("cursor", cursor);
      const _adminId = overrides?.adminId !== undefined ? overrides.adminId : adminId;
      const _action = overrides?.action !== undefined ? overrides.action : action;
      if (_adminId) params.set("adminId", _adminId);
      if (_action) params.set("action", _action);
      const res = await fetch(`/api/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error("โหลดข้อมูลไม่สำเร็จ");
      const data: AuditLogResponse = await res.json();
      setLogs(prev => reset ? data.items : [...prev, ...data.items]);
      setHasMore(data.pageInfo.hasMore);
      setCursor(data.pageInfo.nextCursor);
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
      toast.error(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCursor(undefined);
    fetchLogs(true);
  };

  const handleClear = () => {
    setAdminId("");
    setAction("");
    setCursor(undefined);
    fetchLogs(true, { adminId: "", action: "" });
  };

  return (
    <div>
      {/* Filter Bar */}
      <div className="mb-6 rounded-xl border border-white/10 bg-white/5 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="block text-xs text-white/50 mb-1">Admin ID</label>
            <input
              className="rounded-lg border border-white/15 bg-[#181818] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ค้นหา adminId"
              value={adminId}
              onChange={e => setAdminId(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs text-white/50 mb-1">Action</label>
            <input
              className="rounded-lg border border-white/15 bg-[#181818] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="เช่น refund, ban, game"
              value={action}
              onChange={e => setAction(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition"
            style={{ background: "#2563eb" }}
            onMouseOver={e => (e.currentTarget.style.background = "#1d4ed8")}
            onMouseOut={e => (e.currentTarget.style.background = "#2563eb")}
          >
            ค้นหา
          </button>
          {(adminId || action) && (
            <button
              type="button"
              onClick={handleClear}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white/60 hover:text-white bg-white/5 hover:bg-white/10 transition"
            >
              ล้าง
            </button>
          )}
        </form>
      </div>

      {/* Table */}
      <TableAdmin
        columns={[
          {
            header: "เวลา",
            accessorKey: "createdAt",
            cell: ({ row }: any) => (
              <span className="text-white/60 text-xs">
                {new Date(row.original.createdAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}
              </span>
            ),
          },
          {
            header: "Admin",
            accessorKey: "adminId",
            cell: ({ row }: any) => (
              <span className="font-mono text-xs text-blue-300">{row.original.adminId}</span>
            ),
          },
          {
            header: "Action",
            accessorKey: "action",
            cell: ({ row }: any) => (
              <span
                className="px-2 py-0.5 rounded-full text-xs font-semibold"
                style={{ background: "rgba(234,179,8,0.15)", color: "#fde047" }}
              >
                {row.original.action}
              </span>
            ),
          },
          {
            header: "Target",
            accessorKey: "target",
            cell: ({ row }: any) => (
              <span className="font-mono text-xs text-white/70">{row.original.target}</span>
            ),
          },
          {
            header: "IP",
            accessorKey: "ipAddress",
            cell: ({ row }: any) => (
              <span className="font-mono text-xs text-white/50">{row.original.ipAddress}</span>
            ),
          },
          {
            header: "Note",
            accessorKey: "note",
            cell: ({ row }: any) => (
              <span className="text-xs text-white/60">{row.original.note || "-"}</span>
            ),
          },
          {
            header: "ก่อน",
            accessorKey: "before",
            cell: ({ row }: any) =>
              row.original.before ? (
                <pre className="whitespace-pre-wrap text-xs text-orange-300 max-w-[200px]">
                  {JSON.stringify(row.original.before, null, 2)}
                </pre>
              ) : (
                <span className="text-white/30 text-xs">-</span>
              ),
          },
          {
            header: "หลัง",
            accessorKey: "after",
            cell: ({ row }: any) =>
              row.original.after ? (
                <pre className="whitespace-pre-wrap text-xs text-green-300 max-w-[200px]">
                  {JSON.stringify(row.original.after, null, 2)}
                </pre>
              ) : (
                <span className="text-white/30 text-xs">-</span>
              ),
          },
        ]}
        data={logs}
        isLoading={loading}
        error={error}
        hasMore={hasMore}
        isLoadingMore={loading && logs.length > 0}
        onLoadMore={() => fetchLogs(false)}
      />
    </div>
  );
}