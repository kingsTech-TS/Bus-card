"use client";
import type { Template } from "@/types";
import { Skeleton } from "@/components/ui/skeleton";
import { TemplateCard } from "./TemplateCard";

interface TemplateGridProps {
  templates: Template[];
  isLoading?: boolean;
  onPreview: (t: Template) => void;
  onUse: (t: Template) => void;
  creatingId: string | null;
  onClearFilters?: () => void;
}

const GRID = "grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4";

export function TemplateGrid({ templates, isLoading, onPreview, onUse, creatingId, onClearFilters }: TemplateGridProps) {
  if (isLoading && templates.length === 0) {
    return (
      <div className={GRID}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[1.75] w-full rounded-2xl" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-20 text-center">
        <h3 className="mb-2 text-lg font-semibold">No templates match</h3>
        <p className="mb-4 max-w-sm text-sm text-muted-foreground">Try a different search term or category.</p>
        {onClearFilters && (
          <button type="button" onClick={onClearFilters} className="text-sm font-medium text-primary hover:underline">
            Clear filters
          </button>
        )}
      </div>
    );
  }

  return (
    <div className={GRID}>
      {templates.map((t) => (
        <TemplateCard key={t.id} template={t} onPreview={onPreview} onUse={onUse} isCreating={creatingId === t.id} />
      ))}
    </div>
  );
}
