"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Sun, Moon, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUIStore } from "@/store/ui.store";
import { useAuthStore } from "@/store/auth.store";
import { useLogout } from "@/hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function TopNav() {
  const { toggleSidebar, theme, setTheme } = useUIStore();
  const { user } = useAuthStore();
  const { mutate: logout } = useLogout();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center px-4 border-b bg-background/80 backdrop-blur">
      <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-4">
        <Menu className="h-5 w-5" />
      </Button>

      <Link href="/dashboard" className="font-bold text-xl mr-auto tracking-tight">
        BusCard<span className="text-primary">.</span>
      </Link>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        {user && (
          <DropdownMenu>
            {/* @ts-expect-error React 19 radix typing issue */}
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.avatar_url} alt={user.full_name || 'User'} />
                <AvatarFallback>{(user.full_name || user.email)[0].toUpperCase()}</AvatarFallback>
              </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <div className="flex items-center justify-start gap-2 p-2">
                <div className="flex flex-col space-y-1 leading-none">
                  <p className="text-sm font-medium leading-none">{user.full_name || user.email}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/profile")}>
                <UserIcon className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()} className="text-destructive focus:bg-destructive/10">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
