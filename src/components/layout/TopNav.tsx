"use client";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, Moon, Sun, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { displayName, useLogout } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const TITLES: [RegExp, string][] = [
  [/^\/dashboard/, "Dashboard"],
  [/^\/cards/, "My cards"],
  [/^\/templates/, "Templates"],
  [/^\/brand-kit/, "Brand kit"],
  [/^\/assets/, "Assets"],
  [/^\/profile/, "Settings"],
  [/^\/admin\/users/, "Users"],
  [/^\/admin/, "Admin"],
];

export function TopNav() {
  const { theme, setTheme, setMobileNavOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const { mutate: logout } = useLogout();
  const router = useRouter();
  const pathname = usePathname();
  const title = TITLES.find(([re]) => re.test(pathname))?.[1] ?? "";
  const name = displayName(user);

  return (
    <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileNavOpen(true)} aria-label="Open menu">
        <Menu className="size-5" />
      </Button>
      <h1 className="text-base font-semibold tracking-tight">{title}</h1>

      <div className="ml-auto flex items-center gap-1.5">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          title={theme === "dark" ? "Light mode" : "Dark mode"}
        >
          {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button variant="ghost" className="h-9 gap-2 rounded-full pl-1 pr-3" aria-label="Account menu" />}
            >
              <Avatar className="size-7">
                <AvatarImage src={user.avatar_url} alt={name} />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{name[0]?.toUpperCase()}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
              <div className="px-2 py-2">
                <p className="truncate text-sm font-medium">{name}</p>
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <UserIcon className="size-4" />
                Profile & settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:bg-destructive/10">
                <LogOut className="size-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
