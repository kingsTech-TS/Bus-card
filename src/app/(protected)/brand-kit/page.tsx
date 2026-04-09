"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PaintBucket, Plus, Type, Trash2, Loader2 } from "lucide-react";
import { useState } from "react";
import { useBrandKits, useCreateBrandKit, useUpdateBrandKit, useDeleteBrandKit } from "@/hooks/useBrandKit";
import { Skeleton } from "@/components/ui/skeleton";
import type { BrandColor } from "@/types";

export default function BrandKitPage() {
  const { data: kits, isLoading } = useBrandKits();
  const { mutate: createKit, isPending: creating } = useCreateBrandKit();
  const { mutate: updateKit, isPending: updating } = useUpdateBrandKit();
  const { mutate: deleteKit, isPending: deleting } = useDeleteBrandKit();

  const [newColor, setNewColor] = useState("#000000");
  const [newFont, setNewFont] = useState("");

  const activeKit = kits?.[0]; // Support multiple in future, but for now just the first one

  const handleAddColor = () => {
    if (!activeKit) {
      createKit({
        name: "My Brand Kit",
        colors: [{ name: "Color", hex: newColor }],
        fonts: [],
      });
      return;
    }

    const updatedColors = [...activeKit.colors, { name: `Color ${activeKit.colors.length + 1}`, hex: newColor }];
    updateKit({ id: activeKit.id, data: { colors: updatedColors } });
  };

  const handleRemoveColor = (index: number) => {
    if (!activeKit) return;
    const updatedColors = activeKit.colors.filter((_, i) => i !== index);
    updateKit({ id: activeKit.id, data: { colors: updatedColors } });
  };

  const handleAddFont = () => {
    if (!newFont) return;
    if (!activeKit) {
      createKit({
        name: "My Brand Kit",
        colors: [],
        fonts: [newFont],
      });
      return;
    }

    const updatedFonts = [...activeKit.fonts, newFont];
    updateKit({ id: activeKit.id, data: { fonts: updatedFonts } });
    setNewFont("");
  };

  const handleRemoveFont = (index: number) => {
    if (!activeKit) return;
    const updatedFonts = activeKit.fonts.filter((_, i) => i !== index);
    updateKit({ id: activeKit.id, data: { fonts: updatedFonts } });
  };

  if (isLoading) {
    return (
      <div className="space-y-8 animate-pulse">
        <PageHeader title="Brand Kit" description="Loading your brand assets..." />
        <div className="grid md:grid-cols-2 gap-8">
          <Skeleton className="h-64 rounded-3xl" />
          <Skeleton className="h-64 rounded-3xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Your Brand Kit" 
        description="Set up your brand colors, fonts, and logos to quickly apply them to any design."
      />

      <div className="grid md:grid-cols-2 gap-8">
        <Card className="rounded-[2rem] border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PaintBucket className="w-5 h-5"/> Brand Colors</CardTitle>
            <CardDescription>Define your primary, secondary, and accent colors.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 mb-6">
              {activeKit?.colors.map((color, idx) => (
                <div key={idx} className="group relative">
                  <div 
                    className="w-16 h-16 rounded-xl shadow-sm border" 
                    style={{ backgroundColor: color.hex }}
                  />
                  <button 
                    onClick={() => handleRemoveColor(idx)}
                    className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  <p className="text-[10px] text-center mt-1 text-muted-foreground font-mono">{color.hex}</p>
                </div>
              ))}
              <div className="flex flex-col items-center gap-2">
                <Input 
                  type="color" 
                  value={newColor} 
                  onChange={(e) => setNewColor(e.target.value)}
                  className="w-16 h-16 p-1 rounded-xl cursor-pointer"
                />
                <Button variant="ghost" size="sm" onClick={handleAddColor} disabled={creating || updating}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Choose a color and click plus to add it.</p>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Type className="w-5 h-5"/> Brand Fonts</CardTitle>
            <CardDescription>Select the typography that represents your brand.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeKit?.fonts.map((font, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 border rounded-2xl bg-muted/30 group">
                <span className="font-medium" style={{ fontFamily: font }}>{font}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => handleRemoveFont(idx)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <div className="flex gap-2">
              <Input 
                placeholder="Font name (e.g. Inter, Roboto)" 
                value={newFont}
                onChange={(e) => setNewFont(e.target.value)}
                className="rounded-xl"
              />
              <Button onClick={handleAddFont} disabled={creating || updating || !newFont} className="rounded-xl">
                {(creating || updating) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
