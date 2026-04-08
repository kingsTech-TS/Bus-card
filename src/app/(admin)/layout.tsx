import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/30">
      <TopNav />
      <div className="flex max-w-[1600px] mx-auto w-full">
        <Sidebar /* You could conditionally render admin links here internally */ />
        <main className="flex-1 overflow-auto p-4 sm:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
