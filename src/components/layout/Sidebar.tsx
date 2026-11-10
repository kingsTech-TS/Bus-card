"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  BarChart3, ChevronsLeft, ChevronsRight, CreditCard, Image as ImageIcon, LayoutTemplate, LogOut, Palette, Plus, Settings, Shield, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { displayName, useLogout } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoMark } from "@/components/brand/Logo";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/cards", label: "My cards", icon: CreditCard },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/brand-kit", label: "Brand kit", icon: Palette },
  { href: "/assets", label: "Assets", icon: ImageIcon },
];

function NavLink({ href, label, icon: Icon, collapsed, onNavigate }: { href: string; label: string; icon: React.ElementType; collapsed: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        active && "bg-accent text-accent-foreground hover:bg-accent hover:text-accent-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {active && <span className="absolute -left-3 top-2 bottom-2 w-1 rounded-r-full bg-primary" />}
      <Icon className={cn("size-[18px] shrink-0", active && "text-primary")} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}

function SidebarContent({ collapsed, onNavigate }: { collapsed: boolean; onNavigate?: () => void }) {
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const { toggleSidebar } = useUIStore();
  const name = displayName(user);

  return (
    <div className="flex h-full flex-col">
      <div className={cn("flex h-16 shrink-0 items-center gap-2.5 px-5", collapsed && "justify-center px-0")}>
        <Link href="/dashboard" onClick={onNavigate} className="flex items-center gap-2.5 font-semibold tracking-tight">
          <LogoMark />
          {!collapsed && <span className="text-lg">BusCard</span>}
        </Link>
      </div>

      <div className={cn("px-3 pb-2", collapsed && "px-2")}>
        <Link
          href="/templates"
          onClick={onNavigate}
          title={collapsed ? "New card" : undefined}
          className={cn(
            "flex h-10 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-opacity hover:opacity-90"
          )}
        >
          <Plus className="size-4" />
          {!collapsed && "New card"}
        </Link>
      </div>

      <nav className={cn("flex-1 space-y-1 overflow-y-auto px-3 py-3", collapsed && "px-2")} aria-label="Main">
        {LINKS.map((l) => (
          <NavLink key={l.href} {...l} collapsed={collapsed} onNavigate={onNavigate} />
        ))}
        {user?.role === "admin" && (
          <>
            {!collapsed && <p className="px-3 pb-1 pt-5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Admin</p>}
            {collapsed && <div className="mx-2 my-3 h-px bg-border" />}
            <NavLink href="/admin" label="Admin" icon={Shield} collapsed={collapsed} onNavigate={onNavigate} />
          </>
        )}
      </nav>

      <div className="border-t border-border p-3">
        <NavLink href="/profile" label="Settings" icon={Settings} collapsed={collapsed} onNavigate={onNavigate} />
        <div className={cn("mt-2 flex items-center gap-3 rounded-lg p-2", collapsed && "flex-col p-0 py-2")}>
          <Avatar className="size-8">
            <AvatarImage src={user?.avatar_url} alt={name} />
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.username ? `@${user.username}` : user?.email}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => logout()}
            title="Log out"
            aria-label="Log out"
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
        <button
          type="button"
          onClick={toggleSidebar}
          className="mt-1 hidden h-8 w-full items-center justify-center gap-2 rounded-lg text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronsRight className="size-4" /> : <><ChevronsLeft className="size-4" /> Collapse</>}
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  const { sidebarOpen, mobileNavOpen, setMobileNavOpen } = useUIStore();
  const pathname = usePathname();

  // Close the mobile drawer on navigation.
  useEffect(() => setMobileNavOpen(false), [pathname, setMobileNavOpen]);

  return (
    <>
      {/* Desktop */}
      <aside
        className={cn(
          "hidden shrink-0 border-r border-sidebar-border bg-sidebar transition-[width] duration-200 lg:block",
          sidebarOpen ? "w-64" : "w-[72px]"
        )}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Mobile drawer */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", !mobileNavOpen && "pointer-events-none")} aria-hidden={!mobileNavOpen}>
        <div
          className={cn("absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity", mobileNavOpen ? "opacity-100" : "opacity-0")}
          onClick={() => setMobileNavOpen(false)}
        />
        <aside
          className={cn(
            "absolute inset-y-0 left-0 w-72 border-r border-sidebar-border bg-sidebar shadow-xl transition-transform duration-200",
            mobileNavOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="absolute right-3 top-4 rounded-md p-1.5 text-muted-foreground hover:bg-muted"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
          <SidebarContent collapsed={false} onNavigate={() => setMobileNavOpen(false)} />
        </aside>
      </div>
    </>
  );
}
