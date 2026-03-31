"use client";

type UserRole = "admin" | "user";

type ModalUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: UserRole;
};

type RoleChangeModalProps = {
  isOpen: boolean;
  user: ModalUser | null;
  selectedRole: UserRole;
  isSubmitting: boolean;
  onRoleChange: (role: UserRole) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function RoleChangeModal({
  isOpen,
  user,
  selectedRole,
  isSubmitting,
  onRoleChange,
  onClose,
  onConfirm,
}: RoleChangeModalProps) {
  if (!isOpen || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">เปลี่ยนสิทธิ์ผู้ใช้</h2>
        <p className="mt-1 text-sm text-white/70">{user.email ?? user.name ?? user.id}</p>

        <div className="mt-4">
          <label className="mb-1 block text-xs font-semibold text-white/60">เลือก Role</label>
          <select
            value={selectedRole}
            onChange={(event) => onRoleChange(event.target.value as UserRole)}
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
