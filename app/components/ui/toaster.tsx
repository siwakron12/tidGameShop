"use client";

import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
   
        <Sonner
      position="top-right"
      duration={4000}
      richColors
      closeButton
      theme={theme as ToasterProps["theme"]}
      className="group"
      toastOptions={{
        className:
          "bg-white font-kanit text-black border border-gray-300 rounded-xl shadow-md px-4 py-4 text-sm",
      }}
      {...props}
    />
  );
};

export { Toaster };
