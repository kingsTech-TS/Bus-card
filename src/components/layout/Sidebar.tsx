"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { 
  CreditCard, LayoutTemplate, Palette, 
  Image as ImageIcon, BarChart3, Settings, Users 
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
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

  if (!sidebarOpen) return null;

  return (
    <aside className="w-[280px] bg-card rounded-3xl shadow-soft border-0 flex flex-col h-[calc(100vh-2rem)] md:h-full overflow-hidden shrink-0 transition-all duration-300 fixed md:static inset-y-4 left-4 z-50">
      <div className="p-8 pb-6 flex items-center gap-3">
        {/* Placeholder Logo Icon */}
        <div className="w-8 h-8 rounded-full bg-linear-to-tr from-primary to-accent flex items-center justify-center shrink-0">
          <div className="w-3 h-3 bg-white rounded-full" />
        </div>
        <Link href="/dashboard" className="font-bold text-2xl tracking-tight text-foreground">
          BusCard<span className="text-primary">.</span>
        </Link>
      </div>
      <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[0.98]" 
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {link.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-6 mt-auto">
        <div className="bg-muted/50 rounded-2xl p-4 text-center">
            <p className="text-xs font-semibold text-muted-foreground mb-2">PRO VERSION</p>
            <p className="text-[10px] text-muted-foreground mb-3">Upgrade for more features</p>
            <button className="w-full bg-background border shadow-sm text-foreground rounded-xl py-2 text-xs font-bold hover:bg-muted transition-colors">Upgrade</button>
        </div>
      </div>
    </aside>
  );
}
