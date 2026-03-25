import type { ReactNode } from "react";
import Footer from "../components/ui/footer";
import Navbar from "../components/ui/navbar";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#000000] text-white">
      <Navbar />
      <div className="flex-1 pt-16 sm:pt-20">{children}</div>
      <Footer />
    </div>
  );
}
