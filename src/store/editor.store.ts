import { create } from "zustand";
import type { Card, CardSide, CardSideDesign, DesignElement, DesignSchema, ElementPatch } from "@/types";
import { DEFAULT_DESIGN, clamp, genId, getFaceOrder, getSide, normalizeDesign, scaleElement, selectionBox, setSide as patchSide, swapFaces } from "@/lib/editor";

export type EditorTool = "select" | "draw";
export type LayerMove = "up" | "down" | "top" | "bottom";

type NewElement = Omit<DesignElement, "id"> & { id?: string };

interface CommitOptions {
  /** Edits sharing a key within a short window collapse into one undo step. */
  coalesce?: string;
  /** Apply without creating an undo step (e.g. derived data like QR images). */
  history?: boolean;
}

interface SelectOptions {
  /** Face the element lives on (defaults to wherever the id is found). */
  side?: CardSide;
  /** Shift/Ctrl-click: toggle in or out of the current selection. */
  additive?: boolean;
}

interface Clipboard {
  elements: DesignElement[];
  cardId: string | null;
  side: CardSide;
}

interface EditorStore {
  cardId: string | null;
  title: string;
  design: DesignSchema;
  /** The face currently being edited (the last one clicked). */
  side: CardSide;
  /** Selected element ids, all on `side`. Selecting a grouped element selects its whole group. */
  selectedIds: string[];
  editingTextId: string | null;
  clipboard: Clipboard | null;
  pasteCount: number;

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
  /** Focus a face for editing. */
  setSide: (side: CardSide) => void;
  /** Label the face at a workspace position as front or back (swaps the faces if needed). */
  setFaceLabel: (index: number, label: CardSide) => void;
  swapFaces: () => void;
  /** Replace the active face's content (e.g. with an AI suggestion). */
  replaceSide: (content: CardSideDesign) => void;
  setBackground: (color: string) => void;

  addElement: (el: NewElement) => string;
  updateElement: (id: string, patch: ElementPatch, opts?: CommitOptions) => void;
  updateElements: (patches: { id: string; patch: ElementPatch }[], opts?: CommitOptions) => void;
  removeElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  moveLayer: (id: string, move: LayerMove) => void;
  toggleVisibility: (id: string) => void;
  toggleLock: (id: string) => void;

