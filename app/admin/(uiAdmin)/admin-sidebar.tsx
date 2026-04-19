"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Menu,
  X,
  ChevronDown,
  LogOut,
  BarChart3,
  Users,
  Settings,
  Gift,
  Wallet,
  Gamepad2,
  Building2,
  Package,
  Dice5,
  ShoppingCart,
  Banknote,
  Bell,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

type NavGroup = {
  key: string;
  title: string;
  items: NavItem[];
};

const adminNavGroups: NavGroup[] = [
  {
    key: "system-overview",
    title: "ภาพรวมระบบ",
    items: [
      { label: "แดชบอร์ด", href: "/admin", icon: BarChart3 },
      { label: "ผู้ใช้", href: "/admin/users", icon: Users },
      { label: "การเงิน", href: "/admin/transactions", icon: Wallet },
      { label: "แจ้งเตือน", href: "/admin/noti", icon: Bell },
      { label: "orders", href: "/admin/orders", icon: ShoppingCart },
      { label: "มอบรางวัล", href: "/admin/claims", icon: Gift },
    ],
  },
  {
    key: "game-topup",
    title: "ระบบเกมและแพ็ค",
    items: [
      { label: "providers", href: "/admin/providers", icon: Building2 },
      { label: "gameManange", href: "/admin/gameManange", icon: Gamepad2 },
      { label: "packs", href: "/admin/packs", icon: Package },
      { label: "ระบบสุ่ม", href: "/admin/gacha", icon: Dice5 },
    ],
  },
];

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [session, setSession] = useState<unknown>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    adminNavGroups.reduce<Record<string, boolean>>((acc, group) => {
      acc[group.key] = true;
      return acc;
    }, {}),
  );

  useEffect(() => {
    let cancelled = false;
    const loadSession = async () => {
      try {
        const result = await authClient.getSession();
        if (!cancelled) {
          const record = result as Record<string, unknown> | null;
          setSession((record?.data as unknown) ?? result ?? null);
        }
      } catch {
        if (!cancelled) setSession(null);
      }
    };
    loadSession();
    return () => { cancelled = true; };
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await authClient.signOut();
      window.location.href = "/";
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  };

  const user =
    session && typeof session === "object" && "user" in session
      ? (session.user as SessionUser)
      : null;

  const isItemActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const isGroupActive = (group: NavGroup) =>
    group.items.some((item) => isItemActive(item.href));

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  useEffect(() => {
    const activeGroup = adminNavGroups.find((group) => isGroupActive(group));
    if (!activeGroup) return;
    setOpenGroups((prev) => {
      if (prev[activeGroup.key]) return prev;
      return { ...prev, [activeGroup.key]: true };
    });
  }, [pathname]);

  const SidebarContent = ({ onLinkClick }: { onLinkClick?: () => void }) => (
    <>
      {/* Header */}
      <div className="border-b border-[#222222] px-6 py-8">
        <Link href="/admin" className="text-xl font-bold text-white">
          TitGameShop
        </Link>
        <p className="mt-1 text-sm text-gray-400">Admin Panel</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-6">
          {adminNavGroups.map((group) => (
            <div key={group.key}>
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                className="flex w-full items-center justify-between rounded-md px-3 pb-2 text-left text-[11px] font-semibold uppercase tracking-wide text-gray-500 transition-colors hover:text-gray-300"
              >
                <span>{group.title}</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform ${openGroups[group.key] ? "rotate-180" : "rotate-0"}`}
                />
              </button>
              {openGroups[group.key] && (
                <div className="space-y-1">
                  {group.items.map((item) => {
                    const isActive = isItemActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={onLinkClick}
                        className={`group relative flex items-center gap-2 rounded-md px-3 py-2 transition-all ${isActive ? "bg-[#222222]" : "hover:bg-[#111111]"
                          }`}
                      >
                        <Icon
                          size={18}
                          className={`transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                            }`}
                        />
                        <span
                          className={`text-sm font-medium transition-colors ${isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                            }`}
                        >
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Info & Sign Out */}
      <div className="border-t border-[#222222] px-4 py-6 flex flex-col gap-2">
        {user && (
          <div className="mb-2">
            <p className="text-sm font-medium text-white">{user.name || "Admin"}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        )}
        <Link
          href="/"
          className="flex w-full border border-white/20 items-center justify-center gap-2 rounded-lg bg-green-600/10 px-4 py-2 text-sm font-medium text-green-500 transition-all hover:bg-green-600/20"
        >
          กลับไปหน้าเว็บไซต์
        </Link>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-600/20 disabled:opacity-50"
        >
          <LogOut size={16} />
          {isSigningOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#111111] p-2 text-white md:hidden"
      >
        {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Backdrop */}
      {isMobileSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMobileSidebarOpen(false)}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      )}

      {/* Mobile Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: isMobileSidebarOpen ? 0 : -280 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#222222] bg-[#0a0a0a] md:hidden"
      >
        <SidebarContent onLinkClick={() => setIsMobileSidebarOpen(false)} />
      </motion.aside>

      {/* Desktop Sidebar */}
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r border-[#222222] bg-[#0a0a0a] md:flex fixed left-0 top-0 h-screen overflow-y-auto">
        <SidebarContent />
      </aside>
    </>
  );
}