"use client";
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSuggestDesign, useGenerateTagline } from "@/hooks/useAI";
import { useEditorStore } from "@/store/editor.store";
import { Loader2, Sparkles, Wand2 } from "lucide-react";

export function AIPanel() {
  const { design, loadCard, cardId, title } = useEditorStore();
  const [industry, setIndustry] = useState("");
  const [name, setName] = useState("");
  const [style, setStyle] = useState("");

  const { mutate: suggestDesign, isPending: loadingDesign } = useSuggestDesign();
  const { mutate: suggestTagline, isPending: loadingTagline } = useGenerateTagline();
  const [taglines, setTaglines] = useState<string[]>([]);

  const handleDesign = () => {
    if (!industry || !name) return;
    suggestDesign({ industry, name, style }, {
      onSuccess: (data) => {
        // AI returns a whole new DesignSchema via our API
        loadCard({ id: cardId!, title, design: data.design, owner_id: "", created_at: "", updated_at: "" });
      }
    });
  };

  const handleTagline = () => {
    if (!industry || !name) return;
    suggestTagline({ industry, name }, {
      onSuccess: (data) => setTaglines(data.taglines)
    });
  };

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            AI Context
          </CardTitle>
          <CardDescription>Tell our AI about your business to get tailored suggestions.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <Label className="text-xs">Business Name / Your Name</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Acme Corp" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Industry</Label>
            <Input value={industry} onChange={e => setIndustry(e.target.value)} placeholder="e.g. Tech Startup" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Style Preference</Label>
            <Input value={style} onChange={e => setStyle(e.target.value)} placeholder="e.g. Minimal, Dark, Colorful" />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleDesign} disabled={!industry || !name || loadingDesign}>
        {loadingDesign ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wand2 className="w-4 h-4 mr-2" />}
        Generate Full Design
      </Button>

      <div className="pt-4 border-t">
        <Button variant="secondary" className="w-full mb-3" onClick={handleTagline} disabled={!industry || !name || loadingTagline}>
          {loadingTagline ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Suggest Taglines
        </Button>
        {taglines.length > 0 && (
          <div className="space-y-2 mt-4">
            {taglines.map((t, idx) => (
              <div key={idx} className="text-sm p-3 border rounded-md bg-muted/50 flex justify-between items-start group">
                <p>{t}</p>
                <Button size="sm" variant="ghost" className="h-6 px-2 opacity-0 group-hover:opacity-100" onClick={() => {
                  navigator.clipboard.writeText(t);
                }}>Copy</Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
