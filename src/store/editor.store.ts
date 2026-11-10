import { create } from "zustand";
import type { Card, DesignElement, DesignSchema, ElementPatch } from "@/types";
import { DEFAULT_DESIGN, clamp, genId, normalizeDesign } from "@/lib/editor";

export type EditorTool = "select" | "draw";
export type LayerMove = "up" | "down" | "top" | "bottom";

type NewElement = Omit<DesignElement, "id"> & { id?: string };

interface CommitOptions {
  /** Edits sharing a key within a short window collapse into one undo step. */
  coalesce?: string;
  /** Apply without creating an undo step (e.g. derived data like QR images). */
  history?: boolean;
}

interface EditorStore {
  cardId: string | null;
  title: string;
  design: DesignSchema;
  selectedId: string | null;
  editingTextId: string | null;

  isDirty: boolean;
  /** Bumped on every change; used so a save only marks clean what it actually sent. */
  revision: number;
  history: DesignSchema[];
  historyIndex: number;
  lastCommit: { key: string; at: number } | null;

  tool: EditorTool;
  drawColor: string;
  drawWidth: number;

  zoom: number;
  autoFit: boolean;
  fitNonce: number;
  showGuides: boolean;
  showGrid: boolean;

  loadCard: (card: Card) => void;
  setTitle: (title: string) => void;
  setDesign: (design: DesignSchema) => void;
  setBackground: (color: string) => void;
  addElement: (el: NewElement) => string;
  updateElement: (id: string, patch: ElementPatch, opts?: CommitOptions) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveLayer: (id: string, move: LayerMove) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;
  select: (id: string | null) => void;
  setEditingText: (id: string | null) => void;
  setTool: (tool: EditorTool) => void;
  setDrawColor: (color: string) => void;
  setDrawWidth: (width: number) => void;
  setZoom: (zoom: number, auto?: boolean) => void;
  requestFit: () => void;
  toggleGuides: () => void;
  toggleGrid: () => void;
  markSaved: (revision: number) => void;
  undo: () => void;
  redo: () => void;
  resetEditor: () => void;
}

const HISTORY_LIMIT = 100;
const COALESCE_MS = 1000;

const initialState = {
  cardId: null,
  title: "Untitled Card",
  design: DEFAULT_DESIGN,
  selectedId: null,
  editingTextId: null,
  isDirty: false,
  revision: 0,
  history: [DEFAULT_DESIGN],
  historyIndex: 0,
  lastCommit: null,
  tool: "select" as EditorTool,
  drawColor: "#111827",
  drawWidth: 6,
  zoom: 1,
  autoFit: true,
  fitNonce: 0,
  showGuides: true,
  showGrid: false,
};

function withZIndex(elements: DesignElement[]): DesignElement[] {
  return elements.map((el, i) => (el.zIndex === i ? el : { ...el, zIndex: i }));
}

/** Record a new design state, pushing or coalescing an undo step. */
function commit(s: EditorStore, next: DesignSchema, opts: CommitOptions = {}): Partial<EditorStore> {
  const design = { ...next, elements: withZIndex(next.elements) };
  const base = { design, isDirty: true, revision: s.revision + 1 };

  if (opts.history === false) {
    const history = [...s.history];
    history[s.historyIndex] = design;
    return { ...base, history };
  }

  const now = Date.now();
  if (opts.coalesce && s.lastCommit?.key === opts.coalesce && now - s.lastCommit.at < COALESCE_MS) {
    const history = [...s.history.slice(0, s.historyIndex), design];
    return { ...base, history, lastCommit: { key: opts.coalesce, at: now } };
  }

  const history = [...s.history.slice(0, s.historyIndex + 1), design].slice(-HISTORY_LIMIT);
  return {
    ...base,
    history,
    historyIndex: history.length - 1,
    lastCommit: opts.coalesce ? { key: opts.coalesce, at: now } : null,
  };
}

function mapElement(s: EditorStore, id: string, fn: (el: DesignElement) => DesignElement): DesignSchema {
  return { ...s.design, elements: s.design.elements.map((el) => (el.id === id ? fn(el) : el)) };
}

