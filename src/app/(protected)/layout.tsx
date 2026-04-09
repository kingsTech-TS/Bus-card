"use client";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEditorPage = pathname.match(/\/cards\/[a-zA-Z0-9_-]+$/);

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className={cn(
        "flex max-w-[1700px] mx-auto w-full h-screen overflow-hidden",
        !isEditorPage ? "p-4 sm:p-6 gap-6" : "p-0 gap-0"
      )}>
        <Sidebar className={cn(isEditorPage && "h-screen rounded-none border-r")} />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {!isEditorPage && <TopNav />}
          <main className={cn(
            "flex-1 overflow-hidden",
            !isEditorPage ? "overflow-y-auto pb-10 pr-2" : "h-full w-full"
          )}>
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
