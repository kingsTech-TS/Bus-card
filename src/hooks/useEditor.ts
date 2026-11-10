"use client";
import { useCallback, useEffect } from "react";
import { useEditorStore, selectSelectedElement } from "@/store/editor.store";
import { useUpdateCard } from "./useCards";
import { serializeDesign } from "@/lib/editor";

/** Saves the current editor state; only marks clean if nothing changed mid-request. */
export function useCardSave() {
  const { mutate, isPending } = useUpdateCard();

  const save = useCallback(() => {
    const s = useEditorStore.getState();
    if (!s.cardId || !s.isDirty) return;
    const revision = s.revision;
    mutate(
      { id: s.cardId, data: { title: s.title, design: serializeDesign(s.design) } },
      { onSuccess: () => useEditorStore.getState().markSaved(revision) }
    );
  }, [mutate]);

  return { save, isSaving: isPending };
}

/** Debounced autosave plus a warning when leaving with unsaved changes. */
export function useAutosave(save: () => void, isSaving: boolean, delay = 1500) {
  const revision = useEditorStore((s) => s.revision);
  const isDirty = useEditorStore((s) => s.isDirty);

  useEffect(() => {
    if (!isDirty || isSaving) return;
    const t = setTimeout(save, delay);
    return () => clearTimeout(t);
  }, [revision, isDirty, isSaving, save, delay]);

  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (useEditorStore.getState().isDirty) e.preventDefault();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);
}

const NUDGE = 1;
const NUDGE_BIG = 10;

/** Workspace keyboard shortcuts. */
export function useEditorShortcuts(save: () => void) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable='true']")) return;

      const s = useEditorStore.getState();
      const mod = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();
      const hasSelection = s.selectedIds.length > 0;
      const single = selectSelectedElement(s);

      const run = (fn: () => void) => {
        e.preventDefault();
        fn();
      };

      if (mod && key === "z") run(() => (e.shiftKey ? s.redo() : s.undo()));
      else if (mod && key === "y") run(s.redo);
      else if (mod && key === "s") run(save);
      else if (mod && key === "c" && hasSelection) run(s.copySelected);
      else if (mod && key === "x" && hasSelection) run(s.cutSelected);
      else if (mod && key === "v") run(s.paste);
      else if (mod && key === "d" && hasSelection) run(s.duplicateSelected);
      else if (mod && key === "a") run(s.selectAll);
      else if (mod && key === "g") run(() => (e.shiftKey ? s.ungroupSelected() : s.groupSelected()));
      else if (mod && (key === "=" || key === "+")) run(() => s.setZoom(s.zoom * 1.2));
      else if (mod && key === "-") run(() => s.setZoom(s.zoom / 1.2));
      else if (mod && key === "0") run(s.requestFit);
      else if (mod && e.shiftKey && key === "f") run(s.swapFaces);
      else if (mod && key === "]" && hasSelection) run(() => s.moveSelection(e.shiftKey ? "top" : "up"));
      else if (mod && key === "[" && hasSelection) run(() => s.moveSelection(e.shiftKey ? "bottom" : "down"));
      else if ((key === "delete" || key === "backspace") && hasSelection) run(s.removeSelected);
      else if (key === "escape") {
        s.select(null);
        s.setTool("select");
      } else if (key === "enter" && single?.type === "text" && !single.isLocked) run(() => s.setEditingText(single.id));
      else if (key.startsWith("arrow") && hasSelection) {
        const step = e.shiftKey ? NUDGE_BIG : NUDGE;
        const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
        const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
        run(() => s.nudgeSelected(dx, dy));
      } else if (!mod && key === "v") s.setTool("select");
      else if (!mod && key === "p") s.setTool("draw");
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);
}
