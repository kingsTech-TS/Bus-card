import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutTemplate, Zap, Shield } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col flex-1">
      <section className="py-20 md:py-32 bg-gradient-to-b from-background to-muted/50 border-b">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
            Design professional <br className="hidden md:block" />
            <span className="text-primary bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
              business cards
            </span> in minutes.
          </h1>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            The easiest way to create, manage, and export beautiful business cards for yourself or your entire team. No design skills required.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="h-12 px-8 text-base">
                Start designing for free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Browse templates
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 text-primary">
                <LayoutTemplate className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Premium Templates</h3>
              <p className="text-muted-foreground">Start with hundreds of professionally designed templates for any industry.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6 text-blue-500">
                <Zap className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">AI Powered</h3>
              <p className="text-muted-foreground">Let our AI suggest designs, taglines, and layouts perfectly tailored to your brand.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mb-6 text-green-500">
                <Shield className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Brand Consistent</h3>
              <p className="text-muted-foreground">Lock in your fonts, colors, and logos with Brand Kits to keep your entire team aligned.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
