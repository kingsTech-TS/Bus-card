"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft, Check, CloudOff, Grid3X3, Keyboard, Loader2, Maximize, Minus, MousePointer2, Pencil, Plus, Redo2, Ruler, Save, Sparkles, Undo2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { serializeDesign } from "@/lib/editor";
import { useDesignFonts } from "@/hooks/useFonts";
import { useEditorStore } from "@/store/editor.store";
import { useAuthStore } from "@/store/auth.store";
import { useAutosave, useCardSave, useEditorShortcuts } from "@/hooks/useEditor";
import { templateService } from "@/services/template.service";
import { ExportModal } from "./ExportModal";
import { LeftPanel } from "./LeftPanel";
import { RightPanel } from "./RightPanel";
import { IconToggle } from "./fields";

// Konva needs `window`, so the stage is client-only.
const EditorStage = dynamic(() => import("./EditorStage"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 flex items-center justify-center">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

function SaveStatus({ isSaving }: { isSaving: boolean }) {
  const isDirty = useEditorStore((s) => s.isDirty);
  if (isSaving) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" /> Saving…
      </span>
    );
  }
  if (isDirty) {
    return (
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CloudOff className="size-3.5" /> Unsaved changes
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Check className="size-3.5 text-emerald-500" /> All changes saved
    </span>
  );
}

function Header({ save, isSaving }: { save: () => void; isSaving: boolean }) {
  const title = useEditorStore((s) => s.title);
  const cardId = useEditorStore((s) => s.cardId);
  const isDirty = useEditorStore((s) => s.isDirty);
  const canUndo = useEditorStore((s) => s.historyIndex > 0);
  const canRedo = useEditorStore((s) => s.historyIndex < s.history.length - 1);
  const { setTitle, undo, redo } = useEditorStore.getState();
  const isAdmin = useAuthStore((s) => s.user?.role === "admin");
  const qc = useQueryClient();

  const { mutate: createTemplate, isPending: savingTemplate } = useMutation({
    mutationFn: () => {
      const s = useEditorStore.getState();
      return templateService.createTemplate({ title: s.title, design: serializeDesign(s.design), category: "General" });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Saved as a public template");
    },
    onError: (err: Error) => toast.error(err.message),
  });

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card px-3">
      <Link
        href="/cards"
        className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label="Back to cards"
        title="Back to cards"
      >
        <ChevronLeft className="size-5" />
      </Link>

      <div className="flex min-w-0 items-center gap-3">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-56 min-w-0 truncate rounded-lg border border-transparent bg-transparent px-2 py-1 text-sm font-semibold outline-none hover:border-border focus:border-input focus:ring-2 focus:ring-ring/50"
          aria-label="Card title"
        />
        <div className="hidden md:block">
          <SaveStatus isSaving={isSaving} />
        </div>
      </div>

      <div className="mx-auto flex items-center gap-0.5">
        <IconToggle title="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}><Undo2 className="size-4" /></IconToggle>
        <IconToggle title="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}><Redo2 className="size-4" /></IconToggle>
      </div>

      <div className="flex items-center gap-2">
        {isAdmin && (
          <Button variant="ghost" size="sm" onClick={() => createTemplate()} disabled={savingTemplate}>
            {savingTemplate ? <Loader2 className="animate-spin" /> : <Sparkles />}
            <span className="hidden lg:inline">Save as template</span>
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={save} disabled={!isDirty || isSaving || !cardId}>
          <Save />
          Save
        </Button>
        {cardId && <ExportModal cardId={cardId} />}
      </div>
    </header>
  );
}

const SHORTCUTS: [string, string][] = [
  ["Undo / Redo", "Ctrl Z / Ctrl Shift Z"],
  ["Duplicate", "Ctrl D"],
  ["Delete", "Del"],
  ["Nudge", "Arrows (+Shift ×10)"],
  ["Edit text", "Double-click / Enter"],
  ["Zoom", "Ctrl + scroll, Ctrl +/−"],
  ["Fit to screen", "Ctrl 0"],
  ["Pan", "Scroll, or hold Space + drag"],
  ["Select / Draw", "V / P"],
];

function CanvasControls() {
  const zoom = useEditorStore((s) => s.zoom);
  const tool = useEditorStore((s) => s.tool);
  const showGuides = useEditorStore((s) => s.showGuides);
  const showGrid = useEditorStore((s) => s.showGrid);
  const { setZoom, requestFit, setTool, toggleGuides, toggleGrid } = useEditorStore.getState();

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
      <div className="pointer-events-auto flex items-center gap-0.5 rounded-xl border border-border bg-card/95 p-1 shadow-lg backdrop-blur">
        <IconToggle title="Select (V)" active={tool === "select"} onClick={() => setTool("select")}><MousePointer2 className="size-4" /></IconToggle>
        <IconToggle title="Draw (P)" active={tool === "draw"} onClick={() => setTool("draw")}><Pencil className="size-4" /></IconToggle>
        <div className="mx-1 h-5 w-px bg-border" />
        <IconToggle title="Zoom out (Ctrl −)" onClick={() => setZoom(zoom / 1.2)}><Minus className="size-4" /></IconToggle>
        <span className="w-12 text-center text-xs font-medium tabular-nums">{Math.round(zoom * 100)}%</span>
        <IconToggle title="Zoom in (Ctrl +)" onClick={() => setZoom(zoom * 1.2)}><Plus className="size-4" /></IconToggle>
        <IconToggle title="Fit to screen (Ctrl 0)" onClick={requestFit}><Maximize className="size-4" /></IconToggle>
        <div className="mx-1 h-5 w-px bg-border" />
        <IconToggle title="Guides" active={showGuides} onClick={toggleGuides}><Ruler className="size-4" /></IconToggle>
        <IconToggle title="Grid" active={showGrid} onClick={toggleGrid}><Grid3X3 className="size-4" /></IconToggle>
        <div className="group relative">
          <IconToggle title="Keyboard shortcuts" onClick={() => {}}><Keyboard className="size-4" /></IconToggle>
          <div className="invisible absolute bottom-full right-0 mb-2 w-72 rounded-xl border border-border bg-popover p-3 text-xs text-popover-foreground opacity-0 shadow-lg transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
            <p className="mb-2 font-semibold">Keyboard shortcuts</p>
            <dl className="space-y-1">
              {SHORTCUTS.map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="text-right font-mono">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export function EditorWorkspace() {
  const { save, isSaving } = useCardSave();
  const tool = useEditorStore((s) => s.tool);
  useAutosave(save, isSaving);
  useEditorShortcuts(save);

  useDesignFonts();

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-background text-foreground">
      <Header save={save} isSaving={isSaving} />
      <div className="flex min-h-0 flex-1">
        <LeftPanel />
        <main
          className={cn(
            "relative min-w-0 flex-1 overflow-hidden bg-muted/60",
            "bg-[radial-gradient(circle,var(--color-border)_1px,transparent_1px)] bg-size-[20px_20px]"
          )}
        >
          <EditorStage />
          {tool === "draw" && (
            <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center">
              <span className="rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground shadow">
                Drawing mode — press Esc to stop
              </span>
            </div>
          )}
          <CanvasControls />
        </main>
        <RightPanel />
      </div>
    </div>
  );
}
