"use client";
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const NO_IMAGE = "https://img.kapook.com/u/2024/Jarosphan/Home/Appliance/75346/03.jpg";

// สีขอบตามแรร์
const rarityBorder = {
	JACKPOT: "border-yellow-400 shadow-[0_0_24px_8px_rgba(250,204,21,0.2)]",
	SMALL: "border-gray-400 shadow-[0_0_16px_4px_rgba(156,163,175,0.1)]",
	BLANK: "border-white/10",
};

function getBorderClass(poolType: string) {
	if (poolType === "JACKPOT") return rarityBorder.JACKPOT;
	if (poolType === "SMALL") return rarityBorder.SMALL;
	return rarityBorder.BLANK;
}


type Reward = {
	actionId: string;
	kind: string;
	title: string;
	description?: string | null;
	imageUrl?: string | null;
	claimMessage?: string | null;
	value?: {
		points?: number;
		cents?: number;
		baht?: string;
		formatted?: string;
	} | null;
	payoutId?: string | null;
	payoutStatus?: string | null;
	poolType?: string | null;
};

type RewardPopupProps = {
	result: any;
	onClose?: () => void;
};

export default function RewardPopup({ result, onClose }: RewardPopupProps) {
	// รวมรางวัลทุกใบ (เรียงตาม spins)
	const rewards: Reward[] = result?.spins?.flatMap((spin: any) => spin.rewards.map((r: any) => ({ ...r, actionId: spin.actionId })) ) || [];
	// revealed: จำนวน card ที่ flip แล้ว (เปิดรางวัล)
	const [revealed, setRevealed] = useState(0);
	// showAll: กดเปิดทั้งหมด
	const [showAll, setShowAll] = useState(false);

	// เปิด card ทีละใบ (แต่ยังไม่ flip)
	useEffect(() => {
		if (revealed < rewards.length && !showAll) {
			const t = setTimeout(() => setRevealed(r => r + 1), 120);
			return () => clearTimeout(t);
		}
	}, [revealed, rewards.length, showAll]);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
			<div className="bg-[#181818] rounded-2xl p-6 max-w-2xl w-full flex flex-col items-center relative border border-white/10">
				<button onClick={onClose} className="absolute top-2 right-2 text-white/60 hover:text-white text-2xl">×</button>
				<h2 className="text-2xl font-bold text-white mb-4">ผลการสุ่ม {result?.totalSpins ? `(${result.totalSpins} ครั้ง)` : ""}</h2>
				<div className="flex flex-wrap gap-3 justify-center items-center min-h-45 max-h-[60vh] overflow-auto p-2">
					{rewards.map((reward: Reward, idx: number) => (
						<AnimatePresence key={reward.actionId + idx}>
							{idx < revealed && (
								<motion.div
									initial={{ scale: 0.7, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									exit={{ scale: 0.7, opacity: 0 }}
									transition={{ type: "spring", stiffness: 300, damping: 20 }}
									className={`w-32 h-44 rounded-xl border flex flex-col items-center justify-center p-2 bg-linear-to-b from-[#232323] to-[#181818] ${getBorderClass(reward.poolType ?? "")} relative`}
									style={{ perspective: 800 }}
								>
									{/* ฟิล์ม card */}
									{!showAll && (
										<div className="absolute inset-0 flex items-center justify-center z-10">
											<div className="w-full h-full rounded-xl bg-black/60 backdrop-blur-[2px] flex items-center justify-center cursor-pointer select-none">
												<span className="text-white/70 text-lg font-bold">TItGameShop</span>
											</div>
										</div>
									)}
									{/* เนื้อหา card */}
									{showAll && (
										<>
											<div className="relative size-20 mb-2 flex items-center justify-center">
												<Image
													src={reward.imageUrl || NO_IMAGE}
													alt={reward.title}
													fill
													className="object-cover rounded-lg border border-white/10 bg-black"
													unoptimized={!!reward.imageUrl === false}
												/>
											</div>
											<div className="text-white font-bold text-base text-center">{reward.title}</div>
											{reward.value?.points && (
												<div className="text-yellow-300 text-sm font-semibold">+{reward.value.points} Points</div>
											)}
											{reward.value?.formatted && (
												<div className="text-green-400 text-sm font-semibold">+{reward.value.formatted} บาท</div>
											)}
											{reward.kind === "BLANK" && (
												<div className="text-white/50 text-xs mt-1">ไม่ได้รับรางวัล</div>
											)}
											{reward.payoutStatus === "PENDING" && (
												<div className="text-orange-400 text-xs mt-1">รอรับรางวัล</div>
											)}
											{reward.payoutStatus === "FULFILLED" && (
												<div className="text-blue-400 text-xs mt-1">รับแล้ว</div>
											)}
										</>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					))}
				</div>
				<div className="mt-6 w-full flex flex-col items-center">
					<div className="text-white/80 mb-2">รวมทั้งหมด <span className="font-bold text-white">{result?.totalSpins}</span> ครั้ง | ใช้ <span className="font-bold text-[#ff1436]">{result?.totalCost?.formatted}</span> บาท</div>
					{!showAll && revealed === rewards.length && (
						<button onClick={() => setShowAll(true)} className="mt-2 px-6 py-2 rounded-lg bg-linear-to-br from-[#ff1436] to-[#ff7a00] text-white font-bold text-lg shadow hover:scale-105 transition">เปิดทั้งหมด</button>
					)}
					{showAll && (
						<button onClick={onClose} className="mt-2 px-6 py-2 rounded-lg bg-linear-to-br from-[#ff1436] to-[#ff7a00] text-white font-bold text-lg shadow hover:scale-105 transition">ปิดหน้าต่าง</button>
					)}
				</div>
			</div>
		</div>
	);
}
