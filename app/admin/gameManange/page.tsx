"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
const MySwal = withReactContent(Swal);
import { toApiUrl } from "@/lib/api-url";
import CreateGameModal, { type CreateGamePayload } from "./create-game-modal";
import EditGameModal, { type EditGamePayload } from "./edit-game-modal";

type ProviderSummary = {
    id: string;
    slug: string;
    displayName: string;
    isActive: boolean;
};

type GameItem = {
    id: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    bannerUrl: string | null;
    description: string | null;
    providerGameCode: string | null;
    providerType: string | null;
    uidLabel: string | null;
    uidPlaceholder: string | null;
    uidRequired: boolean;
    isActive: boolean;
    sortOrder: number;
    updatedAt: string;
    provider: ProviderSummary | null;
    _count: {
        packs: number;
        orders: number;
    };
};

type AdminGamesResponse = {
    ok: boolean;
    items: GameItem[];
};

export default function AdminGameManagePage() {
    const [games, setGames] = useState<GameItem[]>([]);
    const [gameNameFilter, setGameNameFilter] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isUpdatingGame, setIsUpdatingGame] = useState(false);
    const [selectedGame, setSelectedGame] = useState<GameItem | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchGames = useCallback(async () => {
        setError(null);

        try {
            const response = await fetch(toApiUrl("/api/admin/games"), {
                method: "GET",
                credentials: "include",
                cache: "no-store",
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error("ไม่มีสิทธิ์เข้าถึงรายการเกม");
            }

            if (!response.ok) {
                throw new Error("โหลดข้อมูลเกมไม่สำเร็จ");
            }

            const json = (await response.json()) as AdminGamesResponse;

            if (!json.ok || !Array.isArray(json.items)) {
                throw new Error("ข้อมูลเกมไม่ถูกต้อง");
            }

            setGames(json.items);
        } catch (fetchError) {
            setGames([]);
            setError(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดข้อมูลเกม");
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const run = async () => {
            setIsLoading(true);
            await fetchGames();
            if (!cancelled) {
                setIsLoading(false);
            }
        };

        run();

        return () => {
            cancelled = true;
        };
    }, [fetchGames]);

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchGames();
        setIsRefreshing(false);
    }, [fetchGames]);

    const onOpenCreateModal = useCallback(() => {
        setIsCreateModalOpen(true);
    }, []);

    const onCloseCreateModal = useCallback(() => {
        if (isCreating) {
            return;
        }

        setIsCreateModalOpen(false);
    }, [isCreating]);

    const onCreateGame = useCallback(
        async (payload: CreateGamePayload) => {
            const hasValidServerOptions = !payload.serverRequired || payload.serverOptions.length > 0;
            const hasValidServerLabel = !payload.serverRequired || Boolean(payload.serverLabel.trim());

            if (
                !payload.slug ||
                !payload.name ||
                !payload.providerId ||
                !payload.providerGameCode ||
                !payload.providerType ||
                !payload.uidLabel ||
                !payload.uidPlaceholder ||
                !Number.isFinite(payload.sortOrder) ||
                !hasValidServerOptions ||
                !hasValidServerLabel
            ) {
                toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
                return;
            }

            setIsCreating(true);
            try {
                const response = await fetch(toApiUrl("/api/admin/games"), {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                });

                if (response.status === 401 || response.status === 403) {
                    throw new Error("ไม่มีสิทธิ์เพิ่มเกม");
                }

                if (!response.ok) {
                    let message = "เพิ่มเกมไม่สำเร็จ";
                    try {
                        const json = (await response.json()) as { message?: string };
                        if (typeof json.message === "string" && json.message.trim()) {
                            message = json.message;
                        }
                    } catch {
                        // Ignore JSON parse errors and fallback to default message
                    }

                    throw new Error(message);
                }

                toast.success("เพิ่มเกมสำเร็จ");
                setIsCreateModalOpen(false);
                await fetchGames();
            } catch (createError) {
                toast.error(createError instanceof Error ? createError.message : "เพิ่มเกมไม่สำเร็จ");
            } finally {
                setIsCreating(false);
            }
        },
        [fetchGames],
    );

    const onOpenEditModal = useCallback((game: GameItem) => {
        setSelectedGame(game);
        setIsEditModalOpen(true);
    }, []);

    const onCloseEditModal = useCallback(() => {
        if (isUpdatingGame) {
            return;
        }

        setIsEditModalOpen(false);
        setSelectedGame(null);
    }, [isUpdatingGame]);

    const onConfirmEditGame = useCallback(async (payload: EditGamePayload) => {
        if (!selectedGame) {
            return;
        }

        if (
            !payload.name ||
            !payload.slug ||
            !payload.providerId ||
            !payload.providerGameCode ||
            !payload.providerType ||
            !payload.uidLabel ||
            !payload.uidPlaceholder
        ) {
            toast.error("กรุณากรอกข้อมูลที่จำเป็นให้ครบ");
            return;
        }

        setIsUpdatingGame(true);
        try {
            const response = await fetch(toApiUrl(`/api/admin/games/${selectedGame.id}`), {
                method: "PATCH",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (response.status === 401 || response.status === 403) {
                throw new Error("ไม่มีสิทธิ์แก้ไขเกม");
            }

            if (!response.ok) {
                let message = "แก้ไขเกมไม่สำเร็จ";
                try {
                    const json = (await response.json()) as { message?: string };
                    if (typeof json.message === "string" && json.message.trim()) {
                        message = json.message;
                    }
                } catch {
                    // Ignore JSON parse errors and fallback to default message
                }

                throw new Error(message);
            }

            toast.success("อัปเดตข้อมูลเกมสำเร็จ");
            setIsEditModalOpen(false);
            setSelectedGame(null);
            await fetchGames();
        } catch (updateError) {
            toast.error(updateError instanceof Error ? updateError.message : "แก้ไขเกมไม่สำเร็จ");
        } finally {
            setIsUpdatingGame(false);
        }
    }, [fetchGames, selectedGame]);

    const filteredGames = useMemo(() => {
        const keyword = gameNameFilter.trim().toLowerCase();
        if (!keyword) {
            return games;
        }

        return games.filter((game) => {
            return game.name.toLowerCase().includes(keyword) || game.slug.toLowerCase().includes(keyword);
        });
    }, [gameNameFilter, games]);

    const summary = useMemo(() => {
        const activeCount = filteredGames.filter((game) => game.isActive).length;
        const packs = filteredGames.reduce((sum, game) => sum + game._count.packs, 0);
        const orders = filteredGames.reduce((sum, game) => sum + game._count.orders, 0);

        return {
            total: filteredGames.length,
            active: activeCount,
            inactive: Math.max(filteredGames.length - activeCount, 0),
            packs,
            orders,
        };
    }, [filteredGames]);

    const handleDeleteGame = useCallback(async (game: GameItem) => {
        const result = await MySwal.fire({
            title: 'ยืนยันการลบเกม?',
            text: `คุณต้องการลบเกม "${game.name}" หรือไม่? การลบนี้ไม่สามารถย้อนกลับได้`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#222',
            background: '#181818',
            color: '#fff',
            confirmButtonText: 'ลบ',
            cancelButtonText: 'ยกเลิก',
            customClass: {
                popup: 'swal2-dark',
            },
        });
        if (result.isConfirmed) {
            try {
                const res = await fetch(toApiUrl(`/api/admin/games/${game.id}`), {
                    method: 'DELETE',
                    credentials: 'include',
                });
                if (!res.ok) {
                    throw new Error('ลบเกมไม่สำเร็จ');
                }
                toast.success('ลบเกมสำเร็จ');
                await fetchGames();
            } catch (err) {
                toast.error(err instanceof Error ? err.message : 'ลบเกมไม่สำเร็จ');
            }
        }
    }, [fetchGames]);

    const columns = useMemo<ColumnDef<GameItem, unknown>[]>(
        () => [
            {
                header: "Image URL",
                accessorKey: "imageUrl",
                cell: ({ row }) => {
                    const value = row.original.imageUrl?.trim();
                    if (!value) {
                        return "-";
                    }

                    return (
                        <div className="w-12">
                            <img
                                src={value}
                                alt={row.original.name}
                                className="h-12 w-12 rounded-md object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                    const fallback = event.currentTarget.nextElementSibling as HTMLSpanElement | null;
                                    if (fallback) {
                                        fallback.style.display = "inline";
                                    }
                                }}
                            />
                            <span className="hidden text-white/70">-</span>
                        </div>
                    );
                },
            },
            {
                header: "Banner URL",
                accessorKey: "bannerUrl",
                cell: ({ row }) => {
                    const value = row.original.bannerUrl?.trim();
                    if (!value) {
                        return "-";
                    }

                    return (
                        <div className="w-28">
                            <img
                                src={value}
                                alt={`${row.original.name} banner`}
                                className="h-12 w-28 rounded-md object-cover"
                                onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                    const fallback = event.currentTarget.nextElementSibling as HTMLSpanElement | null;
                                    if (fallback) {
                                        fallback.style.display = "inline";
                                    }
                                }}
                            />
                            <span className="hidden text-white/70">-</span>
                        </div>
                    );
                },
            },
            {
                header: "Description",
                accessorKey: "description",
                cell: ({ row }) => {
                    const value = row.original.description?.trim();
                    if (!value) {
                        return "-";
                    }

                    return (
                        <div
                            className={`w-50 h-12.5 overflow-y-auto wrap-break-word ${value?.includes("\n")
                                ? "whitespace-pre overflow-x-auto"
                                : "whitespace-nowrap overflow-x-visible"
                                }`}
                        >
                            {value}
                        </div>
                    );
                },
            },
            {
                header: "เกม",
                accessorKey: "name",
                cell: ({ row }) => {
                    const game = row.original;
                    return (
                        <div className="flex flex-col">
                            <span className="font-semibold text-white">{game.name}</span>
                            <span className="text-xs text-white/55">/{game.slug}</span>
                        </div>
                    );
                },
            },
            {
                header: "Provider",
                id: "provider",
                cell: ({ row }) => {
                    const provider = row.original.provider;
                    if (!provider) {
                        return <span className="text-white/45">-</span>;
                    }

                    return (
                        <div className="flex flex-col">
                            <span className="text-white/90">{provider.displayName}</span>
                            <span className="text-xs text-white/55">{provider.slug}</span>
                        </div>
                    );
                },
            },
            {
                header: "Provider Code",
                accessorKey: "providerGameCode",
                cell: ({ row }) => row.original.providerGameCode ?? "-",
            },
            {
                header: "UID Label",
                accessorKey: "uidLabel",
                cell: ({ row }) => row.original.uidLabel ?? "-",
            },
            {
                header: "UID Placeholder",
                accessorKey: "uidPlaceholder",
                cell: ({ row }) => row.original.uidPlaceholder ?? "-",
            },
            {
                header: "Sort",
                accessorKey: "sortOrder",
                cell: ({ row }) => row.original.sortOrder,
            },
            {
                header: "Packs",
                id: "packs",
                cell: ({ row }) => row.original._count.packs,
            },
            {
                header: "Orders",
                id: "orders",
                cell: ({ row }) => row.original._count.orders,
            },
            {
                header: "สถานะ",
                accessorKey: "isActive",
                cell: ({ row }) =>
                    row.original.isActive ? (
                        <span className="rounded-full border border-[#285336] bg-[#13261a] px-2 py-1 text-xs font-semibold text-[#8de3ab]">
                            Active
                        </span>
                    ) : (
                        <span className="rounded-full border border-[#7a2a34] bg-[#2b1418] px-2 py-1 text-xs font-semibold text-[#ff9ca8]">
                            Inactive
                        </span>
                    ),
            },
            {
                header: "อัปเดตล่าสุด",
                accessorKey: "updatedAt",
                cell: ({ row }) => {
                    const value = row.original.updatedAt;
                    if (!value) {
                        return "-";
                    }

                    return new Date(value).toLocaleString("th-TH", {
                        dateStyle: "short",
                        timeStyle: "short",
                    });
                },
            },
            {
                header: "จัดการ",
                id: "actions",
                cell: ({ row }) => {
                    const game = row.original;
                    return (
                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={() => onOpenEditModal(game)}
                                disabled={isUpdatingGame}
                                className="rounded-lg border border-[#2f4c77] bg-[#1a1f2b] px-2.5 py-1.5 text-xs font-semibold text-[#8dc3ff] hover:bg-[#20293a] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                แก้ไข
                            </button>
                            <button
                                type="button"
                                onClick={() => handleDeleteGame(game)}
                                disabled={isUpdatingGame}
                                className="rounded-lg border border-[#7a2a34] bg-[#2b1418] px-2.5 py-1.5 text-xs font-semibold text-[#ff9ca8] hover:bg-[#3a1a23] disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                ลบ
                            </button>
                        </div>
                    );
                },
            },
        ],
        [isUpdatingGame, onOpenEditModal],
    );

    return (
        <div className="p-6 md:p-8">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white md:text-3xl">Game Management</h1>
                    <p className="mt-2 text-sm text-white/60">รายการเกมจาก /api/admin/games</p>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="text"
                        value={gameNameFilter}
                        onChange={(event) => setGameNameFilter(event.target.value)}
                        placeholder="ค้นหาชื่อเกม..."
                        className="h-10 w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm text-white placeholder:text-white/40 focus:border-white/40 focus:outline-none md:w-64"
                    />

                    <button
                        type="button"
                        onClick={onOpenCreateModal}
                        disabled={isCreating}
                        className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] transition hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        + เพิ่มเกม
                    </button>

                    <button
                        type="button"
                        onClick={() => void onRefresh()}
                        disabled={isLoading || isRefreshing || isCreating}
                        className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isRefreshing ? "กำลังรีเฟรช..." : "รีเฟรช"}
                    </button>
                </div>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-5">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-wide text-white/50">ทั้งหมด</p>
                    <p className="mt-2 text-2xl font-bold text-white">{summary.total}</p>
                </div>
                <div className="rounded-xl border border-[#285336] bg-[#13261a] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#8de3ab]">Active</p>
                    <p className="mt-2 text-2xl font-bold text-[#8de3ab]">{summary.active}</p>
                </div>
                <div className="rounded-xl border border-[#7a2a34] bg-[#2b1418] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#ff9ca8]">Inactive</p>
                    <p className="mt-2 text-2xl font-bold text-[#ff9ca8]">{summary.inactive}</p>
                </div>
                <div className="rounded-xl border border-[#5d4a1b] bg-[#2e2410] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#f6cf6a]">Packs รวม</p>
                    <p className="mt-2 text-2xl font-bold text-[#f6cf6a]">{summary.packs}</p>
                </div>
                <div className="rounded-xl border border-[#2f4c77] bg-[#151f33] p-4">
                    <p className="text-xs uppercase tracking-wide text-[#8dc3ff]">Orders รวม</p>
                    <p className="mt-2 text-2xl font-bold text-[#8dc3ff]">{summary.orders}</p>
                </div>
            </div>

            <TableAdmin
                columns={columns}
                data={filteredGames}
                isLoading={isLoading}
                error={error}
                emptyText={gameNameFilter.trim() ? "ไม่พบเกมที่ค้นหา" : "ไม่พบข้อมูลเกม"}
                loadingText="กำลังโหลดข้อมูลเกม..."
            />

            <CreateGameModal
                isOpen={isCreateModalOpen}
                isSubmitting={isCreating}
                onClose={onCloseCreateModal}
                onSubmit={onCreateGame}
            />

            <EditGameModal
                isOpen={isEditModalOpen}
                isSubmitting={isUpdatingGame}
                game={selectedGame}
                onClose={onCloseEditModal}
                onSubmit={onConfirmEditGame}
            />
        </div>
    );
}
