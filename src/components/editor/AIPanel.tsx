"use client";
import { useState } from "react";
import { Loader2, Plus, Wand2, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSuggestDesign, useGenerateTagline } from "@/hooks/useAI";
import { useEditorStore } from "@/store/editor.store";
import { toast } from "sonner";
import type { DesignElement } from "@/types";

export function AIPanel() {
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [style, setStyle] = useState("");
  const [taglines, setTaglines] = useState<string[]>([]);

  const { mutate: suggestDesign, isPending: loadingDesign } = useSuggestDesign();
  const { mutate: suggestTagline, isPending: loadingTagline } = useGenerateTagline();
  const ready = !!name.trim() && !!industry.trim();

  const handleDesign = () => {
    const hasContent = useEditorStore.getState().design.elements.length > 0;
    if (hasContent && !confirm("Replace the current design with an AI suggestion? You can undo this.")) return;
    suggestDesign(
      { industry, name, style: style || "modern" },
      {
        onSuccess: (data) => {
          useEditorStore.getState().setDesign(data.design);
          toast.success(data.description ? `Applied “${data.description}”` : "AI design applied");
        },
      }
    );
  };

  const handleTagline = () =>
    suggestTagline(
      { name, industry, description: style },
      { onSuccess: (data) => setTaglines((prev) => [data.tagline, ...prev.filter((t) => t !== data.tagline)].slice(0, 5)) }
    );

  const addTagline = (text: string) => {
    const { design, addElement } = useEditorStore.getState();
    const width = Math.min(700, design.width - 100);
    addElement({
      type: "text",
      content: text,
      fontSize: 30,
      fontFamily: "Inter",
      fontWeight: "italic",
      fill: "#374151",
      textAlign: "center",
      width,
      x: Math.round((design.width - width) / 2),
      y: Math.round(design.height * 0.7),
    } as Omit<DesignElement, "id">);
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs">Business or your name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Acme Studio" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Industry</Label>
          <Input value={industry} onChange={(e) => setIndustry(e.target.value)} placeholder="e.g. Architecture" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Style</Label>
          <Input value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g. Minimal, bold, playful" />
        </div>
      </div>

      <div className="grid gap-2">
        <Button className="w-full" onClick={handleDesign} disabled={!ready || loadingDesign}>
          {loadingDesign ? <Loader2 className="animate-spin" /> : <Wand2 />}
          Generate design
        </Button>
        <Button variant="outline" className="w-full" onClick={handleTagline} disabled={!ready || loadingTagline}>
          {loadingTagline ? <Loader2 className="animate-spin" /> : <Quote />}
          Suggest a tagline
        </Button>
      </div>

      {taglines.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">Taglines</h4>
          {taglines.map((t) => (
            <div key={t} className="flex items-start gap-2 rounded-xl border border-border bg-background p-3 text-sm">
              <p className="flex-1">{t}</p>
              <button
                type="button"
                onClick={() => addTagline(t)}
                title="Add to card"
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
