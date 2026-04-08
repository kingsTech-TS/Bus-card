"use client";
import { useEffect, useRef } from "react";
import { useEditorStore } from "@/store/editor.store";
import { useUpdateCard } from "./useCards";

/** Auto-saves the card 2s after the last edit */
export function useAutosave() {
  const { cardId, title, design, isDirty, markClean } = useEditorStore();
  const { mutate: updateCard } = useUpdateCard();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isDirty || !cardId) return;

    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      updateCard({ id: cardId, data: { title, design } }, {
        onSuccess: () => markClean(),
      });
    }, 2000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isDirty, cardId, title, design, updateCard, markClean]);
}
