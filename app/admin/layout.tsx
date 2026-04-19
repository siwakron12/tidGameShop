"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import AdminSidebar from "./(uiAdmin)/admin-sidebar";
import { authClient } from "@/lib/auth-client";

type AdminLayoutProps = {
  children: ReactNode;
};

type SessionUser = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role?: string | null;
};

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isMd, setIsMd] = useState(false);

  useEffect(() => {
    const check = () => setIsMd(window.innerWidth >= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  useEffect(() => {
    let cancelled = false;

    const checkAdminAccess = async () => {
      try {
        const result = await authClient.getSession();
        if (cancelled) return;

        const record = result as Record<string, unknown> | null;
        const sessionData = (record?.data as unknown) ?? result;

        if (!sessionData || typeof sessionData !== "object") {
          setIsAuthorized(false);
          setIsLoading(false);
          router.push("/");
          toast.error("Session not found");
          return;
        }

        const user = (sessionData as Record<string, unknown>).user as SessionUser | undefined;

        if (!user || user.role !== "admin") {
          setIsAuthorized(false);
          setIsLoading(false);
          router.push("/");
          toast.error("Access denied. Admin role required.");
          return;
        }

        setIsAuthorized(true);
        setIsLoading(false);
      } catch (error) {
        if (!cancelled) {
          console.error("Error checking admin access:", error);
          setIsAuthorized(false);
          setIsLoading(false);
          router.push("/");
          toast.error("Failed to verify admin access");
        }
      }
    };

    checkAdminAccess();

    return () => {
      cancelled = true;
    };
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#000000]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <div className="bg-[#000000] text-white">
      <div className="min-w-275">
        <AdminSidebar />
        <div className="min-h-screen" style={{ paddingLeft: isMd ? "256px" : "0px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
