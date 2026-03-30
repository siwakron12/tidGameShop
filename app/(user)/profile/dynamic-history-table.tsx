"use client";

import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";

type DynamicHistoryTableProps<TData extends object> = {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  isLoading?: boolean;
  error?: string | null;
  emptyText?: string;
  loadingText?: string;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  onLoadMore?: () => void;
};

export default function DynamicHistoryTable<TData extends object>({
  columns,
  data,
  isLoading = false,
  error = null,
  emptyText = "ไม่มีข้อมูล",
  loadingText = "กำลังโหลดข้อมูล...",
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
}: DynamicHistoryTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const columnCount = Math.max(table.getAllLeafColumns().length, 1);

  return (
    <>
      <div className="relative">
        <div className="overflow-x-auto rounded-2xl border border-white/10 [scrollbar-color:rgba(255,255,255,0.22)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-white/20 hover:[&::-webkit-scrollbar-thumb]:bg-white/30">
          <table className="min-w-full w-max text-left text-sm">
            <thead className="bg-white/3 text-white/60">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-8 text-center text-white/55">
                    {loadingText}
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-8 text-center text-[#ff8f9f]">
                    {error}
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columnCount} className="px-4 py-8 text-center text-white/45">
                    {emptyText}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-t border-white/10 text-white/85">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-5 rounded-l-2xl bg-linear-to-r from-[#050505] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-5 rounded-r-2xl bg-linear-to-l from-[#050505] to-transparent" />
      </div>

      {hasMore && onLoadMore ? (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={onLoadMore}
            disabled={isLoadingMore}
            className="inline-flex items-center rounded-xl border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoadingMore ? "กำลังโหลด..." : "โหลดเพิ่ม"}
          </button>
        </div>
      ) : null}
    </>
  );
}
