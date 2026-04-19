"use client";
import { useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

export default function AddNoti({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, title, body }),
      });
      if (!res.ok) throw new Error("ส่งแจ้งเตือนไม่สำเร็จ");
      toast.success("ส่งแจ้งเตือนสำเร็จ");
      setOpen(false);
      setTitle("");
      setBody("");
    } catch (e: any) {
      toast.error(e.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const modal = open ? (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-[#181818] border border-white/10 p-6 rounded-xl w-full max-w-sm shadow-xl">
        <div className="mb-4 text-lg font-bold text-white">ส่งแจ้งเตือนถึงผู้ใช้</div>
        <input
          className="w-full mb-3 px-3 py-2 rounded-lg bg-[#222] text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="หัวข้อ"
          value={title}
          onChange={e => setTitle(e.target.value)}
          disabled={loading}
        />
        <textarea
          className="w-full mb-4 px-3 py-2 rounded-lg bg-[#222] text-white border border-white/15 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
          placeholder="ข้อความ"
          value={body}
          onChange={e => setBody(e.target.value)}
          disabled={loading}
          rows={3}
        />
        <div className="flex gap-2 justify-end">
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            ยกเลิก
          </button>
          <button
            className="px-4 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-50 transition"
            style={{ background: loading || !title || !body ? "#1e3a5f" : "#2563eb" }}
            onClick={handleSend}
            disabled={loading || !title || !body}
          >
            {loading ? "กำลังส่ง..." : "ส่ง"}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        className="px-2 py-1 rounded-lg text-white text-xs font-medium transition"
        style={{ background: "#2563eb" }}
        onMouseOver={e => (e.currentTarget.style.background = "#1d4ed8")}
        onMouseOut={e => (e.currentTarget.style.background = "#2563eb")}
        onClick={() => setOpen(true)}
      >
        ส่งแจ้งเตือน
      </button>
      {typeof window !== "undefined" && createPortal(modal, document.body)}
    </>
  );
}