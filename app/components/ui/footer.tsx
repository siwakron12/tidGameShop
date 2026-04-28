import Link from "next/link";

const serviceLinks = [
  { label: "เติมเกม", href: "/products" },
  { label: "เติมเงิน", href: "/topup" },
  { label: "สุ่มรางวัล", href: "/gacha" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[linear-gradient(180deg,#12070a_0%,#0a0a0a_100%)]">
      <div className="mx-auto  w-full lg:w-3/4 px-4 py-10 sm:px-6 lg:px-8 lg:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <h3 className="text-xl font-bold text-white">เกี่ยวกับเรา</h3>
            <p className="mt-3 text-sm leading-7 text-white/70">
              TitgameShop เป็นแพลตฟอร์มเติมเกมอัตโนมัติที่เน้นความไวและความปลอดภัย
              ให้บริการทุกวัน พร้อมทีมงานดูแลเมื่อคุณต้องการความช่วยเหลือ
            </p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">ฝ่ายบริการลูกค้า</h3>
            <p className="mt-3 text-sm text-white/75">เปิดให้บริการ 08:00 - 00:00 น. ทุกวันไม่มีวันหยุด</p>
            <p className="mt-2 text-sm text-white/60">ติดต่อผ่านแชทเพจ Facebook ได้ตลอดเวลา</p>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">บริการของเรา</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/80">
              {serviceLinks.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="transition hover:text-[#ff6f84]">
                    &gt; {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white">ติดต่อเรา</h3>
            <p className="mt-3 text-sm text-white/75">Contact US</p>
            <div className="mt-3 flex items-center gap-3">
              <a
                target="_blank"
                href="https://web.facebook.com/titgameshop/?locale=th_TH"
                aria-label="Facebook"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-lg text-white/90 transition hover:border-[#ff6f84] hover:text-white"
              >
                f
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-dashed border-white/15 pt-6 text-center text-sm text-white/70">
          ©2026 สงวนลิขสิทธิ์ | <span className="font-semibold text-[#ff4b66]">TitgameShop</span>
        </div>
      </div>
    </footer>
  );
}