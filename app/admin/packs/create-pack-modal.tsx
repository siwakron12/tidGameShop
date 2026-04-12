"use client";

import { useEffect, useState } from "react";

export type CreateManualPackPayload = {
  name: string;
  providerPackCode: string | null;
  providerCost: number;
  sellingPrice: number;
  itemLabel: string | null;
  itemAmount: number | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
};

type CreatePackModalProps = {
  isOpen: boolean;
  isSubmitting: boolean;
  gameName?: string;
  onClose: () => void;
  onSubmit: (payload: CreateManualPackPayload) => Promise<void>;
};

const initialForm = {
  name: "",
  providerPackCode: "",
  providerCost: "",
  sellingPrice: "",
  itemLabel: "",
  itemAmount: "",
  description: "",
  sortOrder: "0",
  isActive: true,
};

export default function CreatePackModal({
  isOpen,
  isSubmitting,
  gameName,
  onClose,
  onSubmit,
}: CreatePackModalProps) {
  const [name, setName] = useState(initialForm.name);
  const [providerPackCode, setProviderPackCode] = useState(initialForm.providerPackCode);
  const [providerCost, setProviderCost] = useState(initialForm.providerCost);
  const [sellingPrice, setSellingPrice] = useState(initialForm.sellingPrice);
  const [itemLabel, setItemLabel] = useState(initialForm.itemLabel);
  const [itemAmount, setItemAmount] = useState(initialForm.itemAmount);
  const [description, setDescription] = useState(initialForm.description);
  const [sortOrder, setSortOrder] = useState(initialForm.sortOrder);
  const [isActive, setIsActive] = useState(initialForm.isActive);

  useEffect(() => {
    if (!isOpen) {
      setName(initialForm.name);
      setProviderPackCode(initialForm.providerPackCode);
      setProviderCost(initialForm.providerCost);
      setSellingPrice(initialForm.sellingPrice);
      setItemLabel(initialForm.itemLabel);
      setItemAmount(initialForm.itemAmount);
      setDescription(initialForm.description);
      setSortOrder(initialForm.sortOrder);
      setIsActive(initialForm.isActive);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async () => {
    const parsedProviderCost = Number(providerCost);
    const parsedSellingPrice = Number(sellingPrice);
    const parsedSortOrder = Number(sortOrder);
    const parsedItemAmount = itemAmount.trim() ? Number(itemAmount) : null;

    await onSubmit({
      name: name.trim(),
      providerPackCode: providerPackCode.trim() || null,
      providerCost: Number.isFinite(parsedProviderCost) ? parsedProviderCost : Number.NaN,
      sellingPrice: Number.isFinite(parsedSellingPrice) ? parsedSellingPrice : Number.NaN,
      itemLabel: itemLabel.trim() || null,
      itemAmount: parsedItemAmount,
      description: description.trim() || null,
      sortOrder: Number.isFinite(parsedSortOrder) ? parsedSortOrder : Number.NaN,
      isActive,
    });
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">เพิ่ม Pack แบบ Manual</h2>
        <p className="mt-1 text-sm text-white/70">
          {gameName ? `เกม: ${gameName}` : "กรอกข้อมูล pack เพื่อสร้างรายการใหม่"}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="ROV Special 500 Coupon"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">providerPackCode</span>
            <input
              value={providerPackCode}
              onChange={(event) => setProviderPackCode(event.target.value)}
              disabled={isSubmitting}
              placeholder="R00500_SPECIAL"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">sortOrder</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              disabled={isSubmitting}
              placeholder="5"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">providerCost</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={providerCost}
              onChange={(event) => setProviderCost(event.target.value)}
              disabled={isSubmitting}
              placeholder="400"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">sellingPrice</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={sellingPrice}
              onChange={(event) => setSellingPrice(event.target.value)}
              disabled={isSubmitting}
              placeholder="480"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">itemLabel</span>
            <input
              value={itemLabel}
              onChange={(event) => setItemLabel(event.target.value)}
              disabled={isSubmitting}
              placeholder="500 Coupon"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">itemAmount</span>
            <input
              type="number"
              min="0"
              step="1"
              value={itemAmount}
              onChange={(event) => setItemAmount(event.target.value)}
              disabled={isSubmitting}
              placeholder="500"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              rows={3}
              placeholder="โปรโมชั่นพิเศษ"
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              disabled={isSubmitting}
              className="h-4 w-4"
            />
            <span className="text-sm text-white/80">isActive</span>
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
            onClick={() => void handleSubmit()}
            disabled={isSubmitting}
            className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "กำลังสร้าง..." : "สร้าง Pack"}
          </button>
        </div>
      </div>
    </div>
  );
}
