"use client";
import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCard } from "@/hooks/useCards";
import { useEditorStore } from "@/store/editor.store";
import { EditorWorkspace } from "@/components/editor/EditorWorkspace";

export default function CardEditorPage() {
  const { id } = useParams() as { id: string };
  const { data: card, isLoading, error } = useCard(id);
  const loadedId = useEditorStore((s) => s.cardId);

  // Load into the editor once per card. Later refetches (e.g. after an autosave)
  // must not reset the canvas, selection or undo history.
  useEffect(() => {
    if (card && useEditorStore.getState().cardId !== card.id) {
      useEditorStore.getState().loadCard(card);
    }
  }, [card]);

  useEffect(() => () => useEditorStore.getState().resetEditor(), []);

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center p-8">
        <div className="text-center">
          <h2 className="mb-2 text-xl font-bold">Couldn&apos;t load this card</h2>
          <p className="mb-4 text-muted-foreground">{(error as Error).message}</p>
          <Link href="/cards" className="text-sm font-medium text-primary hover:underline">
            Back to my cards
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading || !card || loadedId !== card.id) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Loading editor…</p>
      </div>
    );
  }

  return <EditorWorkspace />;
}
