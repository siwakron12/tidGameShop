const steps = [
  {
    title: "เติมเงินเข้าระบบ",
    detail: "เติมเงินเข้าบัญชีของคุณผ่านช่องทางที่สะดวก รวดเร็ว และปลอดภัย",
  },
  {
    title: "เลือกเกมและแพ็ก",
    detail: "เลือกเกมที่ต้องการ พร้อมจำนวนที่อยากเติมให้ตรงบัญชีของคุณ",
  },
  {
    title: "กรอกข้อมูลบัญชี",
    detail: "ใส่ UID หรือข้อมูลที่จำเป็น ระบบจะตรวจสอบความถูกต้องให้อัตโนมัติ",
  },
  {
    title: "ชำระเงินและรับของ",
    detail: "ชำระเงินเสร็จ ระบบเริ่มเติมทันที พร้อมแจ้งสถานะเรียลไทม์",
  },
];

export default function StepsSection() {
  return (
    <section className="border-b border-white/10 bg-[#070707]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">เริ่มเติมเกมใน 4 ขั้นตอน</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <article key={step.title} className="rounded-2xl border border-white/10 bg-[#111111] p-5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#B9EF31]/80 text-sm  font-extrabold text-white">
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{step.detail}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
