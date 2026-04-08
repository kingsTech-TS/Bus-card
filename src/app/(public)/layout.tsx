import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-2xl tracking-tight">
            BusCard<span className="text-primary">.</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up free</Button>
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
