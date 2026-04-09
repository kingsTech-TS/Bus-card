"use client";
import { useEditorStore } from "@/store/editor.store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Undo2, Redo2, Download, Save, Sparkles } from "lucide-react";
import { useUpdateCard } from "@/hooks/useCards";
import { ExportModal } from "./ExportModal";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { templateService } from "@/services/template.service";
import { toast } from "sonner";


export function EditorToolbar() {
  const { cardId, title, design, setTitle, undo, redo, historyIndex, history, isDirty, markClean } = useEditorStore();
  const { mutate: updateCard, isPending } = useUpdateCard();
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const isAdmin = user?.role === "admin";

  const { mutate: createTemplate, isPending: isCreatingTemplate } = useMutation({
     mutationFn: () => templateService.createTemplate({
       title: title,
       design: design,
       category: "General"
     }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Design saved as a public template!");
    },
    onError: (err: Error) => toast.error(err.message)
  });

  const handleManualSave = () => {
    if (!cardId) return;
    updateCard(
      { id: cardId, data: { title, design } },
      { onSuccess: () => markClean() }
    );
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="flex flex-wrap items-center justify-between h-14 bg-card/95 backdrop-blur-md px-6 rounded-full shadow-soft border-0 shrink-0 gap-6">
      <div className="flex items-center gap-4">
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)}
          className="w-48 font-semibold border-transparent hover:border-input focus-visible:ring-1 bg-transparent h-8"
        />
        {isDirty && <span className="text-xs text-muted-foreground flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Unsaved</span>}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={undo} disabled={!canUndo} title="Undo">
          <Undo2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={redo} disabled={!canRedo} title="Redo">
          <Redo2 className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border mx-2" />

        <Button variant="secondary" size="sm" onClick={handleManualSave} disabled={!isDirty || isPending || !cardId}>
          <Save className="w-4 h-4 mr-2" />
          {isPending ? "Saving..." : "Save"}
        </Button>

        {isAdmin && (
          <Button variant="outline" size="sm" onClick={() => createTemplate()} disabled={isCreatingTemplate}>
            <Sparkles className="w-4 h-4 mr-2" />
            {isCreatingTemplate ? "Saving..." : "Save as Template"}
          </Button>
        )}

        <Button variant="secondary" size="sm" className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 hover:text-blue-600 border-none">
          <Sparkles className="w-4 h-4 mr-2" />
          AI Suggest
        </Button>

        <ExportModal cardId={cardId!} />
      </div>
    </div>
  );
}