export const useEditorStore = create<EditorStore>()((set, get) => ({
  ...initialState,

  loadCard: (card) => {
    const design = normalizeDesign(card.design);
    set({
      ...initialState,
      cardId: card.id,
      title: card.title,
      design,
      history: [design],
      fitNonce: get().fitNonce + 1,
    });
  },

  setTitle: (title) => set((s) => ({ title, isDirty: true, revision: s.revision + 1 })),

  setDesign: (design) =>
    set((s) => ({ ...commit(s, normalizeDesign(design)), selectedId: null, editingTextId: null })),

  setBackground: (color) =>
    set((s) => commit(s, { ...s.design, background: color }, { coalesce: "background" })),

  addElement: (el) => {
    const id = el.id ?? genId();
    const newEl = {
      rotation: 0,
      opacity: 1,
      isVisible: true,
      isLocked: false,
      ...el,
      id,
    } as DesignElement;
    set((s) => ({
      ...commit(s, { ...s.design, elements: [...s.design.elements, newEl] }),
      selectedId: id,
    }));
    return id;
  },

  updateElement: (id, patch, opts) =>
    set((s) => commit(s, mapElement(s, id, (el) => ({ ...el, ...patch }) as DesignElement), opts)),

  removeElement: (id) =>
    set((s) => ({
      ...commit(s, { ...s.design, elements: s.design.elements.filter((el) => el.id !== id) }),
      selectedId: s.selectedId === id ? null : s.selectedId,
      editingTextId: null,
    })),

  duplicateElement: (id) => {
    const src = get().design.elements.find((el) => el.id === id);
    if (!src) return;
    const offset = 24;
    const copy = { ...src, id: genId(), x: src.x + offset, y: src.y + offset, isLocked: false } as DesignElement;
    if (copy.type === "draw") {
      copy.points = copy.points.map((p) => ({ x: p.x + offset, y: p.y + offset }));
    }
    set((s) => {
      const idx = s.design.elements.findIndex((el) => el.id === id);
      const elements = [...s.design.elements];
      elements.splice(idx + 1, 0, copy);
      return { ...commit(s, { ...s.design, elements }), selectedId: copy.id };
    });
  },

  moveLayer: (id, move) =>
    set((s) => {
      const elements = [...s.design.elements];
      const idx = elements.findIndex((el) => el.id === id);
      if (idx < 0) return s;
      const [el] = elements.splice(idx, 1);
      const target =
        move === "top" ? elements.length
        : move === "bottom" ? 0
        : move === "up" ? Math.min(idx + 1, elements.length)
        : Math.max(idx - 1, 0);
      if (target === idx) return s;
      elements.splice(target, 0, el);
      return commit(s, { ...s.design, elements });
    }),

  toggleVisibility: (id) =>
    set((s) => ({
      ...commit(s, mapElement(s, id, (el) => ({ ...el, isVisible: !(el.isVisible ?? true) }))),
      selectedId: s.selectedId === id ? null : s.selectedId,
    })),

  toggleLock: (id) => set((s) => commit(s, mapElement(s, id, (el) => ({ ...el, isLocked: !el.isLocked })))),

  select: (id) => set((s) => ({ selectedId: id, editingTextId: id === s.editingTextId ? s.editingTextId : null })),
  setEditingText: (id) => set({ editingTextId: id, selectedId: id ?? get().selectedId }),

  setTool: (tool) => set({ tool, selectedId: tool === "draw" ? null : get().selectedId, editingTextId: null }),
  setDrawColor: (drawColor) => set({ drawColor }),
  setDrawWidth: (drawWidth) => set({ drawWidth }),

  setZoom: (zoom, auto = false) => set({ zoom: clamp(zoom, 0.1, 5), autoFit: auto }),
  requestFit: () => set((s) => ({ autoFit: true, fitNonce: s.fitNonce + 1 })),
  toggleGuides: () => set((s) => ({ showGuides: !s.showGuides })),
  toggleGrid: () => set((s) => ({ showGrid: !s.showGrid })),

  markSaved: (revision) => {
    if (get().revision === revision) set({ isDirty: false });
  },

  undo: () => {
    const { history, historyIndex, selectedId, revision } = get();
    if (historyIndex <= 0) return;
    const design = history[historyIndex - 1];
    set({
      design,
      historyIndex: historyIndex - 1,
      isDirty: true,
      revision: revision + 1,
      lastCommit: null,
      editingTextId: null,
      selectedId: design.elements.some((el) => el.id === selectedId) ? selectedId : null,
    });
  },

  redo: () => {
    const { history, historyIndex, selectedId, revision } = get();
    if (historyIndex >= history.length - 1) return;
    const design = history[historyIndex + 1];
    set({
      design,
      historyIndex: historyIndex + 1,
      isDirty: true,
      revision: revision + 1,
      lastCommit: null,
      editingTextId: null,
      selectedId: design.elements.some((el) => el.id === selectedId) ? selectedId : null,
    });
  },

  resetEditor: () => set({ ...initialState, fitNonce: get().fitNonce }),
}));

export const selectSelectedElement = (s: EditorStore) =>
  s.design.elements.find((el) => el.id === s.selectedId) ?? null;
