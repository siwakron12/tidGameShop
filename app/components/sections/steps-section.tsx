"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

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
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="border-b border-white/10 bg-[#070707]">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <h2 className="text-2xl font-bold text-white sm:text-3xl">เริ่มเติมเกมใน 4 ขั้นตอน</h2>
        <div className="mt-8 flex flex-col gap-4">
          {steps.map((step, index) => (
            <motion.article
              key={step.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.28, delay: index * 0.06 }}
              className="rounded-2xl border border-white/10 bg-[#111111] p-5"
            >
              <button
                type="button"
                onClick={() => setOpenIndex((current) => (current === index ? null : index))}
                className="flex w-full items-center justify-between gap-3 text-left"
                aria-expanded={openIndex === index}
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#B9EF31]/80 text-sm font-extrabold text-white">
                    {index + 1}
                  </span>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                </div>
                <motion.span
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm font-bold text-[#B9EF31]/90"
                >
                  {openIndex === index ? "−" : "+"}
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {openIndex === index ? (
                  <motion.p
                    key="content"
                    initial={{ opacity: 0, height: 0, marginTop: 0 }}
                    animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                    exit={{ opacity: 0, height: 0, marginTop: 0 }}
                    transition={{ duration: 0.22 }}
                    className="overflow-hidden text-sm leading-6 text-white/70"
                  >
                    {step.detail}
                  </motion.p>
                ) : null}
              </AnimatePresence>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
