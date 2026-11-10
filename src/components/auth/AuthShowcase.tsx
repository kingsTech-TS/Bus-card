"use client";
import { Check } from "lucide-react";
import { DesignPreview } from "@/components/design/DesignPreview";
import { BUILTIN_TEMPLATES } from "@/lib/templates";
import { useDesignFonts } from "@/hooks/useFonts";

const pick = (slug: string) => BUILTIN_TEMPLATES.find((t) => t.id === `builtin-${slug}`)!;
const CARDS = [
  { t: pick("tech-orbit"), side: "front" as const, cls: "left-[6%] top-[14%] w-[58%]", tilt: "-8deg", delay: "0s" },
  { t: pick("elegant-serif"), side: "front" as const, cls: "right-[4%] top-[34%] w-[54%]", tilt: "6deg", delay: "-2.5s" },
  { t: pick("creative-pop"), side: "back" as const, cls: "left-[14%] bottom-[10%] w-[50%]", tilt: "-3deg", delay: "-5s" },
];

const POINTS = ["26 designer templates, front and back", "Drag-and-drop editor with AI help", "Print-ready PDF and PNG export"];

/** Decorative right-hand panel for the auth pages. */
export function AuthShowcase() {
  useDesignFonts();
  return (
    <div className="relative hidden overflow-hidden bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 lg:flex lg:flex-col">
      <div className="bg-dots pointer-events-none absolute inset-0 opacity-30 [--foreground:white]" />
      <div className="pointer-events-none absolute -right-32 -top-32 size-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -left-24 size-[28rem] rounded-full bg-fuchsia-400/30 blur-3xl" />

      <div className="relative flex-1">
        {CARDS.map(({ t, side, cls, tilt, delay }) => (
          <div
            key={t.id}
            className={`animate-float absolute overflow-hidden rounded-lg shadow-2xl shadow-black/30 ring-1 ring-white/20 ${cls}`}
            style={{ "--tilt": tilt, animationDelay: delay } as React.CSSProperties}
          >
            <DesignPreview design={t.design} side={side} />
          </div>
        ))}
      </div>

      <div className="relative p-10 text-white xl:p-14">
        <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
          Business cards that make a first impression.
        </h2>
        <ul className="mt-6 space-y-2.5 text-sm text-white/85">
          {POINTS.map((p) => (
            <li key={p} className="flex items-center gap-2.5">
              <span className="flex size-5 items-center justify-center rounded-full bg-white/20">
                <Check className="size-3" />
              </span>
              {p}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
