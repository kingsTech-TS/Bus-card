"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaintBucket, Plus, Type } from "lucide-react";
import { useState } from "react";

// Mock data since brand kit endpoints are typically simple CRUD
export default function BrandKitPage() {
  const [colors, setColors] = useState(["#primary", "#secondary", "#accent"]);

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Your Brand Kit" 
        description="Set up your brand colors, fonts, and logos to quickly apply them to any design."
      >
        <Button>Save Brand Kit</Button>
      </PageHeader>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PaintBucket className="w-5 h-5"/> Brand Colors</CardTitle>
            <CardDescription>Define your primary, secondary, and accent colors.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="w-20 h-20 rounded-xl bg-primary shadow-sm border" />
              <div className="w-20 h-20 rounded-xl bg-blue-500 shadow-sm border" />
              <div className="w-20 h-20 rounded-xl bg-amber-500 shadow-sm border" />
              <Button variant="outline" className="w-20 h-20 rounded-xl border-dashed">
                <Plus className="w-6 h-6 text-muted-foreground" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Click the plus icon to add a hex code.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="w-5 h-5"/> Brand Fonts</CardTitle>
            <CardDescription>Select the typography that represents your brand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Primary Heading Font</div>
              <div className="text-2xl font-bold font-sans">Geist Sans</div>
            </div>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground mb-1">Body Text Font</div>
              <div className="text-base font-mono">Geist Mono</div>
            </div>
            <Button variant="outline" className="w-full border-dashed">
              <Plus className="w-4 h-4 mr-2" />
              Add Font
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
