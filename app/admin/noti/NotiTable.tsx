"use client";
import TableAdmin from "../(uiAdmin)/TableAdmin";
import type { ColumnDef } from "@tanstack/react-table";

export type Activity = {
  id: string;
  type: string;
  title: string;
  detail: string | null;
  creditChange: { formatted: string } | null;
  pointChange: number | null;
  refType: string;
  refId: string;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
};

const columns: ColumnDef<Activity>[] = [
  {
    header: "เวลา",
    accessorKey: "createdAt",
    cell: ({ getValue }) => (
      <span suppressHydrationWarning>{new Date(getValue() as string).toLocaleString("th-TH")}</span>
    ),
  },
  {
    header: "User",
    accessorKey: "user.name",
    cell: ({ row }) => (
      <div>
        <div className="font-semibold">{row.original.user.name}</div>
        <div className="text-xs text-white/60">{row.original.user.email}</div>
      </div>
    ),
  },
  {
    header: "กิจกรรม",
    accessorKey: "title",
  },
  {
    header: "ประเภท",
    accessorKey: "type",
  },
  {
    header: "เครดิต",
    accessorKey: "creditChange.formatted",
    cell: ({ row }) => row.original.creditChange?.formatted ?? "-",
  },
  {
    header: "พอยต์",
    accessorKey: "pointChange",
    cell: ({ row }) => row.original.pointChange ?? "-",
  },
];

export default function NotiTable(props: {
  data: Activity[];
  isLoading: boolean;
  error?: string | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}) {
  return (
    <TableAdmin<Activity>
      columns={columns}
      data={props.data}
      isLoading={props.isLoading}
      error={props.error}
      hasMore={props.hasMore}
      isLoadingMore={props.isLoadingMore}
      onLoadMore={props.onLoadMore}
    />
  );
}
