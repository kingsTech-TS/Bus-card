"use client";
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateGrid } from "@/components/templates/TemplateGrid";
import { TemplateSearch } from "@/components/templates/TemplateSearch";
import { useTemplates, useSearchTemplates } from "@/hooks/useTemplates";

export default function TemplatesPage() {
  const [category, setCategory] = useState<string | undefined>();
  const [query, setQuery] = useState("");

  // Use search route if there's a query, otherwise use standard listing with optional category filter
  const { data: browseData, isLoading: browseLoading } = useTemplates({ category });
  const { data: searchData, isLoading: searchLoading } = useSearchTemplates(query);

  const isSearching = query.length > 0;
  const templates = isSearching ? searchData : browseData;
  const isLoading = isSearching ? searchLoading : browseLoading;

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Business Card Templates" 
        description="Start from scratch is hard. Pick a beautifully designed template and customize it in seconds."
      />

      <TemplateSearch 
        onSearch={setQuery} 
        onFilterCategory={(c) => { setCategory(c); setQuery(""); }} 
        currentCategory={category} 
      />

      <TemplateGrid templates={templates} isLoading={isLoading} />
    </div>
  );
}
