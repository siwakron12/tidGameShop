
"use client";
import { useEffect, useState, useCallback } from "react";
import NotiActivityLog from "./NotiActivityLog";
import NotiForUser from "./NotiForUser";
import ManangeNoti from "./ManangeNoti";
import LogAdmin from "./logAdmin";

export default function NotiPage() {
    const [tab, setTab] = useState<"activity" | "other" | "manage" | "auditlog">("activity");
    return (
        <div className="p-6">
            <div className="flex gap-2 mb-2">
                <button
                    className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === "activity" ? "border-blue-500 text-blue-300 bg-[#181818]" : "border-transparent text-white/60 bg-transparent hover:text-white"}`}
                    onClick={() => setTab("activity")}
                >
                    กิจกรรม (Activity Log)
                </button>
                <button
                    className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === "other" ? "border-blue-500 text-blue-300 bg-[#181818]" : "border-transparent text-white/60 bg-transparent hover:text-white"}`}
                    onClick={() => setTab("other")}
                >
                    Notification (ทุกคน)
                </button>
                <button
                    className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === "manage" ? "border-blue-500 text-blue-300 bg-[#181818]" : "border-transparent text-white/60 bg-transparent hover:text-white"}`}
                    onClick={() => setTab("manage")}
                >
                    จัดการประกาศ/ลบข้อมูล
                </button>
                <button
                    className={`px-4 py-2 rounded-t-lg font-semibold border-b-2 transition-colors ${tab === "auditlog" ? "border-blue-500 text-blue-300 bg-[#181818]" : "border-transparent text-white/60 bg-transparent hover:text-white"}`}
                    onClick={() => setTab("auditlog")}
                >
                    ประวัติการกระทำแอดมิน
                </button>
            </div>
            {tab === "activity" && <NotiActivityLog />}
            {tab === "other" && <NotiForUser />}
            {tab === "manage" && <ManangeNoti />}
            {tab === "auditlog" && <LogAdmin />}
        </div>
    );
}