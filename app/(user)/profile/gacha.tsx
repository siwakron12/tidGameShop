"use client";
import React, { useEffect, useState } from "react";
import DynamicHistoryTable from "./dynamic-history-table";
import { toApiUrl } from "@/lib/api-url";

type SpinItem = {
    id: string;
    amount: { baht: string; formatted: string };
    createdAt: string;
    campaign: { id: string; title: string };
    hasReward: boolean;
};

type ClaimItem = {
    id: string;
    status: string;
    poolType: string;
    createdAt: string;
    fulfilledAt?: string;
    campaign: { id: string; title: string };
    reward: {
        id: string;
        title: string;
        description?: string;
        kind: string;
        imageUrl?: string;
        claimMessage?: string;
    };
};

export default function GachaHistory() {
    const [tab, setTab] = useState<"spins" | "claims">("claims");
    const [spins, setSpins] = useState<SpinItem[]>([]);
    const [spinsNextCursor, setSpinsNextCursor] = useState<string | null>(null);
    const [spinsHasMore, setSpinsHasMore] = useState(false);
    const [spinsLoadingMore, setSpinsLoadingMore] = useState(false);
    const [claims, setClaims] = useState<ClaimItem[]>([]);
    const [claimsNextCursor, setClaimsNextCursor] = useState<string | null>(null);
    const [claimsHasMore, setClaimsHasMore] = useState(false);
    const [claimsLoadingMore, setClaimsLoadingMore] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [claimStatus, setClaimStatus] = useState<"PENDING" | "FULFILLED" | "CANCELLED">("PENDING");

    useEffect(() => {
        setError(null);
        setIsLoading(true);
        if (tab === "spins") {
            fetch(toApiUrl("/api/gacha/my-spins"), { credentials: "include" })
                .then((res) => res.json())
                .then((json) => {
                    setSpins(json.items || []);
                    setSpinsNextCursor(json.pageInfo?.nextCursor || null);
                    setSpinsHasMore(!!json.pageInfo?.hasMore);
                })
                .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
                .finally(() => setIsLoading(false));
        } else {
            fetch(toApiUrl(`/api/gacha/my-claims?status=${claimStatus}`), { credentials: "include" })
                .then((res) => res.json())
                .then((json) => {
                    setClaims(json.items || []);
                    setClaimsNextCursor(json.pageInfo?.nextCursor || null);
                    setClaimsHasMore(!!json.pageInfo?.hasMore);
                })
                .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
                .finally(() => setIsLoading(false));
        }
    }, [tab, claimStatus]);

    // Load more for claims
    const handleLoadMoreClaims = () => {
        if (!claimsHasMore || claimsLoadingMore) return;
        setClaimsLoadingMore(true);
        fetch(toApiUrl(`/api/gacha/my-claims?status=${claimStatus}&cursor=${claimsNextCursor}`), { credentials: "include" })
            .then((res) => res.json())
            .then((json) => {
                setClaims((prev) => [...prev, ...(json.items || [])]);
                setClaimsNextCursor(json.pageInfo?.nextCursor || null);
                setClaimsHasMore(!!json.pageInfo?.hasMore);
            })
            .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
            .finally(() => setClaimsLoadingMore(false));
    };

    // Load more for spins (if needed)
    const handleLoadMoreSpins = () => {
        if (!spinsHasMore || spinsLoadingMore) return;
        setSpinsLoadingMore(true);
        fetch(toApiUrl(`/api/gacha/my-spins?cursor=${spinsNextCursor}`), { credentials: "include" })
            .then((res) => res.json())
            .then((json) => {
                setSpins((prev) => [...prev, ...(json.items || [])]);
                setSpinsNextCursor(json.pageInfo?.nextCursor || null);
                setSpinsHasMore(!!json.pageInfo?.hasMore);
            })
            .catch(() => setError("โหลดข้อมูลไม่สำเร็จ"))
            .finally(() => setSpinsLoadingMore(false));
    };

    // Columns for spins
    const spinsColumns = [
        {
            header: "วันที่",
            accessorKey: "createdAt",
            cell: (info: any) => new Date(info.row.original.createdAt).toLocaleString("th-TH"),
        },
        {
            header: "แคมเปญ",
            accessorKey: "campaign.title",
            cell: (info: any) => info.row.original.campaign.title,
        },
        {
            header: "จำนวนเงิน",
            accessorKey: "amount.formatted",
            cell: (info: any) => info.row.original.amount.formatted + " ฿",
        },
        {
            header: "ได้รับรางวัล",
            accessorKey: "hasReward",
            cell: (info: any) => info.row.original.hasReward ? "✔️" : "-",
        },
    ];

    // Columns for claims
    const claimsColumns = [
        {
            header: "วันที่รับรางวัล",
            accessorKey: "fulfilledAt",
            cell: (info: any) => new Date(info.row.original.fulfilledAt || info.row.original.createdAt).toLocaleString("th-TH"),
        },
        {
            header: "แคมเปญ",
            accessorKey: "campaign.title",
            cell: (info: any) => info.row.original.campaign.title,
        },
        {
            header: "รางวัล",
            accessorKey: "reward.title",
            cell: (info: any) => info.row.original.reward.title,
        },
        {
            header: "NOTE",
            accessorKey: "reward.claimMessage",
            cell: (info: any) => info.row.original.reward.claimMessage || "-",
        },
        {
            header: "ทักมาที่เพจ FB",
            accessorKey: "pendingMessage",
            cell: (info: any) => {
                if (info.row.original.status === "PENDING") {
                    return <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">ทักผ่านเพจ fb</a>;
                }
                return "-";
            },
        },
        {
            header: "สถานะ",
            accessorKey: "status",
            cell: (info: any) => {
                const status = info.row.original.status;
                const statusMap: Record<string, { label: string; className: string }> = {
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
                    FULFILLED: {
                        label: "รับแล้ว",
                        className: "border-[#2d6a40] bg-[#14281a] text-[#8ce7ad]",
                    },
                    CANCELLED: {
                        label: "ยกเลิก",
                        className: "border-[#7a2a34] bg-[#2b1418] text-[#ff9ca8]",
                    },
                };
                const statusObj = statusMap[status] || { label: status, className: "border-gray-300 bg-gray-100 text-gray-800" };
                return (
                    <span className={`px-2 py-1 rounded-2xl text-xs font-semibold border ${statusObj.className}`}>{statusObj.label}</span>
                );
            },
        },
    ];

    return (
        <div className="w-full">
            <div className="mb-4 lg:flex gap-2 items-center  lg:justify-between">
                <div>
                    <h2 className="text-lg lg:text-4xl font-bold text-white">ประวัติรายการ</h2>
                </div>
                <div className="flex lg:mt-0 mt-2">
                    <div className="flex rounded-xl bg-[#000000] p-0.5 border border-white/20">
                        <button
                            type="button"
                            onClick={() => setTab("spins")}
                            className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap text-xs sm:text-sm transition ${tab === "spins"
                                ? "bg-[#ff1536] text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            ประวัติการสุ่มทั้งหมด
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab("claims")}
                            className={`shrink-0 rounded-lg px-3 py-1.5 font-semibold whitespace-nowrap text-xs sm:text-sm transition ${tab === "claims"
                                ? "bg-[#ff1536] text-white"
                                : "text-white/70 hover:bg-white/5 hover:text-white"
                                }`}
                        >
                            รางวัลของฉัน
                        </button>
                    </div>   
                    {tab === "claims" && (
                        <select
                            className=" ml-1 lg:ml-4 py-2 px-1 rounded-lg bg-[#181818] text-white border border-white/10 text-sm "
                            value={claimStatus}
                            onChange={e => setClaimStatus(e.target.value as any)}
                        >
                            <option value="PENDING">รอดำเนินการ</option>
                            <option value="FULFILLED">รับแล้ว</option>
                            <option value="CANCELLED">ยกเลิก</option>
                        </select>
                    )}
                </div>

            </div>
            {tab === "spins" ? (
                <>
                    <DynamicHistoryTable columns={spinsColumns as any} data={spins} isLoading={isLoading} error={error} emptyText="ไม่มีประวัติการสุ่ม" />
                    {spinsHasMore && (
                        <div className="mt-4 flex justify-center">
                            <button
                                type="button"
                                onClick={handleLoadMoreSpins}
                                disabled={spinsLoadingMore}
                                className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {spinsLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <>
                    <DynamicHistoryTable columns={claimsColumns as any} data={claims} isLoading={isLoading} error={error} emptyText="ไม่มีรางวัลของฉัน" />
                    {claimsHasMore && (
                        <div className="mt-4 flex justify-center">
                            <button
                                type="button"
                                onClick={handleLoadMoreClaims}
                                disabled={claimsLoadingMore}
                                className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {claimsLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

