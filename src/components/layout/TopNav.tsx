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
    <header className="flex h-16 shrink-0 items-center justify-between mb-6 mt-2 relative z-50">
      <div className="flex items-center gap-4">
        {/* Sidebar toggle */}
        <Button variant="ghost" size="icon" onClick={toggleSidebar} className="bg-card shadow-soft rounded-full">
          <Menu className="h-5 w-5 text-muted-foreground" />
        </Button>
        {/* Fake Search bar from mock */}
        <div className="hidden lg:flex items-center bg-card shadow-soft rounded-full px-4 py-2.5 w-64">
           <svg className="w-4 h-4 text-muted-foreground mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
           <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full font-medium" />
        </div>
      </div>

      <div className="flex items-center gap-4 bg-card px-3 py-2 rounded-full shadow-soft">
        <span className="text-sm text-foreground/70 mr-2 font-semibold hidden sm:flex items-center gap-2 px-3">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
        </span>
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-muted/80"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          {theme === "dark" ? <Sun className="h-5 w-5 text-muted-foreground" /> : <Moon className="h-5 w-5 text-muted-foreground" />}
        </Button>

        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger>
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
