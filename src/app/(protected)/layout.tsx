import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="flex max-w-[1700px] mx-auto w-full h-screen p-4 sm:p-6 gap-6 overflow-hidden">
        <Sidebar />
        <div className="flex flex-col flex-1 h-full overflow-hidden">
          <TopNav />
          <main className="flex-1 overflow-y-auto pb-10 pr-2">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
