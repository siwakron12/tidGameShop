"use client";
import { useState } from "react";
import { toast } from "sonner";

export default function ManangeNoti() {
    // Broadcast state
    const [broadcastTitle, setBroadcastTitle] = useState("");
    const [broadcastBody, setBroadcastBody] = useState("");
    const [broadcastLoading, setBroadcastLoading] = useState(false);

    // Cleanup state
    const [notificationDays, setNotificationDays] = useState(90);
    const [activityLogDays, setActivityLogDays] = useState(180);
    const [cleanupLoading, setCleanupLoading] = useState(false);

    // Broadcast handler
    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault();
        setBroadcastLoading(true);
        try {
            const res = await fetch("/api/admin/notifications/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title: broadcastTitle, body: broadcastBody }),
            });
            const json = await res.json();
            if (json.ok) {
                toast.success("ส่งประกาศสำเร็จ");
                setBroadcastTitle("");
                setBroadcastBody("");
            } else {
                toast.error(json.message || "ส่งประกาศไม่สำเร็จ");
            }
        } catch (e: any) {
            toast.error(e.message || "เกิดข้อผิดพลาด");
        } finally {
            setBroadcastLoading(false);
        }
    };

    // Cleanup handler
    const handleCleanup = async (e: React.FormEvent) => {
        e.preventDefault();
        setCleanupLoading(true);
        try {
            const res = await fetch("/api/admin/notifications/cleanup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notificationDays, activityLogDays }),
            });
            const json = await res.json();
            if (json.ok) {
                toast.success(`ลบข้อมูลแล้ว\nNotifications: ${json.deleted.notifications}\nActivityLogs: ${json.deleted.activityLogs}`);
            } else {
                toast.error(json.message || "ลบข้อมูลไม่สำเร็จ");
            }
        } catch (e: any) {
            toast.error(e.message || "เกิดข้อผิดพลาด");
        } finally {
            setCleanupLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-8 md:flex-row md:gap-12">
            {/* Broadcast Card */}
            <form
                onSubmit={handleBroadcast}
                className="flex-1 bg-[#181818] border border-white/15 rounded-xl p-6 flex flex-col gap-4 shadow"
            >
                <h2 className="text-lg font-bold mb-2">ประกาศถึงทุกคน</h2>
                <div>
                    <label className="block text-xs mb-1">หัวข้อ (Title)</label>
                    <input
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={broadcastTitle}
                        onChange={e => setBroadcastTitle(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">ข้อความ (Body)</label>
                    <textarea
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[80px]"
                        value={broadcastBody}
                        onChange={e => setBroadcastBody(e.target.value)}
                        required
                    />
                </div>
                <button
                    type="submit"
                    disabled={broadcastLoading}
                    className="mt-2 rounded-lg px-4 py-2 text-white font-semibold disabled:opacity-60"
                    style={{ background: "#2563eb" }}
                    onMouseOver={e => (e.currentTarget.style.background = "#1d4ed8")}
                    onMouseOut={e => (e.currentTarget.style.background = "#2563eb")}
                >
                    {broadcastLoading ? "กำลังส่ง..." : "ประกาศ"}
                </button>
            </form>

            {/* Cleanup Card */}
            <form
                onSubmit={handleCleanup}
                className="flex-1 bg-[#181818] border border-white/15 rounded-xl p-6 flex flex-col gap-4 shadow"
            >
                <h2 className="text-lg font-bold mb-2">ลบ Notification/Activity Log เก่า</h2>
                <div>
                    <label className="block text-xs mb-1">ลบ Notification ที่อ่านแล้วเกิน (วัน)</label>
                    <input
                        type="number"
                        min={1}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={notificationDays}
                        onChange={e => setNotificationDays(Number(e.target.value))}
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">ลบ Activity Log ที่อ่านแล้วเกิน (วัน)</label>
                    <input
                        type="number"
                        min={1}
                        className="w-full rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={activityLogDays}
                        onChange={e => setActivityLogDays(Number(e.target.value))}
                    />
                </div>
                <button
                    type="submit"
                    disabled={cleanupLoading}
                    className="mt-2 rounded-lg px-4 py-2 text-white font-semibold disabled:opacity-60"
                    style={{ background: "#dc2626" }}
                    onMouseOver={e => (e.currentTarget.style.background = "#b91c1c")}
                    onMouseOut={e => (e.currentTarget.style.background = "#dc2626")}
                >
                    {cleanupLoading ? "กำลังลบ..." : "ลบข้อมูลเก่า"}
                </button>
            </form>
        </div>
    );
}
