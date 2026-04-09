"use client";
import { useEffect, useRef } from "react";
import { useUpdateCard } from "@/hooks/useCards";
import { useEditorStore } from "@/store/editor.store";

export function useAutosave(delay = 3000) {
  const { cardId, title, design, isDirty, markClean } = useEditorStore();
  const { mutate: updateCard } = useUpdateCard();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!cardId || !isDirty) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      updateCard(
        { id: cardId, data: { title, design } },
        { 
          onSuccess: () => {
            markClean();
          } 
        }
      );
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cardId, title, design, isDirty, delay, updateCard, markClean]);
}
