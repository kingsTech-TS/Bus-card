"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCard } from "@/hooks/useCards";
import { useAutosave } from "@/hooks/useEditor";
import { useEditorStore } from "@/store/editor.store";
import { useUIStore } from "@/store/ui.store";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Canvas must be imported dynamically with NO SSR due to window/document requirements of Konva
const EditorCanvas = dynamic(() => import("@/components/editor/EditorCanvas").then(mod => mod.EditorCanvas), { ssr: false });

export default function CardEditorPage() {
  const { id } = useParams() as { id: string };
  const { data: card, isLoading, error } = useCard(id);
  const { loadCard, resetEditor } = useEditorStore();
  const { setSidebarOpen } = useUIStore();
  
  // Enable autosave debounce hook
  useAutosave();

  // Load card into Zustand on mount and collapse sidebar
  useEffect(() => {
    if (card) loadCard(card);
    setSidebarOpen(false); // Collapse sidebar for editing space
    
    return () => {
      resetEditor();
    };
  }, [card, loadCard, resetEditor, setSidebarOpen]);

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground animate-pulse">Loading canvas...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Error loading card</h2>
          <p className="text-muted-foreground">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-zinc-950 overflow-hidden">
      <EditorCanvas />
    </div>
  );
}
