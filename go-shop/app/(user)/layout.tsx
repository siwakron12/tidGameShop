import type { ReactNode } from "react";
import Navbar from "../components/ui/navbar";

type UserLayoutProps = {
  children: ReactNode;
};

export default function UserLayout({ children }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-[#000000] text-white">
      <Navbar />
      <div>{children}</div>
    </div>
  );
}
