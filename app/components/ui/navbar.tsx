"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import AuthModal from "./auth-modal";

const navItems = [
  { label: "หน้าแรก", href: "/", match: ["/"] },
  { label: "เติมเงิน", href: "/topup", match: ["/topup"] },
  { label: "เกมทั้งหมด", href: "/products", match: ["/products"] },
];

const gameList = [
  "ROV",
  "Free Fire",
  "PUBG Mobile",
  "Valorant",
  "Roblox",
  "Genshin Impact",
  "Honkai: Star Rail",
  "League of Legends",
  "FIFA Online 4",
  "Point Blank",
  "Minecraft",
  "Identity V",
];

export default function Navbar() {
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
    "login",
  );
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDesktopSearchFocused, setIsDesktopSearchFocused] = useState(false);
  const [isMobileSearchFocused, setIsMobileSearchFocused] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const searchSuggestions = gameList
    .filter((game) =>
      game.toLowerCase().includes(searchQuery.trim().toLowerCase()),
    )
    .slice(0, 6);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsMobileSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 backdrop-blur transition-colors ${
        isScrolled
          ? "bg-black/55 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
          : "bg-red-400/10"
      }`}
    >
      <div className="mx-auto flex h-16 lg:w-3/4 w-full items-center gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6 lg:gap-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0 whitespace-nowrap text-lg font-extrabold tracking-tight text-[#ff1436] sm:text-2xl"
        >
          TitgameShop
        </Link>

        <nav className="hidden items-center gap-5 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={`relative pb-1 text-base font-bold tracking-wide transition ${
                item.match.some(
                  (path) =>
                    pathname === path || pathname.startsWith(`${path}/`),
                )
                  ? "text-[#ff1436]"
                  : "text-white/75 hover:text-white"
              }`}
            >
              {item.match.some(
                (path) => pathname === path || pathname.startsWith(`${path}/`),
              ) && (
                <motion.span
                  layoutId="desktop-nav-active"
                  transition={{ type: "spring", stiffness: 520, damping: 38 }}
                  className="absolute bottom-0 left-0 h-0.5 w-full rounded-full bg-[#ff1436]"
                />
              )}
              <span className="relative z-10">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex min-w-0 flex-1 items-center justify-end gap-2 sm:flex-none sm:gap-3">
          <div className="relative hidden sm:block">
            {/* <label className="flex h-10 w-44 items-center gap-2 rounded-xl bg-[#353535] px-3 text-white/60 sm:w-56 lg:h-12 lg:w-80 lg:gap-3 lg:px-4">
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
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsDesktopSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsDesktopSearchFocused(false), 120)}
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45 lg:text-base"
              />
            </label> */}

            {isDesktopSearchFocused && searchSuggestions.length > 0 && (
              <div className="absolute left-0 right-0 z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/45 shadow-lg backdrop-blur-xl">
                {searchSuggestions.map((game) => (
                  <button
                    key={`desktop-${game}`}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(game);
                      setIsDesktopSearchFocused(false);
                    }}
                    className="block w-full px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
                  >
                    {game}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* <button
            type="button"
            aria-label="ค้นหา"
            aria-expanded={isMobileSearchOpen}
            onClick={() => {
              setIsMobileSearchOpen((prev) => !prev);
              setIsMobileMenuOpen(false);
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[#353535] text-white/70 sm:hidden"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="16.65" y1="16.65" x2="21" y2="21" />
            </svg>
          </button> */}

          <div className="space-x-3">
            <button
              type="button"
              onClick={() => {
                setAuthModalTab("login");
                setIsAuthModalOpen(true);
              }}
              className="cursor-pointer text-white/90 transition hover:text-white "
            >
              เข้าสู่ระบบ
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthModalTab("register");
                setIsAuthModalOpen(true);
              }}
              className="inline-flex h-10 shrink-0 cursor-pointer items-center rounded-xl bg-[#ff001f] px-3 text-[11px] font-black tracking-wide whitespace-nowrap text-white transition hover:bg-[#ff2742] sm:h-11 sm:px-5 sm:text-sm"
            >
              สมัครสมาชิก
            </button>
          </div>

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
        className={`overflow-hidden border-t border-white/10 bg-black/35 px-3 transition-all duration-300 backdrop-blur-xl sm:hidden ${
          isMobileSearchOpen
            ? "max-h-80 py-2 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <label className="flex h-10 w-full items-center gap-2 rounded-xl bg-[#353535] px-3 text-white/60">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4"
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsMobileSearchFocused(true)}
            onBlur={() =>
              setTimeout(() => setIsMobileSearchFocused(false), 120)
            }
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-white/45"
            autoFocus={isMobileSearchOpen}
          />
        </label>

        {isMobileSearchFocused && searchSuggestions.length > 0 && (
          <div className="mt-2 overflow-hidden rounded-xl border border-white/10 bg-black/45 backdrop-blur-xl">
            {searchSuggestions.map((game) => (
              <button
                key={`mobile-${game}`}
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  setSearchQuery(game);
                  setIsMobileSearchFocused(false);
                }}
                className="block w-full px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/10"
              >
                {game}
              </button>
            ))}
          </div>
        )}
      </div>

      <div
        className={`overflow-hidden border-t border-white/10 bg-black/35 px-4 transition-all duration-300 backdrop-blur-xl lg:hidden ${
          isMobileMenuOpen
            ? "max-h-72 py-3 opacity-100"
            : "max-h-0 py-0 opacity-0"
        }`}
      >
        <nav className="mx-auto flex w-full max-w-400 flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={`mobile-${item.label}`}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                item.match.some(
                  (path) =>
                    pathname === path || pathname.startsWith(`${path}/`),
                )
                  ? "bg-[#ff001f]/20 text-[#ff2742]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