  select: (id: string | null, opts?: SelectOptions) => void;
  selectMany: (ids: string[], side: CardSide, additive?: boolean) => void;
  selectAll: () => void;
  removeSelected: () => void;
  duplicateSelected: () => void;
  copySelected: () => void;
  cutSelected: () => void;
  paste: () => void;
  groupSelected: () => void;
  ungroupSelected: () => void;
  moveSelection: (move: LayerMove) => void;
  nudgeSelected: (dx: number, dy: number) => void;
  /** Move the selection so its top-left corner lands at (x, y). */
  moveSelectionTo: (x: number, y: number) => void;
  /** Resize the whole selection proportionally, keeping its top-left corner fixed. */
  scaleSelection: (factor: number) => void;
  setSelectionLocked: (locked: boolean) => void;

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
const PASTE_OFFSET = 24;
const CLIPBOARD_KEY = "buscard:clipboard";
const SIDES: CardSide[] = ["front", "back"];

const initialState = {
  cardId: null,
  title: "Untitled Card",
  design: DEFAULT_DESIGN,
  side: "front" as CardSide,
  selectedIds: [] as string[],
  editingTextId: null,
  clipboard: null,
  pasteCount: 0,
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function withZIndex(elements: DesignElement[]): DesignElement[] {
  return elements.map((el, i) => (el.zIndex === i ? el : { ...el, zIndex: i }));
}

/** Record a new design state, pushing or coalescing an undo step. */
function commit(s: EditorStore, next: DesignSchema, opts: CommitOptions = {}): Partial<EditorStore> {
  const back = getSide(next, "back");
  const design = { ...next, elements: withZIndex(next.elements), back: { ...back, elements: withZIndex(back.elements) } };
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

/** Elements of the face currently being edited. */
const activeElements = (s: Pick<EditorStore, "design" | "side">) => getSide(s.design, s.side).elements;

/** Design with the active face's elements replaced. */
const withElements = (s: EditorStore, elements: DesignElement[]) => patchSide(s.design, s.side, { elements });

function sideOfId(design: DesignSchema, id: string): CardSide | null {
  return SIDES.find((side) => getSide(design, side).elements.some((el) => el.id === id)) ?? null;
}

/** Apply `fn` to the given ids on whichever face they live. */
function mapIds(design: DesignSchema, ids: Set<string>, fn: (el: DesignElement) => DesignElement): DesignSchema {
  let d = design;
  for (const side of SIDES) {
    const els = getSide(d, side).elements;
    if (els.some((el) => ids.has(el.id))) {
      d = patchSide(d, side, { elements: els.map((el) => (ids.has(el.id) ? fn(el) : el)) });
    }
  }
  return d;
}

function removeIds(design: DesignSchema, ids: Set<string>): DesignSchema {
  let d = design;
  for (const side of SIDES) {
    const els = getSide(d, side).elements;
    if (els.some((el) => ids.has(el.id))) d = patchSide(d, side, { elements: els.filter((el) => !ids.has(el.id)) });
  }
  return d;
}

/** Expand ids to include every member of their groups. */
function expandGroups(elements: DesignElement[], ids: string[]): string[] {
  const idSet = new Set(ids);
  const groups = new Set(elements.filter((el) => idSet.has(el.id) && el.groupId).map((el) => el.groupId));
  return elements.filter((el) => idSet.has(el.id) || (el.groupId && groups.has(el.groupId))).map((el) => el.id);
}

/** Selected elements in stacking order. */
function selectedElements(s: Pick<EditorStore, "design" | "side" | "selectedIds">): DesignElement[] {
  const ids = new Set(s.selectedIds);
  return activeElements(s).filter((el) => ids.has(el.id));
}

/** Deep-copy elements with fresh ids (groups are re-created, not shared). */
function cloneElements(elements: DesignElement[], offset: number): DesignElement[] {
  const groupMap = new Map<string, string>();
  return elements.map((el) => {
    const copy = JSON.parse(JSON.stringify(el)) as DesignElement;
    copy.id = genId();
    copy.isLocked = false;
    if (el.groupId) {
      if (!groupMap.has(el.groupId)) groupMap.set(el.groupId, genId());
      copy.groupId = groupMap.get(el.groupId)!;
    }
    copy.x += offset;
    copy.y += offset;
    if (copy.type === "draw") copy.points = copy.points.map((p) => ({ x: p.x + offset, y: p.y + offset }));
    return copy;
  });
}

/** Move a set of elements within the stack, keeping their relative order. */
function moveIds(elements: DesignElement[], ids: Set<string>, move: LayerMove): DesignElement[] {
  const picked = elements.filter((el) => ids.has(el.id));
  if (!picked.length) return elements;
  const rest = elements.filter((el) => !ids.has(el.id));
  const first = elements.findIndex((el) => ids.has(el.id));
  const last = elements.length - 1 - [...elements].reverse().findIndex((el) => ids.has(el.id));

  let at: number;
  if (move === "top") at = rest.length;
  else if (move === "bottom") at = 0;
  else if (move === "up") {
    const above = elements.slice(last + 1).find((el) => !ids.has(el.id));
    at = above ? rest.indexOf(above) + 1 : rest.length;
  } else {
    const below = elements.slice(0, first).reverse().find((el) => !ids.has(el.id));
    at = below ? rest.indexOf(below) : 0;
  }
  return [...rest.slice(0, at), ...picked, ...rest.slice(at)];
}

function keepExisting(design: DesignSchema, side: CardSide, ids: string[]) {
  const present = new Set(getSide(design, side).elements.map((el) => el.id));
  return ids.filter((id) => present.has(id));
}

function readStoredClipboard(): Clipboard | null {
  try {
    const raw = localStorage.getItem(CLIPBOARD_KEY);
    return raw ? (JSON.parse(raw) as Clipboard) : null;
  } catch {
    return null;
  }
}

function storeClipboard(clip: Clipboard) {
  try {
    localStorage.setItem(CLIPBOARD_KEY, JSON.stringify(clip));
  } catch {
    // Storage may be unavailable (private mode); the in-memory clipboard still works.
  }
}

// ─── Store ──────────────────────────────────────────────────────────────────

export const useEditorStore = create<EditorStore>()((set, get) => ({
  ...initialState,

  loadCard: (card) => {
    const design = normalizeDesign(card.design);
    set({
      ...initialState,
      clipboard: get().clipboard,
      cardId: card.id,
      title: card.title,
      design,
      history: [design],
      fitNonce: get().fitNonce + 1,
    });
  },

  setTitle: (title) => set((s) => ({ title, isDirty: true, revision: s.revision + 1 })),

  setDesign: (design) => set((s) => ({ ...commit(s, normalizeDesign(design)), selectedIds: [], editingTextId: null })),

  setSide: (side) =>
    set((s) => (s.side === side ? s : { side, selectedIds: [], editingTextId: null })),

  setFaceLabel: (index, label) => {
    if (getFaceOrder(get().design)[index] === label) return;
    get().swapFaces();
  },

  // Content stays in place on screen; only which face counts as "front" changes.
  swapFaces: () =>
    set((s) => ({
      ...commit(s, swapFaces(s.design)),
      side: s.side === "front" ? "back" : "front",
      editingTextId: null,
    })),

  replaceSide: (content) =>
    set((s) => {
      const normalized = getSide(normalizeDesign({ elements: content.elements, background: content.background }), "front");
      return { ...commit(s, patchSide(s.design, s.side, normalized)), selectedIds: [], editingTextId: null };
    }),

  setBackground: (color) =>
    set((s) => commit(s, patchSide(s.design, s.side, { background: color }), { coalesce: `background:${s.side}` })),

  addElement: (el) => {
    const id = el.id ?? genId();
    const newEl = { rotation: 0, opacity: 1, isVisible: true, isLocked: false, ...el, id } as DesignElement;
    set((s) => ({ ...commit(s, withElements(s, [...activeElements(s), newEl])), selectedIds: [id], editingTextId: null }));
    return id;
  },

  updateElement: (id, patch, opts) =>
    set((s) => commit(s, mapIds(s.design, new Set([id]), (el) => ({ ...el, ...patch }) as DesignElement), opts)),

  updateElements: (patches, opts) =>
    set((s) => {
      if (!patches.length) return s;
      const byId = new Map(patches.map((p) => [p.id, p.patch]));
      return commit(s, mapIds(s.design, new Set(byId.keys()), (el) => ({ ...el, ...byId.get(el.id) }) as DesignElement), opts);
    }),

  removeElement: (id) =>
    set((s) => ({
      ...commit(s, removeIds(s.design, new Set([id]))),
      selectedIds: s.selectedIds.filter((x) => x !== id),
      editingTextId: null,
    })),

  duplicateElement: (id) => {
    get().select(id);
    get().duplicateSelected();
  },

  moveLayer: (id, move) =>
    set((s) => {
      const side = sideOfId(s.design, id) ?? s.side;
      const els = getSide(s.design, side).elements;
      const ids = new Set(expandGroups(els, [id]));
      return commit(s, patchSide(s.design, side, { elements: moveIds(els, ids, move) }));
    }),

  toggleVisibility: (id) =>
    set((s) => ({
      ...commit(s, mapIds(s.design, new Set([id]), (el) => ({ ...el, isVisible: !(el.isVisible ?? true) }))),
      selectedIds: s.selectedIds.filter((x) => x !== id),
    })),

  toggleLock: (id) => set((s) => commit(s, mapIds(s.design, new Set([id]), (el) => ({ ...el, isLocked: !el.isLocked })))),

  // ── Selection ──
  select: (id, opts = {}) =>
    set((s) => {
      const side = opts.side ?? (id ? sideOfId(s.design, id) : null) ?? s.side;
      if (!id) return { side, selectedIds: [], editingTextId: null };
      const members = expandGroups(getSide(s.design, side).elements, [id]);
      let selectedIds = members;
      if (opts.additive && side === s.side) {
        const allIn = members.every((m) => s.selectedIds.includes(m));
        selectedIds = allIn
          ? s.selectedIds.filter((x) => !members.includes(x))
          : Array.from(new Set([...s.selectedIds, ...members]));
      }
      return {
        side,
        selectedIds,
        editingTextId: s.editingTextId && selectedIds.includes(s.editingTextId) ? s.editingTextId : null,
      };
    }),

  selectMany: (ids, side, additive = false) =>
    set((s) => {
      const expanded = expandGroups(getSide(s.design, side).elements, ids);
      const base = additive && side === s.side ? s.selectedIds : [];
      return { side, selectedIds: Array.from(new Set([...base, ...expanded])), editingTextId: null };
    }),

  selectAll: () =>
    set((s) => ({ selectedIds: activeElements(s).filter((el) => el.isVisible !== false).map((el) => el.id), editingTextId: null })),

  removeSelected: () =>
    set((s) => {
      const ids = new Set(selectedElements(s).filter((el) => !el.isLocked).map((el) => el.id));
      if (!ids.size) return s;
      return { ...commit(s, removeIds(s.design, ids)), selectedIds: s.selectedIds.filter((id) => !ids.has(id)), editingTextId: null };
    }),

  duplicateSelected: () =>
    set((s) => {
      const picked = selectedElements(s);
      if (!picked.length) return s;
      const copies = cloneElements(picked, PASTE_OFFSET);
      return { ...commit(s, withElements(s, [...activeElements(s), ...copies])), selectedIds: copies.map((c) => c.id) };
    }),

  copySelected: () => {
    const s = get();
    const picked = selectedElements(s);
    if (!picked.length) return;
    const clip: Clipboard = { elements: JSON.parse(JSON.stringify(picked)), cardId: s.cardId, side: s.side };
    storeClipboard(clip);
    set({ clipboard: clip, pasteCount: 0 });
  },

  cutSelected: () => {
    get().copySelected();
    get().removeSelected();
    // Pasting a cut should land exactly where it was.
    set({ pasteCount: -1 });
  },

  paste: () =>
    set((s) => {
      const clip = s.clipboard ?? readStoredClipboard();
      if (!clip?.elements.length) return s;
      const sameSpot = clip.cardId === s.cardId && clip.side === s.side;
      const count = s.pasteCount + 1;
      const copies = cloneElements(clip.elements, sameSpot ? PASTE_OFFSET * count : 0);
      return {
        ...commit(s, withElements(s, [...activeElements(s), ...copies])),
        clipboard: clip,
        pasteCount: count,
        selectedIds: copies.map((c) => c.id),
        editingTextId: null,
      };
    }),

  groupSelected: () =>
    set((s) => {
      const els = activeElements(s);
      const ids = new Set(s.selectedIds);
      if (ids.size < 2) return s;
      const groupId = genId();
      const members = els.filter((el) => ids.has(el.id)).map((el) => ({ ...el, groupId }) as DesignElement);
      // Stack the group together at the level of its top-most member.
      const lastIdx = els.reduce((acc, el, i) => (ids.has(el.id) ? i : acc), 0);
      const rest = els.filter((el) => !ids.has(el.id));
      const at = els.slice(0, lastIdx).filter((el) => !ids.has(el.id)).length;
      return commit(s, withElements(s, [...rest.slice(0, at), ...members, ...rest.slice(at)]));
    }),

  ungroupSelected: () =>
    set((s) => {
      const ids = new Set(selectedElements(s).filter((el) => el.groupId).map((el) => el.id));
      if (!ids.size) return s;
      return commit(s, mapIds(s.design, ids, (el) => ({ ...el, groupId: null })));
    }),

  moveSelection: (move) =>
    set((s) => {
      if (!s.selectedIds.length) return s;
      return commit(s, withElements(s, moveIds(activeElements(s), new Set(s.selectedIds), move)));
    }),

  nudgeSelected: (dx, dy) =>
    set((s) => {
      const ids = new Set(selectedElements(s).filter((el) => !el.isLocked).map((el) => el.id));
      if (!ids.size) return s;
      return commit(
        s,
        mapIds(s.design, ids, (el) =>
          el.type === "draw"
            ? { ...el, x: el.x + dx, y: el.y + dy, points: el.points.map((p) => ({ x: p.x + dx, y: p.y + dy })) }
            : { ...el, x: el.x + dx, y: el.y + dy }
        ),
        { coalesce: `nudge:${[...ids].join(",")}` }
      );
    }),

  moveSelectionTo: (x, y) => {
    const box = selectionBox(selectedElements(get()));
    if (box.x === x && box.y === y) return;
    get().nudgeSelected(x - box.x, y - box.y);
  },

  scaleSelection: (factor) =>
    set((s) => {
      const picked = selectedElements(s).filter((el) => !el.isLocked);
      if (!picked.length || !Number.isFinite(factor) || factor <= 0 || factor === 1) return s;
      const box = selectionBox(picked);
      const ids = new Set(picked.map((el) => el.id));
      return commit(s, mapIds(s.design, ids, (el) => scaleElement(el, factor, box.x, box.y)), {
        coalesce: `scale:${[...ids].join(",")}`,
      });
    }),

  setSelectionLocked: (locked) =>
    set((s) => {
      if (!s.selectedIds.length) return s;
      return commit(s, mapIds(s.design, new Set(s.selectedIds), (el) => ({ ...el, isLocked: locked })));
    }),

  setEditingText: (id) =>
    set((s) => ({
      editingTextId: id,
      side: id ? sideOfId(s.design, id) ?? s.side : s.side,
      selectedIds: id && !s.selectedIds.includes(id) ? [id] : s.selectedIds,
    })),

  setTool: (tool) => set((s) => ({ tool, selectedIds: tool === "draw" ? [] : s.selectedIds, editingTextId: null })),
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
    const { history, historyIndex, selectedIds, revision, side } = get();
    if (historyIndex <= 0) return;
    const design = history[historyIndex - 1];
    set({
      design,
      historyIndex: historyIndex - 1,
      isDirty: true,
      revision: revision + 1,
      lastCommit: null,
      editingTextId: null,
      selectedIds: keepExisting(design, side, selectedIds),
    });
  },

  redo: () => {
    const { history, historyIndex, selectedIds, revision, side } = get();
    if (historyIndex >= history.length - 1) return;
    const design = history[historyIndex + 1];
    set({
      design,
      historyIndex: historyIndex + 1,
      isDirty: true,
      revision: revision + 1,
      lastCommit: null,
      editingTextId: null,
      selectedIds: keepExisting(design, side, selectedIds),
    });
  },

  resetEditor: () => set({ ...initialState, clipboard: get().clipboard, fitNonce: get().fitNonce }),
}));

/** The single selected element, or null when zero or several are selected. */
export const selectSelectedElement = (s: EditorStore) =>
  s.selectedIds.length === 1 ? activeElements(s).find((el) => el.id === s.selectedIds[0]) ?? null : null;

export const selectSelectedElements = (s: EditorStore) => selectedElements(s);

export const hasClipboard = (s: EditorStore) => !!s.clipboard?.elements.length;
