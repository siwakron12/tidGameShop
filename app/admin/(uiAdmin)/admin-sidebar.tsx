"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Menu, X, LogOut, BarChart3, Users, Settings, Wallet } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const adminNavItems = [
  { label: "แดชบอร์ด", href: "/admin", icon: BarChart3, match: ["/admin"] },
  { label: "ผู้ใช้", href: "/admin/users", icon: Users, match: ["/admin/users"] },
  { label: "การเงิน", href: "/admin/transactions", icon: Wallet, match: ["/admin/transactions"] },
  { label: "ตั้งค่า", href: "/admin/settings", icon: Settings, match: ["/admin/settings"] },
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
        if (!cancelled) {
          setSession(null);
        }
      }
    };

    loadSession();

    return () => {
      cancelled = true;
    };
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

  const user = session && typeof session === "object" && "user" in session 
    ? (session.user as SessionUser) 
    : null;

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-[#111111] p-2 text-white md:hidden"
      >
        {isMobileSidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar Backdrop for Mobile */}
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
        {/* Header */}
        <div className="border-b border-[#222222] px-6 py-8">
          <Link href="/admin" className="text-xl font-bold text-white">
            TidGameShop
          </Link>
          <p className="mt-1 text-sm text-gray-400">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {adminNavItems.map((item) => {
              const isActive = item.match.includes(pathname);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileSidebarOpen(false)}
                  className="group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-[#222222]"
                      transition={{ type: "spring", stiffness: 380, damping: 40 }}
                    />
                  )}
                  <Icon
                    size={20}
                    className={`relative z-10 transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`relative z-10 font-medium transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info & Sign Out */}
        <div className="border-t border-[#222222] px-4 py-6">
          {user && (
            <div className="mb-4">
              <p className="text-sm font-medium text-white">{user.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-600/20 disabled:opacity-50"
          >
            <LogOut size={16} />
            {isSigningOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
          </button>
        </div>
      </motion.aside>

      {/* Desktop Sidebar */}
      <aside className="hidden h-screen w-64 flex-col border-r border-[#222222] bg-[#0a0a0a] md:flex">
        {/* Header */}
        <div className="border-b border-[#222222] px-6 py-8">
          <Link href="/admin" className="text-xl font-bold text-white">
            TidGameShop
          </Link>
          <p className="mt-1 text-sm text-gray-400">Admin Panel</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <div className="space-y-2">
            {adminNavItems.map((item) => {
              const isActive = item.match.includes(pathname);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group relative flex items-center gap-3 rounded-lg px-4 py-3 transition-all ${
                    isActive ? "bg-[#222222]" : "hover:bg-[#111111]"
                  }`}
                >
                  <Icon
                    size={20}
                    className={`transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    }`}
                  />
                  <span
                    className={`font-medium transition-colors ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Info & Sign Out */}
        <div className="border-t border-[#222222] px-4 py-6">
          {user && (
            <div className="mb-4">
              <p className="text-sm font-medium text-white">{user.name || "Admin"}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}
          <button
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-red-600/10 px-4 py-2 text-sm font-medium text-red-500 transition-all hover:bg-red-600/20 disabled:opacity-50"
          >
            <LogOut size={16} />
            {isSigningOut ? "กำลังออกจากระบบ..." : "ออกจากระบบ"}
          </button>
        </div>
      </aside>
    </>
  );
}
