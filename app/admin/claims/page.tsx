"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import ApproveClaimModal from "./approve-claim-modal";
import CancelClaimModal from "./cancel-claim-modal";

type MoneyValue = {
	cents: number;
	baht: string;
	formatted: string;
};

type ClaimStatus = "PENDING" | "APPROVED" | "REJECTED" | "FULFILLED" | "CANCELLED" | string;

type ClaimReward = {
	id: string;
	title: string;
	kind: "CREDIT" | "POINT" | "MANUAL_CLAIM" | string;
};

type ClaimUser = {
	id: string;
	name: string | null;
	email: string | null;
	image: string | null;
};

type ClaimItem = {
	id: string;
	campaignId: string;
	milestoneId: string;
	userId: string;
	actionId: string;
	poolType: "JACKPOT" | "SMALL" | "NONE" | string;
	beforePoolAmount: MoneyValue;
	addedAmount: MoneyValue;
	afterPoolAmount: MoneyValue;
	deductedAmount: MoneyValue;
	afterDeductAmount: MoneyValue;
	status: ClaimStatus;
	note: string | null;
	fulfilledAt: string | null;
	fulfilledByAdminId: string | null;
	createdAt: string;
	reward: ClaimReward | null;
	user: ClaimUser | null;
};

type ClaimsResponse = {
	ok: boolean;
	items: ClaimItem[];
	pageInfo?: {
		hasMore?: boolean;
		nextCursor?: string | null;
	};
};

function moneyText(value: MoneyValue | null | undefined) {
	if (!value) {
		return "0.00";
	}

	return value.formatted || value.baht || "0.00";
}

function statusBadgeClass(status: ClaimStatus) {
	if (status === "PENDING") {
		return "border-[#7a6430] bg-[#2f2712] text-[#ffd67c]";
	}

	if (status === "APPROVED" || status === "FULFILLED") {
		return "border-[#2d6a40] bg-[#14281a] text-[#8ce7ad]";
	}

	if (status === "REJECTED" || status === "CANCELLED") {
		return "border-[#7a2a34] bg-[#2b1418] text-[#ff9ca8]";
	}

	return "border-white/15 bg-white/5 text-white/70";
}

