"use client";
import { useEffect, useState, useCallback } from "react";
import TableAdmin from "../(uiAdmin)/TableAdmin";

type NotiUser = {
  id: string;
  type: string;
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  refType: string | null;
  refId: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

type PageInfo = { hasMore: boolean; nextCursor?: string };

type ApiResponse = {
  ok: boolean;
  items: NotiUser[];
  pageInfo: PageInfo;
};

const columns = [
  {
    header: "เวลา",
    accessorKey: "createdAt",
    cell: ({ getValue }: any) => (
      <span suppressHydrationWarning>{new Date(getValue() as string).toLocaleString("th-TH")}</span>
    ),
  },
  {
    header: "User",
    accessorKey: "user.name",
    cell: ({ row }: any) => (
      <div>
        <div className="font-semibold">{row.original.user.name}</div>
        <div className="text-xs text-white/60">{row.original.user.email}</div>
      </div>
    ),
  },
  {
    header: "ประเภท",
    accessorKey: "type",
  },
  {
    header: "หัวข้อ",
    accessorKey: "title",
  },
  {
    header: "ข้อความ",
    accessorKey: "body",
    cell: ({ row }: any) => row.original.body ?? "-",
  },
  {
    header: "สถานะอ่าน",
    accessorKey: "isRead",
    cell: ({ row }: any) => row.original.isRead ? <span className="text-green-400">อ่านแล้ว</span> : <span className="text-yellow-300">ยังไม่อ่าน</span>,
  },
];

const API_URL = "/api/admin/notifications";

export default function NotiForUser() {
  const [data, setData] = useState<NotiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
  const [type, setType] = useState("");
  const [isRead, setIsRead] = useState("");

  const fetchData = useCallback(async (opts?: { append?: boolean; cursor?: string; type?: string; isRead?: string }) => {
    const params = new URLSearchParams();
    if (opts?.cursor) params.append("cursor", opts.cursor);
    if (opts?.type ?? type) params.append("type", opts?.type ?? type);
    if (opts?.isRead ?? isRead) params.append("isRead", opts?.isRead ?? isRead);
    params.append("limit", "20");
    const url = `${API_URL}?${params.toString()}`;
    try {
      if (opts?.append) setIsLoadingMore(true);
      else setIsLoading(true);
      setError(null);
      const res = await fetch(url);
      const json: ApiResponse = await res.json();
      if (!json.ok) throw new Error("โหลดข้อมูลล้มเหลว");
      setHasMore(json.pageInfo.hasMore);
      setNextCursor(json.pageInfo.nextCursor);
      if (opts?.append) setData((prev) => [...prev, ...json.items]);
      else setData(json.items);
    } catch (e: any) {
      setError(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [type, isRead]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line
  }, [type, isRead]);

  const handleLoadMore = () => {
    if (nextCursor) fetchData({ append: true, cursor: nextCursor });
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Notification (ทุกคน)</h1>
      <div className="flex flex-wrap gap-2 mb-4 items-end rounded-xl border border-white/15 bg-white/5 p-4 shadow-sm">
        <div>
          <label className="block text-xs mb-1">Type</label>
          <select
            className="rounded-lg border border-white/20 bg-[#181818] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={type}
            onChange={e => setType(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            <option value="GACHA_WIN">GACHA_WIN</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>
        </div>
        <div>
          <label className="block text-xs mb-1">สถานะอ่าน</label>
          <select
            className="rounded-lg border border-white/20 bg-[#181818] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={isRead}
            onChange={e => setIsRead(e.target.value)}
          >
            <option value="">ทั้งหมด</option>
            <option value="false">ยังไม่อ่าน</option>
            <option value="true">อ่านแล้ว</option>
          </select>
        </div>
        <button
          className="bg-blue-500 hover:bg-blue-600 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg transition-colors"
          onClick={() => fetchData()}
        >
          ค้นหา
        </button>
      </div>
      <TableAdmin
        columns={columns}
        data={data}
        isLoading={isLoading}
        error={error ?? undefined}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onLoadMore={handleLoadMore}
      />
    </div>
  );
}
