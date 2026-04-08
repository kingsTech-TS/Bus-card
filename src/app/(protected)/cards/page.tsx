"use client";
import { PageHeader } from "@/components/layout/PageHeader";
import { CardGrid } from "@/components/cards/CardGrid";
import { CreateCardModal } from "@/components/cards/CreateCardModal";
import { useCards } from "@/hooks/useCards";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState } from "react";

export default function CardsPage() {
  const { data: cards, isLoading } = useCards();
  const [search, setSearch] = useState("");

  const filteredCards = cards?.filter(c => 
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="My Cards" 
        description="Manage, edit, and export your business card designs."
      >
        <CreateCardModal />
      </PageHeader>

      <div className="mb-6 relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search cards..." 
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <CardGrid cards={filteredCards} isLoading={isLoading} />
    </div>
  );
}
