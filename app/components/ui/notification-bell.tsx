"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Bell } from "lucide-react";
import NotificationDropdown from "./notification-dropdown";

export type Notification = {
  id: string;
  type: "SYSTEM" | "GACHA_WIN" | "TOPUP";
  title: string;
  body: string;
  isRead: boolean;
  readAt: string | null;
  refType: string | null;
  refId: string | null;
  createdAt: string;
};

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // ดึง unread count ตอน mount
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications/unread-count");
      const data = await res.json();
      if (data.ok) setUnreadCount(data.unreadCount);
    } catch {
      // silent
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      if (data.ok) setNotifications(data.items);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/read-all", { method: "PATCH" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // silent
    }
  }, []);

  // โหลด unread count ตอนแรก
  useEffect(() => {
    void fetchUnreadCount();
  }, [fetchUnreadCount]);

  // ตอนเปิด dropdown — ดึงรายการ + ยิง read-all ทันที
  useEffect(() => {
    if (isOpen) {
      void fetchNotifications();
      void markAllRead();
    }
  }, [isOpen, fetchNotifications, markAllRead]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative inline-flex size-10 items-center justify-center rounded-xl border border-white/20 text-white transition hover:bg-white/10"
        aria-label="การแจ้งเตือน"
      >
        <Bell size={18} />

          {unreadCount > 0 && (
            <span
              style={{
                position: "absolute",
                top: "6px",
                right: "6px",
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#ff1436",
                boxShadow: "0 0 0 2px #000",
                display: "block",
              }}
            />
          )}

      </button>

      {isOpen && (
        <NotificationDropdown
          notifications={notifications}
          isLoading={isLoading}
          onMarkAllRead={markAllRead}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}