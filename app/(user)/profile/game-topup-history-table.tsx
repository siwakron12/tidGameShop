type GameTopupHistoryTableProps = {
  title?: string;
  subtitle?: string;
};

export default function GameTopupHistoryTable({
  title = "ประวัติเติมเกม",
  subtitle = "mock data",
}: GameTopupHistoryTableProps) {
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

      <div className="overflow-x-auto rounded-2xl border border-white/10">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-white/3 text-white/60">
            <tr>
              <th className="px-4 py-3 font-semibold">วันที่</th>
              <th className="px-4 py-3 font-semibold">UID</th>
              <th className="px-4 py-3 font-semibold">จำนวน</th>
              <th className="px-4 py-3 font-semibold">เกม</th>
              <th className="px-4 py-3 font-semibold">สถานะ</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-white/10 text-white/45">
              <td className="px-4 py-8 text-center" colSpan={5}>
                ไม่มีข้อมูล (กำลังรอเชื่อม API)
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
