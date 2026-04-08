"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface TemplateSearchProps {
  onSearch: (q: string) => void;
  onFilterCategory: (c: string | undefined) => void;
  currentCategory?: string;
}

const CATEGORIES = ["All", "Corporate", "Creative", "Minimalist", "Tech"];

export function TemplateSearch({ onSearch, onFilterCategory, currentCategory }: TemplateSearchProps) {
  const [val, setVal] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(val);
  };

  return (
    <div className="space-y-4 mb-8">
      <form onSubmit={handleSubmit} className="flex gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search templates..." 
            className="pl-9"
            value={val}
            onChange={(e) => setVal(e.target.value)}
          />
        </div>
        <Button type="submit">Search</Button>
      </form>
      
      <div className="flex gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map(cat => (
          <Button
            key={cat}
            variant={currentCategory === cat || (cat === "All" && !currentCategory) ? "default" : "outline"}
            size="sm"
            onClick={() => onFilterCategory(cat === "All" ? undefined : cat)}
            className="rounded-full"
          >
            {cat}
          </Button>
        ))}
      </div>
    </div>
  );
}
