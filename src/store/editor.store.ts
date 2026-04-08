import { create } from "zustand";
import type { Card, DesignElement, DesignSchema } from "@/types";
import { nanoid } from "nanoid" ;

// nanoid may not be installed — use a simple uuid fallback
function genId() {
  return Math.random().toString(36).slice(2, 10);
}

const DEFAULT_DESIGN: DesignSchema = {
  width: 1050,
  height: 600,
  dpi: 300,
  background: "#ffffff",
  elements: [],
};

interface EditorStore {
  cardId: string | null;
  title: string;
  design: DesignSchema;
  selectedElementId: string | null;
  isDirty: boolean;
  history: DesignSchema[];
  historyIndex: number;

  // Actions
  loadCard: (card: Card) => void;
  setTitle: (title: string) => void;
  setBackground: (color: string) => void;
  addElement: (el: Omit<DesignElement, "id">) => void;
  updateElement: (id: string, patch: Partial<DesignElement>) => void;
  removeElement: (id: string) => void;
  reorderElement: (id: string, direction: "up" | "down") => void;
  setSelectedElement: (id: string | null) => void;
  markClean: () => void;
  undo: () => void;
  redo: () => void;
  resetEditor: () => void;
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  cardId: null,
  title: "Untitled Card",
  design: DEFAULT_DESIGN,
  selectedElementId: null,
  isDirty: false,
  history: [DEFAULT_DESIGN],
  historyIndex: 0,

  loadCard: (card) => {
    const design = card.design ?? DEFAULT_DESIGN;
    set({
      cardId: card.id,
      title: card.title,
      design,
      selectedElementId: null,
      isDirty: false,
      history: [design],
      historyIndex: 0,
    });
  },

  setTitle: (title) => set({ title, isDirty: true }),

  setBackground: (color) => {
    set((s) => {
      const design = { ...s.design, background: color };
      return pushHistory(s, design);
    });
  },

  addElement: (el) => {
    set((s) => {
      const newEl = { ...el, id: genId() } as DesignElement;
      const design: DesignSchema = {
        ...s.design,
        elements: [...s.design.elements, newEl],
      };
      return { ...pushHistory(s, design), selectedElementId: newEl.id };
    });
  },

  updateElement: (id, patch) => {
    set((s) => {
      const elements = s.design.elements.map((el) =>
        el.id === id ? ({ ...el, ...patch } as DesignElement) : el
      );
      const design = { ...s.design, elements };
      return pushHistory(s, design);
    });
  },

  removeElement: (id) => {
    set((s) => {
      const elements = s.design.elements.filter((el) => el.id !== id);
      const design = { ...s.design, elements };
      return { ...pushHistory(s, design), selectedElementId: null };
    });
  },

  reorderElement: (id, direction) => {
    set((s) => {
      const elements = [...s.design.elements];
      const idx = elements.findIndex((el) => el.id === id);
      if (idx < 0) return s;
      const swapIdx = direction === "up" ? idx + 1 : idx - 1;
      if (swapIdx < 0 || swapIdx >= elements.length) return s;
      [elements[idx], elements[swapIdx]] = [elements[swapIdx], elements[idx]];
      const design = { ...s.design, elements };
      return pushHistory(s, design);
    });
  },

  setSelectedElement: (id) => set({ selectedElementId: id }),

  markClean: () => set({ isDirty: false }),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    set({ design: history[newIndex], historyIndex: newIndex, isDirty: true });
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    set({ design: history[newIndex], historyIndex: newIndex, isDirty: true });
  },

  resetEditor: () =>
    set({
      cardId: null,
      title: "Untitled Card",
      design: DEFAULT_DESIGN,
      selectedElementId: null,
      isDirty: false,
      history: [DEFAULT_DESIGN],
      historyIndex: 0,
    }),
}));

// ── History helper ─────────────────────────────────────────────────────────────
function pushHistory(
  s: EditorStore,
  design: DesignSchema
): Partial<EditorStore> {
  const sliced = s.history.slice(0, s.historyIndex + 1);
  const history = [...sliced, design].slice(-50); // keep last 50
  return {
    design,
    isDirty: true,
    history,
    historyIndex: history.length - 1,
  };
}
