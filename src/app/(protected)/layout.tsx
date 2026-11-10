"use client";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorPage = /^\/cards\/[a-zA-Z0-9_-]+$/.test(pathname);

  // The card editor is a full-screen workspace with its own chrome.
  if (isEditorPage) {
    return <div className="h-screen overflow-hidden bg-background font-sans text-foreground">{children}</div>;
  }

  return <AppShell>{children}</AppShell>;
}
