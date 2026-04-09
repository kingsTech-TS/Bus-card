"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { 
  CreditCard, LayoutTemplate, Palette, 
  Image as ImageIcon, BarChart3, Settings, Users,
  ChevronLeft, ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { Button } from "@/components/ui/button";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
    { href: "/cards", label: "My Cards", icon: CreditCard },
    { href: "/templates", label: "Templates", icon: LayoutTemplate },
    { href: "/brand-kit", label: "Brand Kit", icon: Palette },
    { href: "/assets", label: "Assets", icon: ImageIcon },
    { href: "/profile", label: "Profile", icon: Settings },
  ];

  if (user?.role === "admin") {
    links.push({ href: "/admin", label: "Admin", icon: Users });
  }

  return (
    <aside className={cn(
      "bg-card rounded-3xl shadow-soft border-0 flex flex-col h-[calc(100vh-2rem)] md:h-full overflow-hidden shrink-0 transition-all duration-300 ease-in-out fixed md:static inset-y-4 left-4 z-50",
      sidebarOpen ? "w-[280px]" : "w-[88px]",
      !sidebarOpen && "md:w-[88px] -translate-x-full md:translate-x-0", // Hide on mobile if closed, but keep icons on desktop
      className
    )}>
      <div className={cn(
        "p-8 pb-6 flex items-center justify-between gap-3",
        !sidebarOpen && "px-4 justify-center"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Placeholder Logo Icon */}
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center shrink-0 shadow-sm shadow-primary/20">
            <div className="w-3 h-3 bg-white rounded-full" />
          </div>
          {sidebarOpen && (
            <Link href="/dashboard" className="font-bold text-2xl tracking-tight text-foreground whitespace-nowrap">
              BusCard<span className="text-primary">.</span>
            </Link>
          )}
        </div>
        
        {/* Toggle Button for Desktop */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className={cn(
            "hidden md:flex h-8 w-8 rounded-full hover:bg-muted shrink-0 transition-transform duration-300",
            !sidebarOpen && "absolute -right-3 top-10 bg-card shadow-md border"
          )}
        >
          {sidebarOpen ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </div>

      <nav className={cn(
        "flex-1 px-4 py-2 space-y-2 overflow-y-auto overflow-x-hidden",
        !sidebarOpen && "px-2"
      )}>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all group relative",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[0.98]" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                !sidebarOpen && "justify-center px-0 h-12 w-12 mx-auto"
              )}
            >
              <Icon className={cn("w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110", isActive && "scale-105")} />
              {sidebarOpen && <span className="whitespace-nowrap">{link.label}</span>}
              
              {/* Tooltip on collapsed state */}
              {!sidebarOpen && (
                <div className="absolute left-full ml-4 px-3 py-1.5 bg-zinc-900 text-white text-xs font-bold rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[100] whitespace-nowrap shadow-xl border border-zinc-800 pointer-events-none">
                  {link.label}
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 bg-zinc-900 rotate-45 border-l border-b border-zinc-800" />
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className={cn("p-6 mt-auto", !sidebarOpen && "p-2")}>
        {sidebarOpen ? (
          <div className="bg-muted/50 rounded-2xl p-4 text-center border border-muted-foreground/5">
              <p className="text-xs font-semibold text-muted-foreground mb-1 tracking-wider">PRO VERSION</p>
              <p className="text-[10px] text-muted-foreground/80 mb-3 leading-tight">Upgrade for more features</p>
              <button className="w-full bg-card border shadow-sm text-foreground rounded-xl py-2 text-xs font-bold hover:bg-muted transition-colors">Upgrade</button>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-10 h-10 rounded-2xl bg-muted/50 flex items-center justify-center cursor-pointer hover:bg-muted transition-colors border border-muted-foreground/5">
              <span className="text-[10px] font-black text-primary">PRO</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
