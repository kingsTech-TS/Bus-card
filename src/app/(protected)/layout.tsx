import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <TopNav />
      <div className="flex max-w-[1600px] mx-auto w-full">
        <Sidebar />
        <main className="flex-1 overflow-auto p-4 sm:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
