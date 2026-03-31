"use client";

type AdjustType = "CREDIT" | "DEBIT";
type AdjustTarget = "wallet" | "points";

type ModalUser = {
  id: string;
  name: string | null;
  email: string | null;
};

type AdjustBalanceModalProps = {
  isOpen: boolean;
  user: ModalUser | null;
  target: AdjustTarget;
  adjustType: AdjustType;
  amount: string;
  note: string;
  isSubmitting: boolean;
  onTypeChange: (value: AdjustType) => void;
  onAmountChange: (value: string) => void;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function AdjustBalanceModal({
  isOpen,
  user,
  target,
  adjustType,
  amount,
  note,
  isSubmitting,
  onTypeChange,
  onAmountChange,
  onNoteChange,
  onClose,
  onConfirm,
}: AdjustBalanceModalProps) {
  if (!isOpen || !user) {
    return null;
  }

  const title = target === "wallet" ? "ปรับยอดเงิน" : "ปรับพอยต์";
  const amountLabel = target === "wallet" ? "จำนวนเงิน" : "จำนวนพอยต์";

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">{title}</h2>
        <p className="mt-1 text-sm text-white/70">{user.email ?? user.name ?? user.id}</p>

        <div className="mt-4 grid gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">โหมด</span>
            <select
              value={adjustType}
              onChange={(event) => onTypeChange(event.target.value as AdjustType)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="CREDIT">เพิ่ม (CREDIT)</option>
              <option value="DEBIT">ลด (DEBIT)</option>
            </select>
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">{amountLabel}</span>
            <input
              type="number"
              min="0"
              step={target === "wallet" ? "0.01" : "1"}
              value={amount}
              onChange={(event) => onAmountChange(event.target.value)}
              disabled={isSubmitting}
              placeholder={target === "wallet" ? "เช่น 100.00" : "เช่น 100"}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">หมายเหตุ</span>
            <textarea
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="เช่น Manual correction"
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
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
            {isSubmitting ? "กำลังบันทึก..." : "ยืนยัน"}
          </button>
        </div>
      </div>
    </div>
  );
}