export default function AdminClaimsPage() {
	const [claims, setClaims] = useState<ClaimItem[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isLoadingMore, setIsLoadingMore] = useState(false);
	const [isSubmittingAction, setIsSubmittingAction] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [qInput, setQInput] = useState("");
	const [qKeyword, setQKeyword] = useState("");
	const [claimStatus, setClaimStatus] = useState<"PENDING" | "FULFILLED" | "CANCELLED">("PENDING");
	const [nextCursor, setNextCursor] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(false);
	const [selectedClaim, setSelectedClaim] = useState<ClaimItem | null>(null);
	const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
	const [approveNote, setApproveNote] = useState("");
	const [cancelReason, setCancelReason] = useState("");

	const fetchClaims = useCallback(
		async (cursor?: string | null) => {
			const isLoadMore = Boolean(cursor);

			if (isLoadMore) {
				setIsLoadingMore(true);
			} else {
				setIsLoading(true);
			}

			if (!isLoadMore) {
				setError(null);
			}

			try {
				const params = new URLSearchParams();
				if (qKeyword.trim()) {
					params.set("q", qKeyword.trim());
				}
				if (claimStatus) {
					params.set("status", claimStatus);
				}
				if (cursor) {
					params.set("cursor", cursor);
				}

				const query = params.toString();
				const endpoint = query
					? `/api/admin/gacha/claims?${query}`
					: "/api/admin/gacha/claims";

				const response = await fetch(toApiUrl(endpoint), {
					method: "GET",
					credentials: "include",
					cache: "no-store",
				});

				if (response.status === 401 || response.status === 403) {
					throw new Error("ไม่มีสิทธิ์เข้าถึงรายการ claims");
				}

				if (!response.ok) {
					throw new Error("โหลดรายการ claims ไม่สำเร็จ");
				}

				const json = (await response.json()) as ClaimsResponse;

				if (!json.ok) {
					throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
				}

				const incoming = Array.isArray(json.items) ? json.items : [];
				setClaims((prev) => (isLoadMore ? [...prev, ...incoming] : incoming));
				setHasMore(Boolean(json.pageInfo?.hasMore));
				setNextCursor(json.pageInfo?.nextCursor ?? null);
			} catch (fetchError) {
				if (!isLoadMore) {
					setClaims([]);
				}
				setHasMore(false);
				setNextCursor(null);
				setError(fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลด claims");
			} finally {
				if (isLoadMore) {
					setIsLoadingMore(false);
				} else {
					setIsLoading(false);
				}
			}
		},
			[qKeyword, claimStatus],
	);

	useEffect(() => {
		void fetchClaims(null);
	}, [fetchClaims]);

	const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setQKeyword(qInput.trim());
	};

	const handleResetSearch = () => {
		setQInput("");
		setQKeyword("");
	};

	const handleLoadMore = () => {
		if (!nextCursor || isLoadingMore) {
			return;
		}

		void fetchClaims(nextCursor);
	};

	const openApproveModal = useCallback((claim: ClaimItem) => {
		setSelectedClaim(claim);
		setApproveNote("");
		setIsApproveModalOpen(true);
	}, []);

	const openCancelModal = useCallback((claim: ClaimItem) => {
		setSelectedClaim(claim);
		setCancelReason("");
		setIsCancelModalOpen(true);
	}, []);

	const closeApproveModal = useCallback(() => {
		if (isSubmittingAction) {
			return;
		}

		setIsApproveModalOpen(false);
		setApproveNote("");
		if (!isCancelModalOpen) {
			setSelectedClaim(null);
		}
	}, [isCancelModalOpen, isSubmittingAction]);

	const closeCancelModal = useCallback(() => {
		if (isSubmittingAction) {
			return;
		}

		setIsCancelModalOpen(false);
		setCancelReason("");
		if (!isApproveModalOpen) {
			setSelectedClaim(null);
		}
	}, [isApproveModalOpen, isSubmittingAction]);

	const handleApprove = useCallback(async () => {
		if (!selectedClaim) {
			return;
		}

		setIsSubmittingAction(true);
		try {
			const response = await fetch(
				toApiUrl(`/api/admin/gacha/claims/${selectedClaim.id}/approve`),
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ note: approveNote.trim() || undefined }),
				},
			);

			let messageFromApi = "";
			try {
				const json = (await response.json()) as { message?: string };
				if (typeof json?.message === "string") {
					messageFromApi = json.message;
				}
			} catch {
				messageFromApi = "";
			}

			if (!response.ok) {
				throw new Error(messageFromApi || "อนุมัติ claim ไม่สำเร็จ");
			}

			toast.success(messageFromApi || "อนุมัติ claim สำเร็จ");
			setIsApproveModalOpen(false);
			setSelectedClaim(null);
			setApproveNote("");
			await fetchClaims(null);
		} catch (actionError) {
			toast.error(actionError instanceof Error ? actionError.message : "เกิดข้อผิดพลาดขณะอนุมัติ claim");
		} finally {
			setIsSubmittingAction(false);
		}
	}, [approveNote, fetchClaims, selectedClaim]);

	const handleCancel = useCallback(async () => {
		if (!selectedClaim) {
			return;
		}

		const reason = cancelReason.trim();
		if (!reason) {
			toast.error("กรุณากรอกเหตุผลการยกเลิก");
			return;
		}

		setIsSubmittingAction(true);
		try {
			const response = await fetch(
				toApiUrl(`/api/admin/gacha/claims/${selectedClaim.id}/cancel`),
				{
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ reason }),
				},
			);

			let messageFromApi = "";
			try {
				const json = (await response.json()) as { message?: string };
				if (typeof json?.message === "string") {
					messageFromApi = json.message;
				}
			} catch {
				messageFromApi = "";
			}

			if (!response.ok) {
				throw new Error(messageFromApi || "ยกเลิก claim ไม่สำเร็จ");
			}

			toast.success(messageFromApi || "ยกเลิก claim สำเร็จ");
			setIsCancelModalOpen(false);
			setSelectedClaim(null);
			setCancelReason("");
			await fetchClaims(null);
		} catch (actionError) {
			toast.error(actionError instanceof Error ? actionError.message : "เกิดข้อผิดพลาดขณะยกเลิก claim");
		} finally {
			setIsSubmittingAction(false);
		}
	}, [cancelReason, fetchClaims, selectedClaim]);

	const columns = useMemo<ColumnDef<ClaimItem, unknown>[]>(
		() => [
			{
				header: "ผู้ใช้",
				accessorKey: "user.name",
				cell: ({ row }) => (
					<div className="min-w-56 space-y-1 whitespace-normal">
						<p className="font-medium text-white">{row.original.user?.name || "-"}</p>
						<p className="text-xs text-white/55">{row.original.user?.email || "-"}</p>
					</div>
				),
			},
			{
				header: "รางวัล",
				accessorKey: "reward.title",
				cell: ({ row }) => (
					<div className="min-w-56 space-y-1 whitespace-normal">
						<p className="font-medium text-white">{row.original.reward?.title || row.original.reward?.id || "-"}</p>
						<p className="text-xs text-white/55">{row.original.reward?.kind || "-"}</p>
					
					</div>
				),
			},
			{
				header: "สถานะ",
				accessorKey: "status",
				cell: ({ row }) => (
					<span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusBadgeClass(row.original.status)}`}>
						{row.original.status}
					</span>
				),
			},
			
			{
				header: "Deduct",
				accessorKey: "deductedAmount",
				cell: ({ row }) => (
					<div className="space-y-1 text-sm text-white/80">
						<div>Deduct: {moneyText(row.original.deductedAmount)}</div>
						<div>Remain: {moneyText(row.original.afterDeductAmount)}</div>
					</div>
				),
			},
			{
				header: "เวลา",
				accessorKey: "createdAt",
				cell: ({ row }) => (
					<div className="space-y-1 text-sm text-white/80">
						<div>สร้าง: {new Date(row.original.createdAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" })}</div>
						<div>อนุมัติ: {row.original.fulfilledAt ? new Date(row.original.fulfilledAt).toLocaleString("th-TH", { dateStyle: "short", timeStyle: "short" }) : "-"}</div>
					</div>
				),
			},
			{
				header: "หมายเหตุ",
				accessorKey: "note",
				cell: ({ row }) => (
					<div className="min-w-44 whitespace-normal text-sm text-white/70">{row.original.note || "-"}</div>
				),
			},
			{
				header: "จัดการ",
				id: "actions",
				cell: ({ row }) => {
					const claim = row.original;
					const isPending = claim.status === "PENDING";

					if (!isPending) {
						return <span className="text-xs text-white/40">-</span>;
					}

					return (
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => openApproveModal(claim)}
								disabled={isSubmittingAction}
								className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-2.5 py-1.5 text-xs font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
							>
								Approve
							</button>
							<button
								type="button"
								onClick={() => openCancelModal(claim)}
								disabled={isSubmittingAction}
								className="rounded-lg border border-[#7a2a34] bg-[#2b1418] px-2.5 py-1.5 text-xs font-semibold text-[#ff9ca8] hover:bg-[#3a1a20] disabled:cursor-not-allowed disabled:opacity-60"
							>
								Cancel
							</button>
						</div>
					);
				},
			},
		],
		[isSubmittingAction, openApproveModal, openCancelModal],
	);

	return (
		<div className="space-y-6 p-8">
			<div className="space-y-2">
				<h1 className="text-3xl font-bold text-white">Claims</h1>
				<p className="text-sm text-white/55">รายการ claims ที่รอ approve จาก /api/admin/gacha/claims</p>
			</div>

			<form onSubmit={handleSearchSubmit} className="flex flex-wrap items-end gap-3 rounded-2xl border border-white/10 bg-white/3 p-4">
				<label className="min-w-72 flex-1 space-y-1">
					<span className="text-xs font-semibold text-white/60">ค้นหาตามชื่อผู้ใช้ (?q=)</span>
					<input
						value={qInput}
						onChange={(event) => setQInput(event.target.value)}
						placeholder="เช่น admin"
						className="h-10 w-full rounded-lg border border-white/15 bg-black/35 px-3 text-sm text-white outline-none"
					/>
				</label>

				<label className="min-w-48 space-y-1">
					<span className="text-xs font-semibold text-white/60">สถานะ (?status=)</span>
					<select
						value={claimStatus}
						onChange={(event) => setClaimStatus(event.target.value as typeof claimStatus)}
						className="h-10 w-full rounded-lg border border-white/15 bg-black/35 px-3 text-sm text-white outline-none"
					>
						<option value="PENDING">PENDING</option>
						<option value="FULFILLED">FULFILLED</option>
						<option value="CANCELLED">CANCELLED</option>
					</select>
				</label>

				<div className="flex items-center gap-2">
					<button
						type="submit"
						className="h-10 rounded-lg border border-sky-400/40 bg-sky-500/15 px-4 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/25"
					>
						ค้นหา
					</button>
					<button
						type="button"
						onClick={handleResetSearch}
						className="h-10 rounded-lg border border-white/20 bg-white/5 px-4 text-sm font-semibold text-white/80 transition hover:bg-white/10"
					>
						ล้าง
					</button>
				</div>
			</form>

			<TableAdmin
				columns={columns}
				data={claims}
				isLoading={isLoading}
				error={error}
				emptyText="ยังไม่มี claims ที่รออนุมัติ"
				loadingText="กำลังโหลดรายการ claims..."
				hasMore={hasMore}
				isLoadingMore={isLoadingMore}
				onLoadMore={handleLoadMore}
			/>

			<ApproveClaimModal
				isOpen={isApproveModalOpen}
				claim={
					selectedClaim
						? {
								id: selectedClaim.id,
								userName: selectedClaim.user?.name || selectedClaim.user?.email || selectedClaim.userId,
								rewardTitle: selectedClaim.reward?.title || selectedClaim.reward?.id || "-",
							}
						: null
				}
				note={approveNote}
				isSubmitting={isSubmittingAction}
				onNoteChange={setApproveNote}
				onClose={closeApproveModal}
				onConfirm={handleApprove}
			/>

			<CancelClaimModal
				isOpen={isCancelModalOpen}
				claim={
					selectedClaim
						? {
								id: selectedClaim.id,
								userName: selectedClaim.user?.name || selectedClaim.user?.email || selectedClaim.userId,
								rewardTitle: selectedClaim.reward?.title || selectedClaim.reward?.id || "-",
							}
						: null
				}
				reason={cancelReason}
				isSubmitting={isSubmittingAction}
				onReasonChange={setCancelReason}
				onClose={closeCancelModal}
				onConfirm={handleCancel}
			/>
		</div>
	);
}
