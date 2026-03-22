import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_top,#2a0a0a_0%,#120607_42%,#090909_70%)]">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-[#ff2140]/20 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-[#ff7a001f] blur-3xl" />

      <div className="relative z-20 mx-auto flex min-h-[80vh] w-full max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="max-w-xl">
          <p className="mb-4 inline-flex rounded-full border border-[#ff3350]/40 bg-[#ff112a]/15 px-4 py-1 text-xs font-semibold tracking-[0.18em] text-[#ff5a70]">
            AUTO TOP-UP PLATFORM
          </p>
          <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            เว็บเติมเกมอัตโนมัติ
            <br />
            ใช้ง่าย เติมไว ได้จริง
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75 sm:text-lg">
            เติมเกมได้ 24 ชั่วโมงแบบเรียลไทม์ รองรับหลายค่ายยอดนิยม จ่ายเสร็จระบบทำงานทันที
            ไม่ต้องรอแอดมิน พร้อมบริการช่วยเหลือเมื่อคุณต้องการ
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/products"
              className="inline-flex h-11 items-center rounded-xl bg-[#ff1536] px-5 text-sm font-bold tracking-wide text-white transition hover:bg-[#ff2a48]"
            >
              เลือกเกมที่ต้องการเติม
            </Link>
            <Link
              href="/checkout"
              className="inline-flex h-11 items-center rounded-xl border border-white/20 px-5 text-sm font-semibold text-white/90 transition hover:border-white/40 hover:text-white"
            >
              วิธีเติมเงิน
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-3 gap-3 sm:max-w-lg sm:gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xl font-bold text-white">30 วิ</p>
              <p className="mt-1 text-xs text-white/65">เวลาเฉลี่ยต่อรายการ</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xl font-bold text-white">24/7</p>
              <p className="mt-1 text-xs text-white/65">ระบบอัตโนมัติเต็มรูปแบบ</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-xl font-bold text-white">99.9%</p>
              <p className="mt-1 text-xs text-white/65">สำเร็จในการทำรายการ</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
