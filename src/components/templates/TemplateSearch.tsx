"use client";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateSearchProps {
  query: string;
  onQueryChange: (q: string) => void;
  categories: { name: string; count: number }[];
  total: number;
  currentCategory?: string;
  onCategoryChange: (c: string | undefined) => void;
}

export function TemplateSearch({ query, onQueryChange, categories, total, currentCategory, onCategoryChange }: TemplateSearchProps) {
  const chips = [{ name: "All", count: total }, ...categories];

  return (
    <div className="mb-8 space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search by name, style or industry…"
          className="h-10 w-full rounded-full border border-input bg-card pl-10 pr-10 text-sm shadow-soft outline-none focus:ring-2 focus:ring-ring/50 [&::-webkit-search-cancel-button]:hidden"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {chips.map(({ name, count }) => {
          const active = name === "All" ? !currentCategory : currentCategory === name;
          return (
            <button
              key={name}
              type="button"
              onClick={() => onCategoryChange(name === "All" ? undefined : name)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {name}
              <span className={cn("text-xs tabular-nums", active ? "text-primary-foreground/70" : "text-muted-foreground/70")}>{count}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
