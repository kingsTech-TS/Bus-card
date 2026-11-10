"use client";
import { DesignPreview } from "@/components/design/DesignPreview";
import { BUILTIN_TEMPLATES } from "@/lib/templates";
import { useDesignFonts } from "@/hooks/useFonts";

const pick = (slug: string) => BUILTIN_TEMPLATES.find((t) => t.id === `builtin-${slug}`)!;

/** Hero visual: a front and back of the same card, fanned out. */
export function HeroCards() {
  useDesignFonts();
  const t = pick("startup-violet");
  const t2 = pick("midnight-executive");
  return (
    <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
      <div className="absolute inset-0 -z-10 rounded-full bg-linear-to-tr from-indigo-500/25 via-fuchsia-500/20 to-amber-400/20 blur-3xl" />
      <div className="animate-float absolute left-0 top-[6%] w-[68%] overflow-hidden rounded-xl shadow-2xl shadow-indigo-900/25 ring-1 ring-black/5" style={{ "--tilt": "-7deg" } as React.CSSProperties}>
        <DesignPreview design={t2.design} side="back" />
      </div>
      <div className="animate-float absolute right-0 top-[30%] w-[72%] overflow-hidden rounded-xl shadow-2xl shadow-indigo-900/30 ring-1 ring-black/5" style={{ "--tilt": "5deg", animationDelay: "-3s" } as React.CSSProperties}>
        <DesignPreview design={t.design} side="front" />
      </div>
    </div>
  );
}

/** Endless horizontal strip of template fronts. */
export function TemplateMarquee() {
  useDesignFonts();
  const row = BUILTIN_TEMPLATES.slice(0, 14);
  return (
    <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
      <div className="animate-marquee flex w-max gap-5 py-4 hover:[animation-play-state:paused]">
        {[...row, ...row].map((t, i) => (
          <div key={`${t.id}-${i}`} className="w-64 shrink-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-black/5 dark:ring-white/10" aria-hidden={i >= row.length}>
            <DesignPreview design={t.design} />
          </div>
        ))}
      </div>
    </div>
  );
}
