import Link from "next/link";
import { ArrowRight, Download, Layers, LayoutTemplate, MousePointerClick, Palette, QrCode, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCards, TemplateMarquee } from "@/components/marketing/TemplateShowcase";

const FEATURES = [
  { icon: LayoutTemplate, title: "Designer templates", text: "Start from 26 polished layouts across every industry — each with a matching back." },
  { icon: MousePointerClick, title: "Drag-and-drop editor", text: "Move, resize and rotate anything. Snap guides keep everything perfectly aligned." },
  { icon: Layers, title: "Front & back", text: "Design both sides of your card side by side and flip between them instantly." },
  { icon: Sparkles, title: "AI assist", text: "Generate a full layout, suggest a tagline, or polish your wording in one click." },
  { icon: QrCode, title: "Live QR codes", text: "Add scannable QR codes that link to your site, portfolio or contact details." },
  { icon: Download, title: "Print-ready export", text: "Download a double-sided PDF with bleed for print, or crisp PNGs for sharing." },
];

const STEPS = [
  { n: "01", title: "Pick a template", text: "Browse by industry or style, or start from a blank card." },
  { n: "02", title: "Make it yours", text: "Edit text, colours, logos and QR codes on both sides." },
  { n: "03", title: "Export & print", text: "Get a print-ready PDF or PNG in seconds." },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="bg-dots pointer-events-none absolute inset-0 opacity-50 [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 pb-20 pt-16 sm:px-6 md:pt-24 lg:grid-cols-2">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
              <Palette className="size-3.5 text-primary" />
              Now with double-sided cards
            </span>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Business cards <span className="text-gradient">people keep.</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted-foreground">
              Design a professional, print-ready card in minutes. Start from a template, customise both sides, and export — no design skills needed.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" className="h-12 px-6 text-base" nativeButton={false} render={<Link href="/signup" />}>
                Start designing — it&apos;s free <ArrowRight />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base" nativeButton={false} render={<Link href="/login" />}>
                Sign in
              </Button>
            </div>
          </div>
          <HeroCards />
        </div>
      </section>

      {/* Templates */}
      <section id="templates" className="scroll-mt-20 border-y border-border/60 bg-muted/40 py-16">
        <div className="mx-auto mb-8 max-w-6xl px-4 sm:px-6">
          <p className="text-sm font-medium text-primary">Templates</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">A look for every line of work</h2>
        </div>
        <TemplateMarquee />
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Everything you need to make a great card</h2>
        </div>
        <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card p-7 transition-colors hover:bg-muted/40">
              <span className="mb-5 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="mx-auto max-w-6xl scroll-mt-20 px-4 pb-24 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.n} className="border-t-2 border-primary/20 pt-6">
              <p className="font-mono text-sm text-primary">{s.n}</p>
              <h3 className="mt-2 text-lg font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-600 via-violet-600 to-fuchsia-600 px-8 py-16 text-center text-white shadow-xl">
          <div className="bg-dots pointer-events-none absolute inset-0 opacity-20 [--foreground:white]" />
          <h2 className="relative text-3xl font-semibold tracking-tight sm:text-4xl">Your next card is a few clicks away</h2>
          <p className="relative mx-auto mt-3 max-w-md text-white/80">Create a free account and design your first card in minutes.</p>
          <Button size="lg" variant="secondary" className="relative mt-8 h-12 px-6 text-base" nativeButton={false} render={<Link href="/signup" />}>
            Create your card <ArrowRight />
          </Button>
        </div>
      </section>
    </>
  );
}
