import Link from "next/link";
import { cn } from "@/lib/utils";

/** BusCard mark: two overlapping cards. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex size-8 shrink-0 items-center justify-center rounded-[10px] bg-linear-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-md shadow-indigo-500/30",
        className
      )}
      aria-hidden
    >
      <span className="absolute h-[42%] w-[58%] -translate-x-[8%] -translate-y-[10%] -rotate-12 rounded-[3px] bg-white/45" />
      <span className="absolute h-[42%] w-[58%] translate-x-[8%] translate-y-[10%] rounded-[3px] bg-white" />
    </span>
  );
}

export function Logo({ href = "/", className, showText = true }: { href?: string; className?: string; showText?: boolean }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2.5 font-semibold tracking-tight", className)}>
      <LogoMark />
      {showText && <span className="text-lg">BusCard</span>}
    </Link>
  );
}
