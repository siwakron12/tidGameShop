"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { toApiUrl } from "@/lib/api-url";

type BundleCandidatePack = {
  id: string;
  name: string;
  providerPackCode: string | null;
  sellingPrice: {
    formatted: string;
  };
};

type CreateBundlePackModalProps = {
  isOpen: boolean;
  gameId: string;
  gameName?: string;
  availablePacks: BundleCandidatePack[];
  onClose: () => void;
  onSaved: () => Promise<void> | void;
};

export default function CreateBundlePackModal({
  isOpen,
  gameId,
  gameName,
  availablePacks,
  onClose,
  onSaved,
}: CreateBundlePackModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sellingPrice, setSellingPrice] = useState("");
  const [sortOrder, setSortOrder] = useState("99");
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setName("");
      setDescription("");
      setSellingPrice("");
      setSortOrder("99");
      setSelectedMap({});
    }
  }, [isOpen]);

  const selectedCount = useMemo(() => Object.keys(selectedMap).length, [selectedMap]);

  if (!isOpen) {
    return null;
  }

  const togglePack = (packId: string) => {
    setSelectedMap((prev) => {
      if (prev[packId]) {
        const next = { ...prev };
        delete next[packId];
        return next;
      }

      return {
        ...prev,
        [packId]: 1,
      };
    });
  };

  const updateQuantity = (packId: string, rawValue: string) => {
    const parsed = Number(rawValue);
    setSelectedMap((prev) => {
      if (!prev[packId]) {
        return prev;
      }

      return {
        ...prev,
        [packId]: Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1,
      };
    });
  };

  const handleSubmit = async () => {
    if (!gameId) {
      toast.error("กรุณาเลือกเกมก่อน");
      return;
    }

    if (!name.trim()) {
      toast.error("กรุณากรอกชื่อ bundle");
      return;
    }

    const parsedSellingPrice = Number(sellingPrice);
    if (!Number.isFinite(parsedSellingPrice) || parsedSellingPrice < 0) {
      toast.error("sellingPrice ไม่ถูกต้อง");
      return;
    }

    const parsedSortOrder = Number(sortOrder);
    if (!Number.isFinite(parsedSortOrder)) {
      toast.error("sortOrder ไม่ถูกต้อง");
      return;
    }

    const items = Object.entries(selectedMap).map(([childPackId, quantity]) => ({
      childPackId,
      quantity,
    }));

    if (items.length === 0) {
      toast.error("กรุณาเลือก pack ที่จะรวมอย่างน้อย 1 รายการ");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(toApiUrl("/api/admin/packs/bundle"), {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          gameId,
          name: name.trim(),
          description: description.trim() || null,
          items,
          sellingPrice: parsedSellingPrice,
          sortOrder: parsedSortOrder,
        }),
      });

      if (response.status === 401 || response.status === 403) {
        throw new Error("ไม่มีสิทธิ์สร้าง bundle pack");
      }

      if (!response.ok) {
        let message = "สร้าง bundle pack ไม่สำเร็จ";
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

      toast.success("สร้าง bundle pack สำเร็จ");
      await onSaved();
      onClose();
    } catch (createError) {
      toast.error(createError instanceof Error ? createError.message : "สร้าง bundle pack ไม่สำเร็จ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-80 flex items-center justify-center bg-black/60 p-4">
      <div className="max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl border border-white/15 bg-[#0b0b0b] p-5 shadow-2xl">
        <h2 className="text-lg font-semibold text-white">สร้าง Bundle Pack</h2>
        <p className="mt-1 text-sm text-white/70">
          {gameName ? `เกม: ${gameName}` : "เลือก pack เดิมเพื่อรวมเป็น pack ใหม่"}
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">name</span>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              disabled={isSubmitting}
              placeholder="Heartopia 20 heart + 60 heart (Bundle)"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>

          <label className="flex flex-col gap-1 md:col-span-2">
            <span className="text-xs font-semibold text-white/60">description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              disabled={isSubmitting}
              rows={2}
              placeholder="รวม 20 + 60 heart ราคาพิเศษ"
              className="rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
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
              placeholder="50"
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
              placeholder="99"
              className="h-10 rounded-lg border border-white/15 bg-black/40 px-3 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
            />
          </label>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs font-semibold text-white/60">เลือก Pack ที่ต้องการรวม</p>
            <p className="text-xs text-white/55">เลือกแล้ว {selectedCount} รายการ</p>
          </div>

          <div className="max-h-80 space-y-2 overflow-auto pr-1">
            {availablePacks.length === 0 ? (
              <p className="text-sm text-white/55">ไม่พบ pack สำหรับเกมนี้</p>
            ) : (
              availablePacks.map((pack) => {
                const checked = Boolean(selectedMap[pack.id]);
                const quantity = selectedMap[pack.id] ?? 1;

                return (
                  <div
                    key={pack.id}
                    className={`rounded-lg border px-3 py-2 ${checked ? "border-[#2f4c77] bg-[#1a1f2b]" : "border-white/10 bg-white/5"}`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <label className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePack(pack.id)}
                          disabled={isSubmitting}
                          className="h-4 w-4"
                        />
                        <span className="text-sm text-white">{pack.name}</span>
                        <span className="text-xs text-white/55">{pack.providerPackCode ?? "-"}</span>
                      </label>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-white/60">qty</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={quantity}
                          onChange={(event) => updateQuantity(pack.id, event.target.value)}
                          disabled={!checked || isSubmitting}
                          className="h-8 w-20 rounded-md border border-white/15 bg-black/40 px-2 text-sm text-white outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <p className="mt-1 text-xs text-white/55">ราคาขายปัจจุบัน: {pack.sellingPrice.formatted}</p>
                  </div>
                );
              })
            )}
          </div>
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
            disabled={isSubmitting || availablePacks.length === 0}
            className="rounded-lg border border-[#35552a] bg-[#1f2b18] px-4 py-2 text-sm font-semibold text-[#9ee37d] hover:bg-[#2a3a23] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? "กำลังสร้าง..." : "สร้าง Bundle Pack"}
          </button>
        </div>
      </div>
    </div>
  );
}
