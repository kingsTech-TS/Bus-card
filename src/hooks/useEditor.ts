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
      const selected = selectSelectedElement(s);

      if (mod && key === "z") {
        e.preventDefault();
        if (e.shiftKey) s.redo();
        else s.undo();
      } else if (mod && key === "y") {
        e.preventDefault();
        s.redo();
      } else if (mod && key === "s") {
        e.preventDefault();
        save();
      } else if (mod && key === "d") {
        e.preventDefault();
        if (selected) s.duplicateElement(selected.id);
      } else if (mod && (key === "=" || key === "+")) {
        e.preventDefault();
        s.setZoom(s.zoom * 1.2);
      } else if (mod && key === "-") {
        e.preventDefault();
        s.setZoom(s.zoom / 1.2);
      } else if (mod && key === "0") {
        e.preventDefault();
        s.requestFit();
      } else if (mod && e.shiftKey && key === "f") {
        e.preventDefault();
        s.setSide(s.side === "front" ? "back" : "front");
      } else if (mod && key === "]") {
        e.preventDefault();
        if (selected) s.moveLayer(selected.id, e.shiftKey ? "top" : "up");
      } else if (mod && key === "[") {
        e.preventDefault();
        if (selected) s.moveLayer(selected.id, e.shiftKey ? "bottom" : "down");
      } else if ((key === "delete" || key === "backspace") && selected && !selected.isLocked) {
        e.preventDefault();
        s.removeElement(selected.id);
      } else if (key === "escape") {
        s.select(null);
        s.setTool("select");
      } else if (key === "enter" && selected?.type === "text" && !selected.isLocked) {
        e.preventDefault();
        s.setEditingText(selected.id);
      } else if (key.startsWith("arrow") && selected && !selected.isLocked) {
        e.preventDefault();
        const step = e.shiftKey ? NUDGE_BIG : NUDGE;
        const dx = key === "arrowleft" ? -step : key === "arrowright" ? step : 0;
        const dy = key === "arrowup" ? -step : key === "arrowdown" ? step : 0;
        if (selected.type === "draw") {
          s.updateElement(
            selected.id,
            {
              x: selected.x + dx,
              y: selected.y + dy,
              points: selected.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
            },
            { coalesce: `nudge:${selected.id}` }
          );
        } else {
          s.updateElement(selected.id, { x: selected.x + dx, y: selected.y + dy }, { coalesce: `nudge:${selected.id}` });
        }
      } else if (!mod && key === "v") {
        s.setTool("select");
      } else if (!mod && key === "p") {
        s.setTool("draw");
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [save]);
}
