"use client";

import { useMemo } from "react";
import { type ColumnDef } from "@tanstack/react-table";
import DynamicHistoryTable from "./dynamic-history-table";

type GameTopupHistoryItem = {
  createdAt: string;
  uid: string;
  amount: string;
  game: string;
  status: string;
};

type GameTopupHistoryTableProps = {
  title?: string;
  subtitle?: string;
};

export default function GameTopupHistoryTable({
  title = "ประวัติเติมเกม",
  subtitle = "mock data",
}: GameTopupHistoryTableProps) {
  const columns = useMemo<ColumnDef<GameTopupHistoryItem, unknown>[]>(
    () => [
      {
        header: "วันที่",
        accessorKey: "createdAt",
      },
      {
        header: "UID",
        accessorKey: "uid",
      },
      {
        header: "จำนวน",
        accessorKey: "amount",
      },
      {
        header: "เกม",
        accessorKey: "game",
      },
      {
        header: "สถานะ",
        accessorKey: "status",
      },
    ],
    [],
  );

  return (
    <div className="rounded-3xl border border-white/10 bg-[#050505] p-5 sm:p-6">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-4xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-white/55">{subtitle}</p>
        </div>
        <button
          type="button"
          className="text-sm font-semibold text-white/60 transition hover:text-white"
        >
          ดูทั้งหมด
        </button>
      </div>

      <DynamicHistoryTable
        columns={columns}
        data={[]}
        emptyText="ไม่มีข้อมูล (กำลังรอเชื่อม API)"
      />
    </div>
  );
}
