"use client";

type ClaimPreview = {
  id: string;
  userName: string;
  rewardTitle: string;
};

type ApproveClaimModalProps = {
  isOpen: boolean;
  claim: ClaimPreview | null;
  note: string;
  isSubmitting: boolean;
  onNoteChange: (value: string) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ApproveClaimModal({
  isOpen,
  claim,
  note,
  isSubmitting,
  onNoteChange,
  onClose,
  onConfirm,
}: ApproveClaimModalProps) {
  if (!isOpen || !claim) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">อนุมัติ Claim</h2>
        <p className="mt-1 text-sm text-white/70">{claim.userName} • {claim.rewardTitle}</p>
        <p className="mt-1 text-xs text-white/45">Claim ID: {claim.id}</p>

        <div className="mt-4">
          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">หมายเหตุ (note)</span>
            <textarea
              rows={3}
              value={note}
              onChange={(event) => onNoteChange(event.target.value)}
              disabled={isSubmitting}
              placeholder="เช่น ส่ง skin ให้ทาง LINE แล้ว"
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
            {isSubmitting ? "กำลังอนุมัติ..." : "อนุมัติ"}
          </button>
        </div>
      </div>
    </div>
  );
}
