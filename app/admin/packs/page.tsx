"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import { toApiUrl } from "@/lib/api-url";
import CreatePackModal, { type CreateManualPackPayload } from "./create-pack-modal";
import EditPackModal, { type EditPackTarget } from "./edit-pack-modal";
import CreateBundlePackModal from "./create-bundle-pack-modal";

type GameItem = {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  isActive: boolean;
};

type AdminGamesResponse = {
  ok: boolean;
  items: GameItem[];
};

type MoneyValue = {
  cents: number;
  baht: string;
  formatted: string;
};

type BundleItem = {
  id: string;
  quantity: number;
  childPack: {
    id: string;
    name: string;
  };
};

type PackItem = {
  id: string;
  gameId: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  providerPackCode: string | null;
  providerCost: MoneyValue;
  itemLabel: string | null;
  itemAmount: string | number | null;
  sellingPrice: MoneyValue;
  isCustomPack: boolean;
  isActive: boolean;
  sortOrder: number;
  updatedAt: string;
  profit: MoneyValue;
  profitPercent: number;
  bundleItems: BundleItem[];
  _count: {
    orders: number;
  };
};

type AdminGamePacksResponse = {
  ok: boolean;
  game: {
    id: string;
    name: string;
    slug: string;
  };
  items: PackItem[];
};

function moneyText(value: MoneyValue | null | undefined) {
  if (!value) {
    return "0.00";
  }

  return value.formatted || value.baht || "0.00";
}

