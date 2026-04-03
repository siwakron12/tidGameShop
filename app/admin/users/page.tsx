"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import RoleChangeModal from "./role-change-modal";
import AdjustBalanceModal from "./adjust-balance-modal";
import UserTransactionsModal from "./transactions";

type UserRole = "admin" | "user";
type SearchField = "email" | "name" | "role";
type SearchOperator = "contains" | "eq";
type AdjustType = "CREDIT" | "DEBIT";
type AdjustTarget = "wallet" | "points";

type AdminUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
  emailVerified: boolean;
  banned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
};

type AdminUsersResponse = {
  ok: boolean;
  users: AdminUser[];
  total: number;
  limit: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [searchField, setSearchField] = useState<SearchField>("email");
  const [searchOperator, setSearchOperator] = useState<SearchOperator>("contains");
  const [searchValue, setSearchValue] = useState("");
  const [updatingRoleId, setUpdatingRoleId] = useState<string | null>(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [selectedRole, setSelectedRole] = useState<UserRole>("user");
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [adjustTarget, setAdjustTarget] = useState<AdjustTarget>("wallet");
  const [adjustType, setAdjustType] = useState<AdjustType>("CREDIT");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustNote, setAdjustNote] = useState("");
  const [adjustingId, setAdjustingId] = useState<string | null>(null);
  const [isTransactionsModalOpen, setIsTransactionsModalOpen] = useState(false);
  const [transactionUser, setTransactionUser] = useState<AdminUser | null>(null);

  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });

      if (searchValue.trim().length > 0) {
        params.set("searchField", searchField);
        params.set("searchOperator", searchOperator);
        params.set("searchValue", searchValue.trim());
      }

      const response = await fetch(toApiUrl(`/api/admin/users?${params.toString()}`), {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์เข้าถึงข้อมูลผู้ใช้");
      }

      if (!response.ok) {
        throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
      }

      const json = (await response.json()) as AdminUsersResponse;

      if (!json.ok) {
        throw new Error("เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง");
      }

      setUsers(Array.isArray(json.users) ? json.users : []);
      setTotal(Number.isFinite(json.total) ? json.total : 0);
    } catch (fetchError) {
      setUsers([]);
      setTotal(0);
      setError(
        fetchError instanceof Error ? fetchError.message : "เกิดข้อผิดพลาดขณะโหลดข้อมูลผู้ใช้",
      );
    } finally {
      setIsLoading(false);
    }
  }, [limit, offset, searchField, searchOperator, searchValue]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const onResetFilters = () => {
    setLimit(20);
    setOffset(0);
    setSearchField("email");
    setSearchOperator("contains");
    setSearchValue("");
  };

  const onClickPromote = useCallback((user: AdminUser) => {
    setSelectedUser(user);
    setSelectedRole(user.role);
    setIsRoleModalOpen(true);
  }, []);

  const onCloseRoleModal = useCallback(() => {
    if (updatingRoleId) {
      return;
    }

    setIsRoleModalOpen(false);
    setSelectedUser(null);
  }, [updatingRoleId]);

  const onConfirmRoleChange = useCallback(async () => {
    if (!selectedUser) {
      return;
    }

    setUpdatingRoleId(selectedUser.id);

    try {
      const response = await fetch(toApiUrl(`/api/admin/users/${selectedUser.id}/role`), {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: selectedRole }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์เปลี่ยน role");
      }

      if (!response.ok) {
        throw new Error("เปลี่ยน role ไม่สำเร็จ");
      }

      toast.success(`เปลี่ยน role เป็น ${selectedRole} สำเร็จ`);
      setIsRoleModalOpen(false);
      setSelectedUser(null);
      await fetchUsers();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "เปลี่ยน role ไม่สำเร็จ");
    } finally {
      setUpdatingRoleId(null);
    }
  }, [fetchUsers, selectedRole, selectedUser]);

  const onOpenAdjustModal = useCallback((user: AdminUser, target: AdjustTarget) => {
    setSelectedUser(user);
    setAdjustTarget(target);
    setAdjustType("CREDIT");
    setAdjustAmount("");
    setAdjustNote("");
    setIsAdjustModalOpen(true);
  }, []);

  const onCloseAdjustModal = useCallback(() => {
    if (adjustingId) {
      return;
    }

    setIsAdjustModalOpen(false);
    setAdjustAmount("");
    setAdjustNote("");
  }, [adjustingId]);

  const onOpenTransactionsModal = useCallback((user: AdminUser) => {
    setTransactionUser(user);
    setIsTransactionsModalOpen(true);
  }, []);

  const onCloseTransactionsModal = useCallback(() => {
    setIsTransactionsModalOpen(false);
    setTransactionUser(null);
  }, []);

  const buildIdempotencyKey = useCallback((target: AdjustTarget, userId: string) => {
    const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return `${target}-adjust-${userId.slice(0, 8)}-${suffix}`;
  }, []);

  const onConfirmAdjust = useCallback(async () => {
    if (!selectedUser) {
      return;
    }

    const normalizedAmount = adjustAmount.trim();
    if (!normalizedAmount) {
      toast.error("กรุณาระบุจำนวน");
      return;
    }

    const amountNumber = Number(normalizedAmount);
    if (!Number.isFinite(amountNumber) || amountNumber <= 0) {
      toast.error("จำนวนต้องมากกว่า 0");
      return;
    }

    setAdjustingId(selectedUser.id);

    try {
      const endpoint = adjustTarget === "wallet" ? "/api/admin/wallet/adjust" : "/api/admin/points/adjust";
      const payload =
        adjustTarget === "wallet"
          ? {
              userId: selectedUser.id,
              type: adjustType,
              amount: amountNumber.toFixed(2),
              note: adjustNote.trim() || "Manual adjustment",
              idempotencyKey: buildIdempotencyKey("wallet", selectedUser.id),
            }
          : {
              userId: selectedUser.id,
              type: adjustType,
              amount: Math.round(amountNumber),
              note: adjustNote.trim() || "Manual adjustment",
              idempotencyKey: buildIdempotencyKey("points", selectedUser.id),
            };

      const response = await fetch(toApiUrl(endpoint), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์ปรับยอด");
      }

      if (!response.ok) {
        throw new Error("ปรับยอดไม่สำเร็จ");
      }

      toast.success(adjustTarget === "wallet" ? "ปรับยอดเงินสำเร็จ" : "ปรับพอยต์สำเร็จ");
      setIsAdjustModalOpen(false);
      setAdjustAmount("");
      setAdjustNote("");
      await fetchUsers();
    } catch (adjustError) {
      toast.error(adjustError instanceof Error ? adjustError.message : "ปรับยอดไม่สำเร็จ");
    } finally {
      setAdjustingId(null);
    }
  }, [adjustAmount, adjustNote, adjustTarget, adjustType, buildIdempotencyKey, fetchUsers, selectedUser]);

  const columns = useMemo<ColumnDef<AdminUser, unknown>[]>(
    () => [
      {
        header: "ชื่อ",
        accessorKey: "name",
        cell: ({ row }) => row.original.name ?? "-",
      },
      {
        header: "อีเมล",
        accessorKey: "email",
        cell: ({ row }) => row.original.email ?? "-",
      },
      {
        header: "Role",
        accessorKey: "role",
        cell: ({ row }) => {
          const role = row.original.role;
          const roleClass =
            role === "admin"
              ? "bg-[#1f2b18] text-[#9ee37d] border-[#35552a]"
              : "bg-[#1a1f2b] text-[#8dc3ff] border-[#2f4c77]";

          return (
            <span className={`rounded-full border px-2 py-1 text-xs font-semibold ${roleClass}`}>
              {role}
            </span>
          );
        },
      },
      {
        header: "ยืนยันอีเมล",
        accessorKey: "emailVerified",
        cell: ({ row }) => (row.original.emailVerified ? "Verified" : "Pending"),
      },
      {
        header: "สถานะ",
        accessorKey: "banned",
        cell: ({ row }) =>
          row.original.banned ? (
            <span className="rounded-full border border-[#7a2a34] bg-[#2b1418] px-2 py-1 text-xs font-semibold text-[#ff9ca8]">
              Banned
            </span>
          ) : (
            <span className="rounded-full border border-[#285336] bg-[#13261a] px-2 py-1 text-xs font-semibold text-[#8de3ab]">
              Active
            </span>
          ),
      },
      {
        header: "Last Login",
        accessorKey: "lastLoginAt",
        cell: ({ row }) => {
          const value = row.original.lastLoginAt;
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
          const user = row.original;

          return (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAdjustModal(user, "wallet")}
                disabled={adjustingId === user.id}
                className="rounded-lg border border-[#2f4c77] bg-[#1a1f2b] px-2.5 py-1.5 text-xs font-semibold text-[#8dc3ff] hover:bg-[#20293a] disabled:cursor-not-allowed disabled:opacity-60"
              >
                เพิ่ม/ลดเงิน
              </button>

              <button
                type="button"
                onClick={() => onOpenAdjustModal(user, "points")}
                disabled={adjustingId === user.id}
                className="rounded-lg border border-[#5a3b7a] bg-[#281d36] px-2.5 py-1.5 text-xs font-semibold text-[#d6b6ff] hover:bg-[#332246] disabled:cursor-not-allowed disabled:opacity-60"
              >
                เพิ่ม/ลดพอยต์
              </button>

              <button
                type="button"
                onClick={() => onOpenTransactionsModal(user)}
                className="rounded-lg border bg-orange-600 border-white/20  px-2.5 py-1.5 text-xs font-semibold text-white/80 hover:bg-orange-700" 
              >
                ดูธุรกรรม
              </button>

              <button
                type="button"
                onClick={() => onClickPromote(user)}
                disabled={updatingRoleId === user.id}
                className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-2.5 py-1.5 text-xs font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updatingRoleId === user.id ? "กำลังเปลี่ยน..." : "เปลี่ยน Role"}
              </button>
           
            </div>
          );
        },
      },
    ],
    [adjustingId, onClickPromote, onOpenAdjustModal, onOpenTransactionsModal, updatingRoleId],
  );

  const from = users.length === 0 ? 0 : offset + 1;
  const to = offset + users.length;

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white md:text-3xl">Users Management</h1>
        <p className="mt-2 text-sm text-white/60">จัดการผู้ใช้ด้วยตัวกรองและคำสั่งจากหน้าแอดมิน</p>
      </div>

      <div className="mb-5 rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">จำนวนต่อหน้า</span>
            <select
              value={limit}
              onChange={(event) => {
                setOffset(0);
                setLimit(Number(event.target.value));
              }}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </label>

     

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">ฟิลด์ค้นหา</span>
            <select
              value={searchField}
              onChange={(event) => {
                setOffset(0);
                setSearchField(event.target.value as SearchField);
              }}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none"
            >
              <option value="email">อีเมล</option>
              <option value="name">ชื่อ</option>
              <option value="role">สิทธิ์</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">เงื่อนไขค้นหา</span>
            <select
              value={searchOperator}
              onChange={(event) => {
                setOffset(0);
                setSearchOperator(event.target.value as SearchOperator);
              }}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none"
            >
              <option value="contains">มีคำนี้</option>
              <option value="eq">เท่ากับ</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">คำค้นหา</span>
            <input
              type="text"
              value={searchValue}
              onChange={(event) => {
                setOffset(0);
                setSearchValue(event.target.value);
              }}
              placeholder="เช่น admin"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40"
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void fetchUsers()}
            className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15"
          >
            ค้นหา
          </button>
          <button
            type="button"
            onClick={onResetFilters}
            className="rounded-lg border border-white/20 bg-transparent px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10"
          >
            รีเซ็ต
          </button>
          <span className="text-xs text-white/55">ผลลัพธ์ {from}-{to} จากทั้งหมด {total}</span>
        </div>
      </div>

      <TableAdmin
        columns={columns}
        data={users}
        isLoading={isLoading}
        error={error}
        emptyText="ไม่พบข้อมูลผู้ใช้"
        loadingText="กำลังโหลดข้อมูลผู้ใช้..."
      />

      <RoleChangeModal
        isOpen={isRoleModalOpen}
        user={selectedUser}
        selectedRole={selectedRole}
        isSubmitting={Boolean(updatingRoleId)}
        onRoleChange={setSelectedRole}
        onClose={onCloseRoleModal}
        onConfirm={() => void onConfirmRoleChange()}
      />

      <AdjustBalanceModal
        isOpen={isAdjustModalOpen}
        user={selectedUser}
        target={adjustTarget}
        adjustType={adjustType}
        amount={adjustAmount}
        note={adjustNote}
        isSubmitting={Boolean(adjustingId)}
        onTypeChange={setAdjustType}
        onAmountChange={setAdjustAmount}
        onNoteChange={setAdjustNote}
        onClose={onCloseAdjustModal}
        onConfirm={() => void onConfirmAdjust()}
      />

      <UserTransactionsModal
        isOpen={isTransactionsModalOpen}
        user={transactionUser}
        onClose={onCloseTransactionsModal}
      />
    </div>
  );
}
