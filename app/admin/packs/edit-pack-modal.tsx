"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";

type MoneyValue = {
  cents: number;
  baht: string;
  formatted: string;
};

export type EditPackTarget = {
  id: string;
  name: string;
  imageUrl: string | null;
  sellingPrice: MoneyValue;
  sortOrder: number;
  profitPercent: number;
  isActive: boolean;
};

type EditPackModalProps = {
  isOpen: boolean;
  pack: EditPackTarget | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export default function EditPackModal({ isOpen, pack, onClose, onSaved }: EditPackModalProps) {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [profitPercent, setProfitPercent] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen || !pack) {
      return;
    }

    setName(pack.name ?? "");
    setImageUrl(pack.imageUrl ?? "");
    setSellingPrice(String(pack.sellingPrice.cents / 100));
    setSortOrder(String(pack.sortOrder));
    setProfitPercent(String(pack.profitPercent));
    setIsActive(Boolean(pack.isActive));
  }, [isOpen, pack]);

  if (!isOpen || !pack) {
    return null;
  }

  const handleSubmit = async () => {
    const parsedSellingPrice = Number(sellingPrice);
    const parsedSortOrder = Number(sortOrder);
    const parsedProfitPercent = Number(profitPercent);

    if (!name.trim()) {
      toast.error("กรุณากรอกชื่อ pack");
      return;
    }

    if (!Number.isFinite(parsedSellingPrice) || parsedSellingPrice < 0) {
      toast.error("sellingPrice ไม่ถูกต้อง");
      return;
    }

    if (!Number.isFinite(parsedSortOrder)) {
      toast.error("sortOrder ไม่ถูกต้อง");
      return;
    }

    if (!Number.isFinite(parsedProfitPercent) || parsedProfitPercent < 0) {
      toast.error("profitPercent ไม่ถูกต้อง");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(toApiUrl(`/api/admin/packs/${pack.id}`), {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          imageUrl: imageUrl.trim() || null,
          sellingPrice: parsedSellingPrice,
          sortOrder: parsedSortOrder,
          profitPercent: parsedProfitPercent,
          isActive,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์แก้ไข pack");
      }

      if (!response.ok) {
        let message = "แก้ไข pack ไม่สำเร็จ";
        try {
          const json = (await response.json()) as { message?: string };
          if (typeof json.message === "string" && json.message.trim()) {
            message = json.message;
          }
        } catch {
          // Keep fallback message when response is not JSON
        }

        throw new Error(message);
      }

      toast.success("แก้ไข pack สำเร็จ");
      await onSaved();
      onClose();
    } catch (updateError) {
      toast.error(updateError instanceof Error ? updateError.message : "แก้ไข pack ไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">แก้ไข Pack</h2>
        <p className="mt-1 text-sm text-white/70">id: {pack.id}</p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">imageUrl</span>
            <input
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              disabled={isSubmitting}
              placeholder="https://example.com/pack.png"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">sortOrder</span>
            <input
              type="number"
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-white/60">profitPercent</span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={profitPercent}
              onChange={(event) => setProfitPercent(event.target.value)}
              disabled={isSubmitting}
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex items-center gap-2 pt-1">
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
            className="rounded-lg border border-[#2f4c77] bg-[#1a1f2b] px-4 py-2 text-sm font-semibold text-[#8dc3ff] hover:bg-[#20293a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "กำลังบันทึก..." : "บันทึก"}
          </button>
        </div>
      </div>
    </div>
  );
}