export default function AdminPacksPage() {
  const [games, setGames] = useState<GameItem[]>([]);
  const [selectedGameId, setSelectedGameId] = useState("");

  const [packs, setPacks] = useState<PackItem[]>([]);
  const [packsGameName, setPacksGameName] = useState("");

  const [isLoadingGames, setIsLoadingGames] = useState(true);
  const [isLoadingPacks, setIsLoadingPacks] = useState(false);
  const [isSyncingPacks, setIsSyncingPacks] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreatingPack, setIsCreatingPack] = useState(false);
  const [isBundleModalOpen, setIsBundleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<EditPackTarget | null>(null);
  const [isDeletingPackId, setIsDeletingPackId] = useState<string | null>(null);
  const [errorGames, setErrorGames] = useState<string | null>(null);
  const [errorPacks, setErrorPacks] = useState<string | null>(null);

  const selectedGame = useMemo(
    () => games.find((game) => game.id === selectedGameId) ?? null,
    [games, selectedGameId],
  );

  const fetchGames = useCallback(async () => {
    setErrorGames(null);

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
        throw new Error("โหลดรายการเกมไม่สำเร็จ");
      }

      const json = (await response.json()) as AdminGamesResponse;

      if (!json.ok || !Array.isArray(json.items)) {
        throw new Error("ข้อมูลเกมไม่ถูกต้อง");
      }

      setGames(json.items);
      setSelectedGameId((prev) => {
        if (prev && json.items.some((item) => item.id === prev)) {
          return prev;
        }

        return json.items[0]?.id ?? "";
      });
    } catch (fetchError) {
      setGames([]);
      setSelectedGameId("");
      setPacks([]);
      setPacksGameName("");
      setErrorGames(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดรายการเกม");
    }
  }, []);

  const fetchPacksByGame = useCallback(async (gameId: string) => {
    if (!gameId) {
      setPacks([]);
      setPacksGameName("");
      return;
    }

    setIsLoadingPacks(true);
    setErrorPacks(null);

    try {
      const response = await fetch(toApiUrl(`/api/admin/games/${gameId}/packs`), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์เข้าถึงรายการแพ็ก");
      }

      if (!response.ok) {
        throw new Error("โหลดรายการแพ็กไม่สำเร็จ");
      }

      const json = (await response.json()) as AdminGamePacksResponse;

      if (!json.ok || !Array.isArray(json.items)) {
        throw new Error("ข้อมูลแพ็กไม่ถูกต้อง");
      }

      setPacks(json.items);
      setPacksGameName(json.game?.name ?? "");
    } catch (fetchError) {
      setPacks([]);
      setPacksGameName("");
      setErrorPacks(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดรายการแพ็ก");
    } finally {
      setIsLoadingPacks(false);
    }
  }, []);

  const syncPacksByGame = useCallback(async () => {
    if (!selectedGameId) {
      toast.error("กรุณาเลือกเกมก่อน");
      return;
    }

    setIsSyncingPacks(true);
    try {
      const response = await fetch(toApiUrl(`/api/admin/games/${selectedGameId}/sync-packs`), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์เชื่อมแพ็กกับ provider");
      }

      if (!response.ok) {
        let message = "เชื่อม pack กับ provider ไม่สำเร็จ";
        try {
          const json = (await response.json()) as { message?: string };
          if (typeof json.message === "string" && json.message.trim()) {
            message = json.message;
          }
        } catch {
          // Keep fallback message when response is not JSON
        }

        throw new Error(message);
      }

      toast.success("เชื่อม pack กับ provider สำเร็จ");
      await fetchPacksByGame(selectedGameId);
    } catch (syncError) {
      toast.error(syncError instanceof Error ? syncError.message : "เชื่อม pack กับ provider ไม่สำเร็จ");
    } finally {
      setIsSyncingPacks(false);
    }
  }, [fetchPacksByGame, selectedGameId]);

  const onOpenCreateModal = useCallback(() => {
    if (!selectedGameId) {
      toast.error("กรุณาเลือกเกมก่อน");
      return;
    }

    setIsCreateModalOpen(true);
  }, [selectedGameId]);

  const onCloseCreateModal = useCallback(() => {
    if (isCreatingPack) {
      return;
    }

    setIsCreateModalOpen(false);
  }, [isCreatingPack]);

  const onCreatePack = useCallback(
    async (payload: CreateManualPackPayload) => {
      if (!selectedGameId) {
        toast.error("กรุณาเลือกเกมก่อน");
        return;
      }

      if (!payload.name.trim()) {
        toast.error("กรุณากรอกชื่อ pack");
        return;
      }

      if (!Number.isFinite(payload.providerCost) || payload.providerCost < 0) {
        toast.error("providerCost ไม่ถูกต้อง");
        return;
      }

      if (!Number.isFinite(payload.sellingPrice) || payload.sellingPrice < 0) {
        toast.error("sellingPrice ไม่ถูกต้อง");
        return;
      }

      if (!Number.isFinite(payload.sortOrder)) {
        toast.error("sortOrder ไม่ถูกต้อง");
        return;
      }

      if (payload.itemAmount !== null && (!Number.isFinite(payload.itemAmount) || payload.itemAmount < 0)) {
        toast.error("itemAmount ไม่ถูกต้อง");
        return;
      }

      setIsCreatingPack(true);
      try {
        const response = await fetch(toApiUrl(`/api/admin/games/${selectedGameId}/packs`), {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("ไม่มีสิทธิ์เพิ่ม pack");
        }

        if (!response.ok) {
          let message = "เพิ่ม pack ไม่สำเร็จ";
          try {
            const json = (await response.json()) as { message?: string };
            if (typeof json.message === "string" && json.message.trim()) {
              message = json.message;
            }
          } catch {
            // Keep fallback message when response is not JSON
          }

          throw new Error(message);
        }

        toast.success("เพิ่ม pack สำเร็จ");
        setIsCreateModalOpen(false);
        await fetchPacksByGame(selectedGameId);
      } catch (createError) {
        toast.error(createError instanceof Error ? createError.message : "เพิ่ม pack ไม่สำเร็จ");
      } finally {
        setIsCreatingPack(false);
      }
    },
    [fetchPacksByGame, selectedGameId],
  );

  const onOpenEditModal = useCallback((pack: PackItem) => {
    setSelectedPack(pack);
    setIsEditModalOpen(true);
  }, []);

  const onCloseEditModal = useCallback(() => {
    setIsEditModalOpen(false);
    setSelectedPack(null);
  }, []);

  const onOpenBundleModal = useCallback(() => {
    if (!selectedGameId) {
      toast.error("กรุณาเลือกเกมก่อน");
      return;
    }

    setIsBundleModalOpen(true);
  }, [selectedGameId]);

  const onCloseBundleModal = useCallback(() => {
    setIsBundleModalOpen(false);
  }, []);

  const onDeleteBundle = useCallback(
    async (packId: string) => {
      if (!packId) {
        toast.error("ไม่พบข้อมูล pack");
        return;
      }

      setIsDeletingPackId(packId);
      try {
        const response = await fetch(toApiUrl(`/api/admin/packs/bundle/${packId}`), {
          method: "DELETE",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("ไม่มีสิทธิ์ลบ bundle pack");
        }

        if (!response.ok) {
          let message = "ลบ bundle pack ไม่สำเร็จ";
          try {
            const json = (await response.json()) as { message?: string };
            if (typeof json.message === "string" && json.message.trim()) {
              message = json.message;
            }
          } catch {
            // Keep fallback message when response is not JSON
          }

          throw new Error(message);
        }

        toast.success("ลบ bundle pack สำเร็จ");
        await fetchPacksByGame(selectedGameId);
      } catch (deleteError) {
        toast.error(deleteError instanceof Error ? deleteError.message : "ลบ bundle pack ไม่สำเร็จ");
      } finally {
        setIsDeletingPackId(null);
      }
    },
    [fetchPacksByGame, selectedGameId],
  );

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setIsLoadingGames(true);
      await fetchGames();
      if (!cancelled) {
        setIsLoadingGames(false);
      }
    };

    void run();

    return () => {
      cancelled = true;
    };
  }, [fetchGames]);
  const [gameSearch, setGameSearch] = useState("");
  const [isGameDropdownOpen, setIsGameDropdownOpen] = useState(false);

  const filteredGames = useMemo(
    () =>
      games.filter((game) =>
        game.name.toLowerCase().includes(gameSearch.toLowerCase()),
      ),
    [games, gameSearch],
  );
  useEffect(() => {
    void fetchPacksByGame(selectedGameId);
  }, [fetchPacksByGame, selectedGameId]);

  const columns = useMemo<ColumnDef<PackItem, unknown>[]>(
    () => [
      {
        header: "ชื่อแพ็ก",
        accessorKey: "name",
      },
      {
        header: "รหัส Provider",
        accessorKey: "providerPackCode",
        cell: ({ row }) => row.original.providerPackCode ?? "-",
      },
      {
        header: "ต้นทุน",
        id: "providerCost",
        cell: ({ row }) => moneyText(row.original.providerCost),
      },
      {
        header: "ราคาขาย",
        id: "sellingPrice",
        cell: ({ row }) => moneyText(row.original.sellingPrice),
      },
      {
        header: "กำไร",
        id: "profit",
        cell: ({ row }) => moneyText(row.original.profit),
      },
      {
        header: "% กำไร",
        accessorKey: "profitPercent",
        cell: ({ row }) => `${row.original.profitPercent.toFixed(2)}%`,
      },
      {
        header: "Bundle",
        id: "bundleItems",
        cell: ({ row }) => row.original.bundleItems.length,
      },
      {
        header: "Orders",
        id: "orders",
        cell: ({ row }) => row.original._count.orders,
      },
      {
        header: "Sort",
        accessorKey: "sortOrder",
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
        cell: ({ row }) =>
          new Date(row.original.updatedAt).toLocaleString("th-TH", {
            dateStyle: "short",
            timeStyle: "short",
          }),
      },
      {
        header: "จัดการ",
        id: "actions",
        cell: ({ row }) => {
          const isBundle = row.original.bundleItems.length > 0;
          const isDeleting = isDeletingPackId === row.original.id;

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenEditModal(row.original)}
                disabled={isDeleting}
                className="rounded-lg border border-[#2f4c77] bg-[#1a1f2b] px-2.5 py-1.5 text-xs font-semibold text-[#8dc3ff] hover:bg-[#20293a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                แก้ไข
              </button>
              {isBundle && (
                <button
                  type="button"
                  onClick={() => onDeleteBundle(row.original.id)}
                  disabled={isDeleting}
                  className="rounded-lg border border-[#7a2a34] bg-[#2b1418] px-2.5 py-1.5 text-xs font-semibold text-[#ff9ca8] hover:bg-[#3d1c23] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isDeleting ? "กำลังลบ..." : "ลบ"}
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onOpenEditModal, isDeletingPackId, onDeleteBundle],
  );

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Packs Management</h1>
        <p className="mt-2 text-sm text-white/60">เลือกเกมด้วย id แล้วโหลดแพ็กจาก /api/admin/games/:id/packs</p>
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,360px)_1fr]">
          <label className="flex flex-col gap-1 relative">
            <span className="text-xs font-semibold text-white/60">เลือกเกม</span>

            <div className="relative">
              <input
                type="text"
                value={isGameDropdownOpen ? gameSearch : (selectedGame?.name ?? "")}
                onChange={(e) => setGameSearch(e.target.value)}
                onFocus={() => {
                  setGameSearch("");
                  setIsGameDropdownOpen(true);
                }}
                onBlur={() => setTimeout(() => setIsGameDropdownOpen(false), 150)}
                disabled={isLoadingGames || games.length === 0}
                placeholder="ค้นหาเกม..."
                className="h-10 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
              />

              {isGameDropdownOpen && (
                <ul className="absolute z-50 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-white/15 bg-[#000000] shadow-xl">
                  {filteredGames.length === 0 ? (
                    <li className="px-3 py-2 text-sm text-white/40">ไม่พบเกม</li>
                  ) : (
                    filteredGames.map((game) => (
                      <li
                        key={game.id}
                        onMouseDown={() => {
                          setSelectedGameId(game.id);
                          setIsGameDropdownOpen(false);
                        }}
                        className={`cursor-pointer px-3 py-2 text-sm hover:bg-white/10 ${game.id === selectedGameId ? "bg-white/5 text-[#8dc3ff]" : "text-white"
                          }`}
                      >
                        {game.name}
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </label>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <p className="text-xs font-semibold text-white/60">เกมที่เลือก</p>
            {selectedGame ? (
              <div className="mt-2 flex items-center gap-3">
                {selectedGame.imageUrl ? (
                  <img
                    src={selectedGame.imageUrl}
                    alt={selectedGame.name}
                    className="h-14 w-14 rounded-lg border border-white/10 object-cover"
                    onError={(event) => {
                      event.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-xs text-white/55">
                    no img
                  </div>
                )}

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{selectedGame.name}</p>
                  <p className="truncate text-xs text-white/55">/{selectedGame.slug}</p>
                  <p className="truncate text-[11px] text-white/45">id: {selectedGame.id}</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-white/55">ยังไม่ได้เลือกเกม</p>
            )}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchGames()}
            disabled={isLoadingGames}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingGames ? "กำลังโหลดเกม..." : "รีโหลดเกม"}
          </button>

          <button
            type="button"
            onClick={() => void fetchPacksByGame(selectedGameId)}
            disabled={!selectedGameId || isLoadingPacks || isSyncingPacks}
            className="rounded-lg border border-[#2f4c77] bg-[#1a1f2b] px-4 py-2 text-sm font-semibold text-[#8dc3ff] hover:bg-[#20293a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingPacks ? "กำลังโหลดแพ็ก..." : "รีโหลดแพ็กเกมนี้"}
          </button>

          <button
            type="button"
            onClick={() => void syncPacksByGame()}
            disabled={!selectedGameId || isSyncingPacks || isLoadingPacks || isCreatingPack}
            className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSyncingPacks ? "กำลังเชื่อม pack..." : "เชื่อม pack กับ provider"}
          </button>

          <button
            type="button"
            onClick={onOpenCreateModal}
            disabled={!selectedGameId || isCreatingPack || isSyncingPacks}
            className="rounded-lg border border-[#6d4a1e] bg-[#2d2112] px-4 py-2 text-sm font-semibold text-[#ffc98a] hover:bg-[#3a2916] disabled:cursor-not-allowed disabled:opacity-60"
          >
            + เพิ่ม pack manual
          </button>

          <button
            type="button"
            onClick={onOpenBundleModal}
            disabled={!selectedGameId || isLoadingPacks || isSyncingPacks}
            className="rounded-lg border border-[#4f46e5] bg-[#1f1e44] px-4 py-2 text-sm font-semibold text-[#c7c3ff] hover:bg-[#27265a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            + สร้าง bundle pack
          </button>


        </div>

        {errorGames ? (
          <p className="mt-3 text-sm text-[#ff9ca8]">{errorGames}</p>
        ) : null}
      </div>

      <TableAdmin
        columns={columns}
        data={packs}
        isLoading={isLoadingPacks}
        error={errorPacks}
        emptyText={selectedGameId ? "ไม่พบแพ็กของเกมนี้" : "กรุณาเลือกเกมก่อน"}
        loadingText="กำลังโหลดรายการแพ็ก..."
      />

      <CreatePackModal
        isOpen={isCreateModalOpen}
        isSubmitting={isCreatingPack}
        gameName={selectedGame?.name}
        onClose={onCloseCreateModal}
        onSubmit={onCreatePack}
      />

      <EditPackModal
        isOpen={isEditModalOpen}
        pack={selectedPack}
        onClose={onCloseEditModal}
        onSaved={() => fetchPacksByGame(selectedGameId)}
      />

      <CreateBundlePackModal
        isOpen={isBundleModalOpen}
        gameId={selectedGameId}
        gameName={selectedGame?.name}
        availablePacks={packs}
        onClose={onCloseBundleModal}
        onSaved={() => fetchPacksByGame(selectedGameId)}
      />
    </div>
  );
}
