"use client";

import { useEffect, useState } from "react";
import UserMoneyTransactionsTable from "./user-money-transactions-table";
import UserPointTransactionsTable from "./user-point-transactions-table";

type ModalUser = {
	id: string;
	name: string | null;
	email: string | null;
};

type TransactionView = "money" | "points";

type UserTransactionsModalProps = {
	isOpen: boolean;
	user: ModalUser | null;
	onClose: () => void;
};

export default function UserTransactionsModal({
	isOpen,
	user,
	onClose,
}: UserTransactionsModalProps) {
	const [view, setView] = useState<TransactionView>("money");

	useEffect(() => {
		if (isOpen) {
			setView("money");
		}
	}, [isOpen, user?.id]);

	if (!isOpen || !user) {
		return null;
	}

	return (
		<div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
			<div className="w-full max-w-6xl rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
				<div className="flex flex-wrap items-start justify-between gap-3">
					<div>
						<h2 className="text-lg font-semibold text-white">ธุรกรรมผู้ใช้</h2>
						<p className="mt-1 text-sm text-white/70">{user.email ?? user.name ?? user.id}</p>
					</div>

					<button
						type="button"
						onClick={onClose}
						className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
					>
						ปิด
					</button>
				</div>

				<div className="mt-4 flex items-center gap-2">
					<button
						type="button"
						onClick={() => setView("money")}
						className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
							view === "money"
								? "border-[#2f4c77] bg-[#1a1f2b] text-[#8dc3ff]"
								: "border-white/20 bg-transparent text-white/70 hover:bg-white/10"
						}`}
					>
						ธุรกรรมเงิน
					</button>

					<button
						type="button"
						onClick={() => setView("points")}
						className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
							view === "points"
								? "border-[#5a3b7a] bg-[#281d36] text-[#d6b6ff]"
								: "border-white/20 bg-transparent text-white/70 hover:bg-white/10"
						}`}
					>
						ธุรกรรมพอยต์
					</button>
				</div>

				<div className="mt-4">
					{view === "money" ? (
						<UserMoneyTransactionsTable userId={user.id} />
					) : (
						<UserPointTransactionsTable userId={user.id} />
					)}
				</div>
			</div>
		</div>
	);
}
