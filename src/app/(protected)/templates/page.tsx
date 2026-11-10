"use client";
import { useMemo, useState } from "react";
import { CopyPlus, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { TemplateSearch } from "@/components/templates/TemplateSearch";
import { DesignPreview } from "@/components/design/DesignPreview";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useTemplates } from "@/hooks/useTemplates";
import { useCreateCard } from "@/hooks/useCards";
import { useDesignFonts } from "@/hooks/useFonts";
import { BUILTIN_TEMPLATES } from "@/lib/templates";
import { normalizeDesign, serializeDesign } from "@/lib/editor";
import type { Template } from "@/types";

export default function TemplatesPage() {
  useDesignFonts();
  const [category, setCategory] = useState<string | undefined>();
  const [query, setQuery] = useState("");
  const [previewing, setPreviewing] = useState<Template | null>(null);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  // Built-in templates always show; templates saved by admins on the backend are added on top.
  const { data: custom, isLoading } = useTemplates();
  const { mutate: createCard } = useCreateCard();

  const all = useMemo(() => [...(custom ?? []), ...BUILTIN_TEMPLATES], [custom]);

  const categories = useMemo(() => {
    const counts = new Map<string, number>();
    for (const t of all) {
      const c = t.category || "Other";
      counts.set(c, (counts.get(c) ?? 0) + 1);
    }
    return [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  }, [all]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((t) => {
      if (category && (t.category || "Other") !== category) return false;
      if (!q) return true;
      return [t.title, t.category, ...(t.tags ?? [])].some((s) => s?.toLowerCase().includes(q));
    });
  }, [all, category, query]);

  const applyTemplate = (t: Template) => {
    setCreatingId(t.id);
    createCard(
      { title: t.title, design: serializeDesign(normalizeDesign(t.design)) },
      { onSettled: () => setCreatingId(null) }
    );
  };

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader
        title="Templates"
        description="Pick a professionally designed card and make it yours in the editor."
      />

      <TemplateSearch
        query={query}
        onQueryChange={setQuery}
        categories={categories}
        total={all.length}
        currentCategory={category}
        onCategoryChange={setCategory}
      />

      <p className="mb-4 text-sm text-muted-foreground">
        {filtered.length} {filtered.length === 1 ? "template" : "templates"}
        {category && <> in <span className="font-medium text-foreground">{category}</span></>}
        {query.trim() && <> matching “{query.trim()}”</>}
      </p>

      <TemplateGrid
        templates={filtered}
        isLoading={isLoading}
        onPreview={setPreviewing}
        onUse={applyTemplate}
        creatingId={creatingId}
        onClearFilters={() => {
          setQuery("");
          setCategory(undefined);
        }}
      />

      <Dialog open={!!previewing} onOpenChange={(open) => !open && setPreviewing(null)}>
        <DialogContent className="sm:max-w-3xl">
          {previewing && (
            <>
              <DialogHeader>
                <DialogTitle>{previewing.title}</DialogTitle>
                <DialogDescription>{previewing.category ?? "Template"}</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 sm:grid-cols-2">
                {(["front", "back"] as const).map((side) => (
                  <figure key={side}>
                    <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                      <DesignPreview design={previewing.design} side={side} />
                    </div>
                    <figcaption className="mt-2 text-center text-xs font-medium text-muted-foreground">
                      {side === "front" ? "Front" : "Back"}
                    </figcaption>
                  </figure>
                ))}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-1.5">
                  {previewing.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
                <Button onClick={() => applyTemplate(previewing)} disabled={creatingId === previewing.id}>
                  {creatingId === previewing.id ? <Loader2 className="animate-spin" /> : <CopyPlus />}
                  Use this template
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
