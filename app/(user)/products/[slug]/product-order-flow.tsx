"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, Info, SquareUser, Star, User } from "lucide-react";
import { toast } from "sonner";
import Swal from "sweetalert2";
import { toApiUrl } from "@/lib/api-url";
import { authClient } from "@/lib/auth-client";
import AuthModal from "@/app/components/ui/auth-modal";
import { useWalletContext } from "../../../components/providers/wallet-context";
import { UidPickerButton } from "./Uidpickerbutton";
import { UidSaveButton } from "./Uidsavebutton";
import Image from "next/image";
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
    howToImg: string | null;
    name: string;
    imageUrl: string | null;
    description: string | null;
    uidLabel: string;
    uidPlaceholder: string | null;
    uidRequired: boolean;
    providerSlug: string;
    packCount: number;
    lowestPrice: PriceView | null;
    serverRequired?: boolean;
    serverLabel?: string;
    serverOptions?: Array<{ label: string; value: string }>;
};

type ProductOrderFlowProps = {
    game: GameDetail;
    packs: GamePack[];
    fallbackCover: string;
};

export function ProductOrderFlow({ game, packs, fallbackCover }: ProductOrderFlowProps) {

    const { refreshBalances } = useWalletContext();
    const [uid, setUid] = useState("");
    const [serverId, setServerId] = useState<string>("");
    const [selectedPackId, setSelectedPackId] = useState<string | null>(packs[0]?.id ?? null);
    const [isLoading, setIsLoading] = useState(false);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isGuideVisible, setIsGuideVisible] = useState(false);
    const [acceptTerms, setAcceptTerms] = useState(false);
    const gameSlug = game.slug;
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
        isLoggedIn && (
            !selectedPack ||
            (game.uidRequired && uid.trim().length === 0) ||
            (game.serverRequired && (!serverId || serverId.trim().length === 0)) ||
            isLoading ||
            !acceptTerms
        );

    const handleOrder = async () => {
        if (!isLoggedIn) {
            setIsAuthModalOpen(true);
            return;
        }

        if (!selectedPack || !uid.trim() || (game.serverRequired && (!serverId || serverId.trim().length === 0))) {
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
            const payload: Record<string, any> = {
                packId: selectedPack.id,
                gameUid: uid.trim(),
                paidWith: "CREDIT",
            };
            if (game.serverRequired && serverId) {
                payload.gameServerId = serverId;
            }
            const response = await fetch(toApiUrl("/api/game-orders"), {
                method: "POST",
                credentials: "include",
                cache: "no-store",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const json = (await response.json()) as { message?: string };

            if (!response.ok) {
                throw new Error(json.message ?? "สั่งซื้อไม่สำเร็จ");
            }

            toast.success("สั่งซื้อสำเร็จ ระบบกำลังดำเนินการเติมเกมให้คุณ...");
            await refreshBalances();
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


                <section className="rounded-2xl border border-white/10 bg-[#17191f]/25 p-4 backdrop-blur-sm sm:p-5">
                    <div className="mb-4 flex items-center gap-2">
                        <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-[#ff334b] px-2 text-sm font-bold text-white">
                            1
                        </span>
                        <h2 className="text-base font-semibold text-white sm:text-lg">ระบุ {game.uidLabel}</h2>
                    </div>

                    <div className="flex  flex-col items-center gap-8 sm:flex-row sm:items-start">
                        <div className="relative aspect-square w-56 shrink-0">
                            <Image
                                src={game.imageUrl ?? fallbackCover}
                                alt={game.name}
                                fill
                                className="rounded-xl border border-white/10 object-cover"
                                sizes="224px"
                            />
                        </div>

                        <div className="w-full  self-center">
                            <section className="rounded-2xl border-2 border-[#f45663] bg-[#1c1013] p-2 ">
                                <div className="flex gap-3">
                                    <Info className="h-5 w-5 shrink-0 text-[#f5081b] mt-0.5" />
                                    <div className="w-full">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="font-semibold text-white ">วิธีการเติม</h3>
                                            <button
                                                type="button"
                                                onClick={() => setIsGuideVisible((prev) => !prev)}
                                                className="inline-flex  items-center justify-center rounded-md border border-white/20 bg-white/5 text-white/80 transition hover:bg-white/10"
                                                aria-label={isGuideVisible ? "ซ่อนวิธีการเติม" : "แสดงวิธีการเติม"}
                                                title={isGuideVisible ? "ซ่อน" : "แสดง"}
                                            >
                                                {isGuideVisible ? <EyeOff size={22} /> : <Eye size={22} />}
                                            </button>
                                        </div>

                                        {isGuideVisible ? (
                                            (game.howToImg && game.howToImg.trim() !== "") ? (
                                                <img
                                                    src={game.howToImg}
                                                    alt="วิธีการเติมเกม"
                                                    className="mt-2 rounded-lg border border-white/15 max-w-full mx-auto h-auto"
                                                    style={{ maxHeight: 500 }}
                                                />
                                            ) : (
                                                <p className="mt-2 text-xs leading-relaxed text-gray-300 lg:text-sm">

                                                    กรอก UID ของคุณให้ถูกต้อง เลือกแพ็กเกจที่ต้องการ และชำระเงินผ่านเครดิตในระบบ หลังจากนั้นระบบจะทำคาร เติมเกมให้อัตโนมัติ
                                                </p>
                                            )
                                        ) : (
                                            <p className="mt-2 text-xs text-white/55">กดไอคอนลูกตาเพื่อแสดงรายละเอียด</p>
                                        )}
                                    </div>
                                </div>
                            </section>

                            <label htmlFor="uid" className="mt-3 block text-xs text-white/70">
                                กรอก {game.uidLabel}
                            </label>
                            <div className="flex items-center gap-2 ">
                                <input
                                    id="uid"
                                    type="text"
                                    value={uid}
                                    onChange={(event) => setUid(event.target.value)}
                                    required={game.uidRequired}
                                    placeholder={game.uidPlaceholder ?? "เช่น 12345678"}
                                    className="mt-1 h-11 w-full rounded-lg border border-white bg-white/5 px-3 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#ff334b]"
                                />
                                <UidSaveButton uid={uid} gameSlug={gameSlug} />
                                <UidPickerButton gameSlug={gameSlug} onSelect={(val) => setUid(val)} />
                            </div>


                            {game.serverRequired && Array.isArray(game.serverOptions) && game.serverOptions.length > 0 && (
                                <>
                                    <label htmlFor="serverId" className="mt-4 block text-xs text-white/70">
                                        {game.serverLabel || "เลือกเซิร์ฟเวอร์"}
                                    </label>
                                    <select
                                        id="serverId"
                                        value={serverId}
                                        onChange={e => setServerId(e.target.value)}
                                        required
                                        className="mt-1 h-11 w-full rounded-lg border border-white bg-black/80 px-3 text-sm text-white outline-none transition focus:border-[#ff334b]"
                                        style={{ colorScheme: 'gray' }}
                                    >
                                        <option value="" className="text-white bg-black">-- เลือก --</option>
                                        {game.serverOptions.map(opt => (
                                            <option key={opt.value} value={opt.value} className="text-white bg-black">{opt.label} </option>
                                        ))}
                                    </select>
                                </>
                            )}

                            <p className="mt-2 text-xs text-white/45">โปรดตรวจสอบข้อมูลให้ถูกต้องก่อนกดสั่งซื้อ</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-2xl border border-white/10 bg-[#17191f]/25 p-4 backdrop-blur-sm sm:p-5">
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
                                        {/* รูป pack ถ้ามี */}
                                        {(pack.imageUrl && pack.imageUrl.trim() !== "") && (
                                            <div className="relative mx-auto mb-2 h-24 w-20">
                                                <Image
                                                    src={pack.imageUrl}
                                                    alt={pack.name}
                                                    fill
                                                    className="rounded-lg border border-white/10 object-cover"
                                                    sizes="80px"
                                                />
                                            </div>
                                        )}
                                        <div className="flex items-start justify-between gap-3">

                                            <p className="line-clamp-2 text-sm font-semibold text-white sm:text-base">{pack.name}</p>
                                            {pack.bundleItems.length > 0 ? (
                                                <span className="rounded bg-[#96c93d]/20 px-2 py-0.5 text-[10px] font-semibold text-[#b8ec52]">
                                                    +{pack.bundleItems.length} โบนัส
                                                </span>
                                            ) : null}
                                        </div>

                                        <p className="mt-1 text-xs text-white/60">{pack.isCustomPack ? "Bundle Pack" : "Normal Pack"}</p>

                                     

                                        {pack.description ? <p className="mt-1 line-clamp-2 text-xs text-white/60">{pack.description}</p> : null}

                                        <p className="mt-3 text-lg  lg:text-2xl font-bold text-[#98d43b]">฿ {pack.sellingPrice.formatted}</p>
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            <aside className="sticky top-16 sm:top-20 self-start w-full lg:w-2/4">
                <div className="overflow-hidden rounded-2xl border border-white/15 bg-[#140b0d] backdrop-blur-xl">
                    <div className="border-b border-white/10 bg-linear-to-r from-[#d90d2c]/85 to-[#a20920]/80 px-5 py-4">
                        <h3 className="text-lg font-bold text-white">การชำระเงิน</h3>
                    </div>

                    <div className="space-y-3 px-5 py-5 text-sm text-white/80">
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-white/55">สินค้า</span>
                            <span className="text-right font-semibold text-white/90">{selectedPack?.name ?? "-"}</span>
                        </div>


                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-white/55">{game.uidLabel}</span>
                            <span className="font-semibold text-white/90">{uid.trim().length > 0 ? uid : "-- -- --"}</span>
                        </div>
                        {game.serverRequired && Array.isArray(game.serverOptions) && game.serverOptions.length > 0 && (
                            <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                                <span className="text-white/55">{game.serverLabel || "Server"}</span>
                                <span className="font-semibold text-white/90">
                                    {serverId
                                        ? (game.serverOptions.find(opt => opt.value === serverId)?.label || serverId)
                                        : "-- -- --"}
                                </span>
                            </div>
                        )}
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-3">
                            <span className="text-white/55">เติมด้วยเครดิตในเว็บไซต์</span>
                            <span className="font-semibold text-white/90">฿ {selectedPack?.sellingPrice.formatted ?? "0.00"}</span>
                        </div>
                    </div>

                    <div className="px-5 pb-5">
                        <div className="mb-4 flex items-end justify-between gap-4">
                            <p className="text-sm font-semibold text-white/75">ยอดชำระรวม</p>
                            <p className="text-right text-4xl font-black tracking-tight text-[#ff5c73]">
                                ฿ {selectedPack?.sellingPrice.formatted ?? "0.00"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <input
                                id="acceptTerms"
                                type="checkbox"
                                style={{ accentColor: "#ff001f" }}
                                checked={acceptTerms}
                                onChange={e => setAcceptTerms(e.target.checked)}
                                className="mt-1 "
                            />
                            <label htmlFor="acceptTerms" className="text-xs text-white/70 select-none cursor-pointer">
                                ข้อมูลถูกต้องและยอมรับเงื่อนไขการให้บริการของเรา
                            </label>
                        </div>
                        <button
                            type="button"
                            disabled={isOrderDisabled}
                            onClick={handleOrder}
                            className={[
                                "h-12 w-full rounded-lg text-base font-bold transition disabled:cursor-not-allowed",
                                isLoggedIn
                                    ? "bg-[#e01230] text-white hover:bg-[#c90f2a] disabled:bg-white/20"
                                    : "border border-white/20 bg-white/10 text-white hover:bg-white/15",
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
