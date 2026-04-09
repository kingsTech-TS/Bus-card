"use client";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useCard } from "@/hooks/useCards";
import { useAutosave } from "@/hooks/useEditor";
import { useEditorStore } from "@/store/editor.store";
import dynamic from "next/dynamic";
import { EditorToolbar } from "@/components/editor/EditorToolbar";
import { EditorSidebar } from "@/components/editor/EditorSidebar";
import { EditorToolbox } from "@/components/editor/EditorToolbox";
import { Loader2 } from "lucide-react";

// Canvas must be imported dynamically with NO SSR due to window/document requirements of Konva
const EditorCanvas = dynamic(() => import("@/components/editor/EditorCanvas").then(mod => mod.EditorCanvas), { ssr: false });

export default function CardEditorPage() {
  const { id } = useParams() as { id: string };
  const { data: card, isLoading, error } = useCard(id);
  const { loadCard, resetEditor } = useEditorStore();
  
  // Enable autosave debounce hook
  useAutosave();

  // Load card into Zustand on mount
  useEffect(() => {
    if (card) loadCard(card);
    return () => resetEditor();
  }, [card, loadCard, resetEditor]);

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
    <div className="fixed inset-0 top-16 bg-muted/20 overflow-hidden z-40 bg-[radial-gradient(var(--border)_1px,transparent_1px)] bg-[size:24px_24px]">
      
      {/* Central Canvas Container bounded perfectly by the widgets */}
      <div className="absolute top-[90px] bottom-[90px] md:bottom-6 left-4 md:left-[100px] right-4 lg:right-[350px] flex items-center justify-center pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          <EditorCanvas />
        </div>
      </div>

      {/* Floating Toolbox (Bottom on Mobile, Left on Desktop) */}
      <div className="absolute bottom-6 md:top-1/2 left-1/2 md:left-6 -translate-x-1/2 md:translate-x-0 md:-translate-y-1/2 z-50 transition-transform md:hover:scale-105">
        <EditorToolbox />
      </div>

      {/* Floating Top Nav (Top Center) */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 transition-all w-[90%] md:w-auto overflow-x-auto whitespace-nowrap hide-scrollbar">
        <EditorToolbar />
      </div>

      {/* Floating Properties Panel (Right) */}
      <div className="absolute right-6 top-6 bottom-6 z-50 transition-all hidden lg:block">
        <EditorSidebar />
      </div>
    </div>
  );
}
