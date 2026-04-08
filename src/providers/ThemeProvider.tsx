"use client";
import { useEffect, type ReactNode } from "react";
import { useUIStore } from "@/store/ui.store";

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { theme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Optionally could block render until mounted to prevent hydration mismatch, 
  // but simpler to just apply it dynamically.
  return <>{children}</>;
}
