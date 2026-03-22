import Link from "next/link";

export default function CtaSection() {
  return (
    <section className="bg-[#080808]">
      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-[linear-gradient(135deg,#ff1735_0%,#8c1122_45%,#1a0a0d_100%)] p-8 sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/80">พร้อมเริ่มหรือยัง</p>
          <h2 className="mt-3 text-3xl font-bold text-white sm:text-4xl">เติมเกมแบบมืออาชีพในไม่กี่คลิก</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-white/85 sm:text-base">
            ไม่ว่าคุณจะเติมประจำหรือเติมครั้งแรก ระบบของเราช่วยให้ทุกขั้นตอนง่ายขึ้น ปลอดภัยขึ้น และไวขึ้น
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center rounded-xl bg-white px-5 text-sm font-bold text-[#b01125] transition hover:bg-[#ffe4e8]"
            >
              เริ่มเติมเกมตอนนี้
            </Link>
            <Link
              href="/profile"
              className="inline-flex h-11 items-center rounded-xl border border-white/35 px-5 text-sm font-semibold text-white transition hover:border-white/60"
            >
              ดูวิธีใช้งาน
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
