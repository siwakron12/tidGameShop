"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Coins, LogOut, Wallet, Gift, House, CreditCard, Gamepad2, Dices } from "lucide-react";
import { toast } from "sonner";
import AuthModal from "./auth-modal";
import { authClient } from "@/lib/auth-client";
import { useWalletContext } from "../providers/wallet-context";
const navItems = [
  { label: "หน้าแรก", href: "/", match: ["/"], icon: <House size={18} className="inline-block mr-1 mb-0.5" /> },
  { label: "เติมเงิน", href: "/topup", match: ["/topup"], icon: <CreditCard size={18} className="inline-block mr-1 mb-0.5" /> },
  { label: "เกมทั้งหมด", href: "/products", match: ["/products"], icon: <Gamepad2 size={18} /> },
  { label: "สุ่มรางวัล", href: "/gacha", match: ["/gacha"], icon: <Dices size={18}  /> },
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

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default function Navbar() {
  const { walletBaht, points, isLoading, refreshBalances, clearBalances } =
    useWalletContext();
  const pathname = usePathname();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<"login" | "register">(
    "login",
  );
  const [session, setSession] = useState<unknown>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
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
    const timeoutId = window.setTimeout(() => {
      setIsMobileMenuOpen(false);
      setIsMobileSearchOpen(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [pathname]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const result = await authClient.getSession();
      const record = result as Record<string, unknown> | null;
      const nextSession = (record?.data as unknown) ?? result ?? null;
      setSession(nextSession);

      const nextRecord = nextSession as Record<string, unknown> | null;
      const hasUser = Boolean(nextRecord && "user" in nextRecord && nextRecord.user);
      if (hasUser) {
        refreshBalances();
      }
    } catch {
      setSession(null);
    }
  }, [refreshBalances]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  useEffect(() => {
    if (!isAuthModalOpen) {
      void loadSession();
    }
  }, [isAuthModalOpen, loadSession]);

  const sessionRecord = session as Record<string, unknown> | null;
  const user = (sessionRecord?.user as SessionUser | undefined) ?? null;
  const isLoggedIn = Boolean(user);
  const userDisplayName = user?.name?.trim() || user?.email?.trim() || "ผู้ใช้งาน";
  const userInitial = userDisplayName.slice(0, 1).toUpperCase();

  

  const handleLogout = async () => {
    if (isSigningOut) {
      return;
    }

    setIsSigningOut(true);

    try {
      const result = await authClient.signOut();
      const resultRecord = result as Record<string, unknown> | undefined;

      if (resultRecord?.error) {
        toast.error("ออกจากระบบไม่สำเร็จ");
        return;
      }

      setSession(null);
      clearBalances();
      toast.success("ออกจากระบบสำเร็จ");
    } catch {
      toast.error("ออกจากระบบไม่สำเร็จ");
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b border-white/5 backdrop-blur transition-colors ${
        isScrolled
          ? "bg-black/55 shadow-[0_8px_30px_rgba(0,0,0,0.2)]"
          : "bg-red-400/10"
      }`}
    >
      <div className="mx-auto flex h-16 w-full items-center justify-between gap-2 px-3 sm:h-20 sm:gap-3 sm:px-6 lg:w-3/4 lg:gap-6 lg:px-8">
        <Link
          href="/"
          className="shrink-0"
        >
          <img
            src="https://img1.pic.in.th/images/4.-Titgame-.png"
            alt="TitgameShop"
            className=" h-24 w-auto "
          />
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
              <span className="relative z-10 flex space-x-1 items-center"> <p>{item.icon}</p> <p className="">{item.label}</p></span>
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          <div className="relative hidden sm:block">
  

            {isDesktopSearchFocused  && (
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

        

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <Link
                href="/profile"
                className="user-nav-gradient inline-flex max-w-36 items-center gap-1.5 rounded-lg border px-2 py-1.5 sm:hidden"
              >
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15 text-[10px] font-bold text-white">
                  {userInitial}
                </span>
                <span className="min-w-0 leading-tight">
                  <span className="block truncate text-xs font-semibold text-white/90">
                    {userDisplayName}
                  </span>
                  <span className="flex items-center gap-2 text-[7px] lg:text-[10px] text-white/90">
                    <span className="inline-flex items-center gap-1">
                   
                      <span>{isLoading ? "..." : `฿ ${walletBaht} `}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Coins size={10} />
                      <span>{points}</span>
                    </span>
                  </span>
                </span>
              </Link>

              <Link
                href="/profile"
                className="user-nav-gradient hidden items-center gap-2 rounded-xl border px-2 py-1.5 transition hover:brightness-110 sm:flex"
              >
                {user?.image ? (
                  <img
                    src={user.image}
                    alt="user avatar"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-xs font-bold text-white">
                    {userInitial}
                  </span>
                )}
                <div className="leading-tight">
                  <p className="max-w-32 truncate text-sm font-semibold text-white">
                    {userDisplayName}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-white/90">
                    <span className="inline-flex items-center gap-1">
                      <span>{isLoading ? "..." : `฿ ${walletBaht} `}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Coins size={12} />
                      <span>{points}</span>
                    </span>
                  </div>
                </div>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isSigningOut}
                className="inline-flex size-10 items-center justify-center rounded-xl border border-[#ff4d5f]/40 bg-[#1b1113] text-[#ff4d5f] transition hover:bg-[#281318] disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="ออกจากระบบ"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
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
          )}

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
              className={`rounded-lg px-3 py-2 text-sm font-semibold transition flex items-center ${
                item.match.some(
                  (path) =>
                    pathname === path || pathname.startsWith(`${path}/`),
                )
                  ? "bg-[#ff001f]/20 text-[#ff2742]"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}

          {isLoggedIn ? (
            <Link
              href="/profile"
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10"
            >
              ประวัติของฉัน
            </Link>
          ) : null}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={isSigningOut}
              className="mt-2 rounded-lg border border-[#ff4d5f]/40 bg-[#1b1113] px-3 py-2 text-left text-sm font-semibold text-[#ff4d5f] transition hover:bg-[#281318] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSigningOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
            </button>
          ) : null}

        </nav>
      </div>

      <AuthModal
        key={`${authModalTab}-${isAuthModalOpen ? "open" : "closed"}`}
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </header>
  );
}
