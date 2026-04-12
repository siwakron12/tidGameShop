"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Info, User } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { toApiUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import AuthModal from "@/app/components/ui/auth-modal";

type PriceView = {
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
        itemLabel: string | null;
    };
};

type GamePack = {
    id: string;
    name: string;
    description: string | null;
    imageUrl: string | null;
    itemLabel: string | null;
    itemAmount: number | null;
    sellingPrice: PriceView;
    isCustomPack: boolean;
    bundleItems: BundleItem[];
};

type GameDetail = {
    id: string;
    slug: string;
    name: string;
    imageUrl: string | null;
    description: string | null;
    uidLabel: string;
    uidPlaceholder: string | null;
    uidRequired: boolean;
    providerSlug: string;
    packCount: number;
    lowestPrice: PriceView | null;
};

type ProductOrderFlowProps = {
    game: GameDetail;
    packs: GamePack[];
    fallbackCover: string;
};

export function ProductOrderFlow({ game, packs, fallbackCover }: ProductOrderFlowProps) {
    const [uid, setUid] = useState("");
    const [selectedPackId, setSelectedPackId] = useState<string | null>(packs[0]?.id ?? null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const selectedPack = useMemo(
        () => packs.find((pack) => pack.id === selectedPackId) ?? null,
        [packs, selectedPackId],
    );

    const loadSession = useCallback(async () => {
        try {
            const result = await authClient.getSession();
            const record = result as Record<string, unknown> | null;
            const nextSession = (record?.data as unknown) ?? result ?? null;
            const nextRecord = nextSession as Record<string, unknown> | null;
            const hasUser = Boolean(nextRecord && "user" in nextRecord && nextRecord.user);
            setIsLoggedIn(hasUser);
        } catch {
            setIsLoggedIn(false);
        }
    }, []);

    useEffect(() => {
        void loadSession();
    }, [loadSession]);

    useEffect(() => {
        if (!isAuthModalOpen) {
            void loadSession();
        }
    }, [isAuthModalOpen, loadSession]);

    const isOrderDisabled =
        isLoggedIn && (!selectedPack || (game.uidRequired && uid.trim().length === 0) || isLoading);

    const handleOrder = async () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!selectedPack || !uid.trim()) {
            toast.error("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }

        const confirm = await Swal.fire({
            title: "ยืนยันการสั่งซื้อ",
            text: "กรุณาตรวจสอบ UID และแพ็กที่เลือกให้ถูกต้อง เมื่อยืนยันแล้วระบบจะเริ่มทำรายการทันที",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "ยืนยันการสั่งซื้อ",
            cancelButtonText: "ยกเลิก",
            background: "#13161c",
            color: "#f3f4f6",
            confirmButtonColor: "#ef4444",
            cancelButtonColor: "#374151",
        });

        if (!confirm.isConfirmed) {
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(toApiUrl("/api/game-orders"), {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    packId: selectedPack.id,
                    gameUid: uid.trim(),
                    paidWith: "CREDIT",
                }),
            });

            const json = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(json.message ?? "สั่งซื้อไม่สำเร็จ");
            }

            toast.success("สั่งซื้อสำเร็จ");
        } catch (error) {
            const message = error instanceof Error ? error.message : "เกิดข้อผิดพลาด";
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-6 flex  flex-col gap-6 lg:flex-row lg:items-start">
            <div className="space-y-4 w-full">


                <section className="rounded-2xl border border-white/10 bg-[#17191f]/90 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ff334b] px-2 text-sm font-bold text-white">
                            1
                        </span>
                        <h2 className="text-base font-semibold text-white sm:text-lg">ระบุ {game.uidLabel}</h2>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[128px,1fr] sm:items-center">
                        <img
                            src={game.imageUrl ?? fallbackCover}
                            alt={game.name}
                            className="aspect-square w-32 rounded-xl border border-white/10 object-cover sm:w-56"
                        />

                        <div>
                            <section className="rounded-2xl border-2 border-[#f45663] bg-[#1c1013] p-4 sm:p-5">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 shrink-0 text-[#f5081b] mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-white mb-2">วิธีการเติม</h3>
                                        <p className="text-xs text-gray-300 leading-relaxed lg:text-sm">
                                            กรอก UID ของคุณให้ถูกต้อง เลือกแพ็กเกจที่ต้องการ และชำระเงินผ่านเครดิตในระบบ หลังจากนั้นระบบจะทำคาร เติมเกมให้อัตโนมัติ
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <label htmlFor="uid" className="mt-3 block text-xs text-white/70">
                                กรอก {game.uidLabel}
                            </label>
                            <input
                                id="uid"
                                type="text"
                                value={uid}
                                onChange={(event) => setUid(event.target.value)}
                                required={game.uidRequired}
                                placeholder={game.uidPlaceholder ?? "เช่น 12345678"}
                                className="mt-1 h-11 w-full rounded-lg border border-white bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#ff334b]"
                            />
                            <p className="mt-2 text-xs text-white/45">โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนกดสั่งซื้อ</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#17191f]/90 p-4 sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ff334b] px-2 text-sm font-bold text-white">
                            2
                        </span>
                        <h2 className="text-base font-semibold text-white sm:text-lg">เลือกแพ็กเกม</h2>
                    </div>

                    {packs.length === 0 ? (
                        <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-center text-sm text-white/70">
                            ยังไม่มีแพ็กสำหรับเกมนี้
                        </div>
                    ) : (
                        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                            {packs.map((pack) => {
                                const active = pack.id === selectedPackId;

                                return (
                                    <button
                                        key={pack.id}
                                        type="button"
                                        onClick={() => setSelectedPackId(pack.id)}
                                        className={[
                                            "rounded-xl border p-4 text-left transition",
                                            active
                                                ? "border-[#ff334b] bg-[#22161a] shadow-[0_0_0_1px_rgba(255,51,75,0.35)]"
                                                : "border-white/10 bg-black/25 hover:border-white/25",
                                        ].join(" ")}
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">{pack.name}</p>
                                            {pack.bundleItems.length > 0 ? (
                                                <span className="rounded bg-[#96c93d]/20 px-2 py-0.5 text-[10px] font-semibold text-[#b8ec52]">
                                                    +{pack.bundleItems.length} โบนัส
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="mt-1 text-xs text-white/60">{pack.isCustomPack ? "Bundle Pack" : "Normal Pack"}</p>

                                        {pack.itemAmount ? (
                                            <p className="mt-3 text-sm font-semibold text-white/90">
                                                {pack.itemAmount.toLocaleString()} {pack.itemLabel ?? "หน่วย"}
                                            </p>
                                        ) : null}

                                        {pack.description ? <p className="mt-1 line-clamp-2 text-xs text-white/60">{pack.description}</p> : null}

                                        <p className="mt-3 text-lg text-2xl font-bold text-[#98d43b]">฿ {pack.sellingPrice.formatted}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <aside className="sticky top-16 sm:top-20 self-start w-full lg:w-2/4">
                <div className="overflow-hidden rounded-2xl   bg-white">
                    <div className="bg-[#f5081b] px-5 py-4">
                        <h3 className="text-lg font-bold text-white">ช่องทางชำระเงิน</h3>
                    </div>

                    <div className="space-y-3 px-5 py-5 text-sm text-neutral-700">
                        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
                            <span className="text-neutral-500">สินค้า</span>
                            <span className="text-right font-semibold text-neutral-800">{selectedPack?.name ?? "-"}</span>
                        </div>


                        <div className="flex items-center justify-between gap-4 border-b border-neutral-200 pb-3">
                            <span className="text-neutral-500">{game.uidLabel}</span>
                            <span className="font-semibold text-neutral-800">{uid.trim().length > 0 ? uid : "-- -- --"}</span>
                        </div>
                    </div>

                    <div className="px-5 pb-5">
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <p className="text-sm font-semibold text-neutral-700">ยอดชำระรวม</p>
                            <p className="text-right text-4xl font-black tracking-tight text-[#f5081b]">
                                ฿ {selectedPack?.sellingPrice.formatted ?? "0.00"}
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={isOrderDisabled}
                            onClick={handleOrder}
                            className={[
                                "h-12 w-full rounded-lg text-base font-bold transition disabled:cursor-not-allowed",
                                isLoggedIn
                                    ? "bg-[#f5081b] text-white hover:bg-[#dd0517] disabled:bg-neutral-300"
                                    : "border border-white/30 bg-[#4b5563] text-white hover:bg-[#6b7280]",
                            ].join(" ")}
                        >
                            {isLoggedIn ? (
                                isLoading ? "กำลังสั่งซื้อ..." : "ซื้อเลย"
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <User size={18} />
                                    เข้าสู่ระบบก่อนสั่งซื้อ
                                </span>
                            )}
                        </button>

                        <p className="mt-3 text-center text-[11px] text-neutral-400">การกดสั่งซื้อถือว่ายอมรับเงื่อนไขการใช้งาน</p>
                    </div>
                </div>


            </aside>

            <AuthModal
                isOpen={isAuthModalOpen}
                onClose={() => setIsAuthModalOpen(false)}
                initialTab="login"
            />
        </div>
    );
}
