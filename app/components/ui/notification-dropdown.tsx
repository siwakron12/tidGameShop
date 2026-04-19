"use client";

import type { Notification } from "./notification-bell";

const TYPE_ICON: Record<string, string> = {
  TOPUP: "💰",
  GACHA_WIN: "🎲",
  SYSTEM: "🔔",
};

const TYPE_BG: Record<string, string> = {
  TOPUP: "bg-green-500/10",
  GACHA_WIN: "bg-purple-500/10",
  SYSTEM: "bg-blue-500/10",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "เมื่อกี้";
  if (m < 60) return `${m} นาทีที่แล้ว`;
  if (h < 24) return `${h} ชั่วโมงที่แล้ว`;
  return `${d} วันที่แล้ว`;
}

type Props = {
  notifications: Notification[];
  isLoading: boolean;
  onMarkAllRead: () => void;
  onClose: () => void;
};

export default function NotificationDropdown({
  notifications,
  isLoading,
  onMarkAllRead,
}: Props) {
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div
      style={{
        width: "min(320px, calc(100vw - 24px))",
        right: -56,
      }}
      className="absolute top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-white/10 bg-black/80 shadow-xl backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white">การแจ้งเตือน</span>
          {unreadCount > 0 && (
            <span className="rounded-full bg-[#ff1436] px-1.5 py-0.5 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-xs text-[#ff1436] transition hover:opacity-70"
          >
            อ่านทั้งหมด
          </button>
        )}
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <span className="text-sm text-white/40">กำลังโหลด...</span>
          </div>
        ) : notifications.length === 0 ? (
          <p className="py-8 text-center text-sm text-white/50">
            ไม่มีการแจ้งเตือน
          </p>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-3 border-b border-white/5 px-4 py-3 transition last:border-none hover:bg-white/5 ${
                !n.isRead ? "bg-[#ff1436]/5" : ""
              }`}
            >
              {/* Unread dot */}
              <span
                className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                  !n.isRead ? "bg-[#ff1436]" : "bg-transparent"
                }`}
              />

              {/* Icon */}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm ${TYPE_BG[n.type] ?? "bg-white/10"}`}
              >
                {TYPE_ICON[n.type] ?? "📣"}
              </div>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-medium leading-snug text-white">
                  {n.title}
                </p>
                <p className="mt-0.5 text-xs leading-snug text-white/60">
                  {n.body}
                </p>
                <p className="mt-1 text-[11px] text-white/35">
                  {timeAgo(n.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}