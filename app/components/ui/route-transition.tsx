"use client";

import { motion, useAnimationControls } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import type { ReactNode } from "react";

type RouteTransitionProps = {
  children: ReactNode;
};

export default function RouteTransition({ children }: RouteTransitionProps) {
  const pathname = usePathname();
  const controls = useAnimationControls();

  useEffect(() => {
    controls.set({ opacity: 0.94, y: 8 });
    controls.start({
      opacity: 1,
      y: 0,
      transition: { duration: 0.2, ease: "easeOut" },
    });
  }, [pathname, controls]);

  return (
    <motion.div
      initial={false}
      animate={controls}
    >
      {children}
    </motion.div>
  );
}
