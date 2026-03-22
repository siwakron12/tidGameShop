"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "./auth-modal";

const navItems = [
  { label: "หน้าแรก", href: "/", match: ["/"] },
  { label: "เติมเงิน", href: "/topup", match: ["/topup"] },
  { label: "โปรโมชั่น", href: "/products", match: ["/products"] },
  { label: "ช่วยเหลือ", href: "/profile", match: ["/profile"] },
];

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#131313]/95 backdrop-blur">
      <div className="mx-auto flex h-20 w-full max-w-400 items-center gap-3 px-4 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 text-xl font-extrabold tracking-tight text-[#ff1436] sm:text-2xl"
        >
           TitgameShop
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`border-b-2 pb-1 text-base font-bold tracking-wide transition ${
                item.match.some((path) => pathname === path || pathname.startsWith(`${path}/`))
                  ? "border-[#ff1436] text-[#ff1436]"
                  : "border-transparent text-white/75 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <label className="flex h-10 w-44 items-center gap-2 rounded-xl bg-[#353535] px-3 text-white/60 sm:w-56 lg:h-12 lg:w-80 lg:gap-3 lg:px-4">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4 lg:h-5 lg:w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
            </svg>
            <input
              type="search"
              placeholder="ค้นหาเกม..."
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 lg:text-base"
            />
          </label>

          <button
            type="button"
            className="hidden text-base font-bold text-white/85 transition hover:text-white md:inline-flex"
          >
            TH
          </button>

          <button
            type="button"
            onClick={() => setIsAuthModalOpen(true)}
            className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-xl bg-[#ff001f] px-4 text-xs font-black tracking-wide whitespace-nowrap text-white transition hover:bg-[#ff2742] sm:h-11 sm:px-5 sm:text-sm"
          >
            เข้าสู่ระบบ
          </button>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-expanded={isMobileMenuOpen}
            aria-label="เปิดเมนู"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-white transition hover:bg-white/10 lg:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              {isMobileMenuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </>
              ) : (
                <>
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 bg-[#121212] px-4 transition-all duration-300 lg:hidden ${
          isMobileMenuOpen ? "max-h-72 py-3 opacity-100" : "max-h-0 py-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex w-full max-w-400 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.label}`}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                item.match.some((path) => pathname === path || pathname.startsWith(`${path}/`))
                  ? "bg-[#ff001f]/20 text-[#ff2742]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </header>
  );
}
