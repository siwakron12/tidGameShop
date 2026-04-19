"use client";
import { useEffect, useState, useCallback } from "react";
import NotiTable, { Activity } from "./NotiTable";
import NotiSummary from "./NotiSummary";

type PageInfo = { hasMore: boolean; nextCursor?: string };

type ApiResponse = {
    ok: boolean;
    items: Activity[];
    pageInfo: PageInfo;
};

const API_URL = "/api/admin/activities";

export default function NotiActivityLog() {
    const [data, setData] = useState<Activity[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);
    const [q, setQ] = useState("");
    const [type, setType] = useState("");

    const fetchData = useCallback(async (opts?: { append?: boolean; cursor?: string; q?: string; type?: string }) => {
        const params = new URLSearchParams();
        if (opts?.cursor) params.append("cursor", opts.cursor);
        if (opts?.q ?? q) params.append("q", opts?.q ?? q);
        if (opts?.type ?? type) params.append("type", opts?.type ?? type);
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
    }, [q, type]);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line
    }, [q, type]);

    const handleLoadMore = () => {
        if (nextCursor) fetchData({ append: true, cursor: nextCursor });
    };

    // Simple filter UI
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">กิจกรรม (Activity Log)</h1>
            <NotiSummary />

            <div className="flex flex-wrap gap-2 mb-4 items-end rounded-xl border border-white/15 bg-white/5 p-4 shadow-sm">
                <div>
                    <label className="block text-xs mb-1">ค้นหา</label>
                    <input
                        className="rounded-lg border  border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        placeholder="ชื่อกิจกรรม,อีเมล,ชื่อผู้ใช้..."
                        value={q}
                        onChange={e => setQ(e.target.value)}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">Type</label>
                    <select
                        className="rounded-lg border border-white/20 bg-[#181818] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={type}
                        onChange={e => setType(e.target.value)}
                    >
                        <option value="">ทั้งหมด</option>
                        <option value="GACHA_SPIN">GACHA_SPIN</option>
                        <option value="CREDIT_ADJUST">CREDIT_ADJUST</option>
                        <option value="GACHA_WIN">GACHA_WIN</option>
                        <option value="POINT_EARN">POINT_EARN</option>
                    </select>
                </div>
                <button
                    className="bg-red-500 hover:bg-red-600 cursor-pointer text-white font-semibold py-2 px-4 rounded-lg transition-colors"
                    onClick={() => fetchData()}
                >
                    ค้นหา
                </button>
            </div>

            <NotiTable
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
