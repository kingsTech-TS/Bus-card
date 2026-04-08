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
    <aside className="w-64 border-r bg-card flex flex-col min-h-[calc(100vh-4rem)]">
      <nav className="flex-1 p-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname.startsWith(link.href);
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-5 h-5" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
