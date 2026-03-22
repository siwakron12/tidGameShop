const benefits = [
  {
    title: "ปลอดภัยและเชื่อถือได้",
    detail: "ระบบตรวจสอบรายการอัตโนมัติ พร้อมบันทึกสถานะทุกขั้นตอน",
  },
  {
    title: "รองรับเกมยอดนิยม",
    detail: "มีแพ็กเติมสำหรับเกมหลักทั้งมือถือและ PC อัปเดตโปรทุกสัปดาห์",
  },
  {
    title: "ช่วยเหลือไว",
    detail: "มีทีมซัพพอร์ตดูแลทุกวัน ตอบไวและแก้ปัญหาตรงจุด",
  },
];

export default function BenefitsSection() {
  return (
    <section className="border-b border-white/10 bg-[#0b0b0b]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-[#ff5f74]">WHY GAME ON</p>
            <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">ทำไมผู้เล่นถึงเลือกใช้เรา</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {benefits.map((item) => (
            <article
              key={item.title}
              className="rounded-2xl border border-white/10 bg-gradient-to-b from-[#181818] to-[#101010] p-5"
            >
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{item.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
