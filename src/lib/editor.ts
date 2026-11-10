import type { CardSide, CardSideDesign, DesignElement, DesignSchema, Point } from "@/types";

export const DEFAULT_BLEED = 37.5; // 0.125" at 300 DPI

export const DEFAULT_DESIGN: DesignSchema = {
  width: 1050,
  height: 600,
  dpi: 300,
  background: "#ffffff",
  elements: [],
  bleed_area: DEFAULT_BLEED,
};

export function genId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2, 12);
}

export const FONT_FAMILIES = [
  "Inter",
  "Montserrat",
  "Poppins",
  "Roboto",
  "Playfair Display",
  "Lora",
  "Oswald",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
] as const;

/** Google Fonts stylesheet for the non web-safe families above. */
export const GOOGLE_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,700;1,400;1,700&family=Lora:ital,wght@0,400;0,700;1,400;1,700&family=Montserrat:ital,wght@0,400;0,700;1,400;1,700&family=Oswald:wght@400;700&family=Playfair+Display:ital,wght@0,400;0,700;1,400;1,700&family=Poppins:ital,wght@0,400;0,700;1,400;1,700&family=Roboto:ital,wght@0,400;0,700;1,400;1,700&display=swap";

export const SWATCHES = [
  "#000000", "#ffffff", "#1f2937", "#6b7280", "#d1d5db",
  "#ef4444", "#f97316", "#f59e0b", "#22c55e", "#14b8a6",
  "#3b82f6", "#6366f1", "#8b5cf6", "#ec4899", "#b45309",
];

export const SHAPES: { type: string; label: string }[] = [
  { type: "rect", label: "Rectangle" },
  { type: "circle", label: "Circle" },
  { type: "triangle", label: "Triangle" },
  { type: "diamond", label: "Diamond" },
  { type: "hexagon", label: "Hexagon" },
  { type: "star", label: "Star" },
];

/** Konva font style from the stored `fontWeight` string. */
export function fontStyleOf(fontWeight?: string): string {
  const bold = !!fontWeight && /bold|[6-9]00/.test(fontWeight);
  const italic = !!fontWeight && fontWeight.includes("italic");
  if (bold && italic) return "italic bold";
  if (bold) return "bold";
  if (italic) return "italic";
  return "normal";
}

export function elementLabel(el: DesignElement): string {
  switch (el.type) {
    case "text":
      return el.content?.trim().split("\n")[0] || "Text";
    case "image":
      return "Image";
    case "qr":
      return "QR code";
    case "draw":
      return "Drawing";
    case "line":
      return "Line";
    case "shape": {
      const s = SHAPES.find((x) => x.type === el.shapeType);
      if (el.shapeType === "rect" && (el.height ?? 0) <= 12) return "Line";
      return s?.label ?? "Shape";
    }
  }
}

function normalizeElement(raw: DesignElement, index: number): DesignElement {
  const el = {
    ...raw,
    id: raw.id || genId(),
    x: Number(raw.x) || 0,
    y: Number(raw.y) || 0,
    rotation: raw.rotation ?? 0,
    opacity: raw.opacity ?? 1,
    isVisible: raw.isVisible ?? true,
    isLocked: raw.isLocked ?? false,
    zIndex: index,
  } as DesignElement;

  // Older QR elements stored the encoded text in `data`; it now holds the rendered image.
  if (el.type === "qr" && el.data && !el.data.startsWith("data:image")) {
    return { ...el, value: el.value ?? el.data, data: "" };
  }
  return el;
}

/** Order elements by zIndex (so array order == stacking order) and fill defaults. */
function normalizeElements(list?: DesignElement[] | null): DesignElement[] {
  return [...(list ?? [])]
    .map((el, i) => ({ el, i }))
    .sort((a, b) => (a.el.zIndex ?? a.i) - (b.el.zIndex ?? b.i) || a.i - b.i)
    .map(({ el }, i) => normalizeElement(el, i));
}

function validOrder(order?: CardSide[] | null): CardSide[] {
  return order?.length === 2 && order.includes("front") && order.includes("back") ? [...order] : ["front", "back"];
}

/** Which face is shown at each workspace position. */
export function getFaceOrder(design: DesignSchema): CardSide[] {
  return validOrder(design.face_order);
}

/** Swap the front and back content and flip the layout order, so each face keeps its place on screen. */
export function swapFaces(design: DesignSchema): DesignSchema {
  const front = getSide(design, "front");
  const back = getSide(design, "back");
  const [a, b] = getFaceOrder(design);
  return {
    ...design,
    background: back.background,
    elements: back.elements,
    back: { background: front.background, elements: front.elements },
    face_order: [b, a],
  };
}

export function normalizeDesign(design?: Partial<DesignSchema> | null): DesignSchema {
  const front = normalizeElements(design?.elements);
  // Element ids must be unique across both faces (the workspace shows them together).
  const seen = new Set(front.map((el) => el.id));
  const back = normalizeElements(design?.back?.elements).map((el) => {
    if (!seen.has(el.id)) {
      seen.add(el.id);
      return el;
    }
    return { ...el, id: genId() };
  });

  return {
    ...DEFAULT_DESIGN,
    ...design,
    width: design?.width || DEFAULT_DESIGN.width,
    height: design?.height || DEFAULT_DESIGN.height,
    background: design?.background || "#ffffff",
    bleed_area: design?.bleed_area ?? DEFAULT_BLEED,
    elements: front,
    back: {
      background: design?.back?.background || "#ffffff",
      elements: back,
    },
    face_order: validOrder(design?.face_order),
  };
}

/** Background + elements of one side of the card. */
export function getSide(design: DesignSchema, side: CardSide): Required<CardSideDesign> {
  if (side === "back") {
    return { background: design.back?.background || "#ffffff", elements: design.back?.elements ?? [] };
  }
  return { background: design.background || "#ffffff", elements: design.elements };
}

/** Return a copy of the design with one side replaced/patched. */
export function setSide(design: DesignSchema, side: CardSide, patch: Partial<CardSideDesign>): DesignSchema {
  if (side === "back") {
    return { ...design, back: { ...getSide(design, "back"), ...patch } };
  }
  return {
    ...design,
    ...(patch.background !== undefined && { background: patch.background }),
    ...(patch.elements !== undefined && { elements: patch.elements }),
  };
}

export function hasBackContent(design?: DesignSchema | null): boolean {
  const back = design?.back;
  return !!back && (back.elements.length > 0 || !["#fff", "#ffffff"].includes((back.background ?? "#ffffff").toLowerCase()));
}

function serializeElements(list: DesignElement[]): DesignElement[] {
  return list.map((el, i) => {
    const out = { ...el, zIndex: i } as DesignElement;
    if (out.type === "text") out.fontSize = Math.max(1, Math.round(out.fontSize));
    if (out.type === "draw" || out.type === "line") {
      out.strokeWidth = Math.max(1, Math.round(out.strokeWidth));
    }
    return out;
  });
}

/** Make the design acceptable to the backend's Pydantic schema (some fields are ints). */
export function serializeDesign(design: DesignSchema): DesignSchema {
  const back = getSide(design, "back");
  return {
    ...design,
    elements: serializeElements(design.elements),
    back: { background: back.background, elements: serializeElements(back.elements) },
  };
}

export function boundsOf(points: Point[]) {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  return {
    x: minX,
    y: minY,
    width: Math.max(...xs) - minX,
    height: Math.max(...ys) - minY,
  };
}

export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

/** Approximate unrotated box of an element in design units (text height is estimated from its lines). */
export function elementBox(el: DesignElement) {
  switch (el.type) {
    case "draw":
      return el.points.length ? boundsOf(el.points) : { x: el.x, y: el.y, width: 0, height: 0 };
    case "line": {
      const xs = el.points.filter((_, i) => i % 2 === 0);
      const ys = el.points.filter((_, i) => i % 2 === 1);
      const minX = Math.min(...xs, 0);
      const minY = Math.min(...ys, 0);
      return { x: el.x + minX, y: el.y + minY, width: Math.max(...xs, 0) - minX, height: Math.max(...ys, 0) - minY };
    }
    case "text": {
      const lines = Math.max(1, (el.content || "").split("\n").length);
      return { x: el.x, y: el.y, width: el.width ?? el.fontSize * 0.6 * (el.content?.length ?? 1), height: el.height ?? el.fontSize * 1.2 * lines };
    }
    default:
      return { x: el.x, y: el.y, width: el.width ?? 100, height: el.height ?? 100 };
  }
}

/** Combined box of several elements. */
export function selectionBox(elements: DesignElement[]) {
  if (!elements.length) return { x: 0, y: 0, width: 0, height: 0 };
  const boxes = elements.map(elementBox);
  const x = Math.min(...boxes.map((b) => b.x));
  const y = Math.min(...boxes.map((b) => b.y));
  return {
    x,
    y,
    width: Math.max(...boxes.map((b) => b.x + b.width)) - x,
    height: Math.max(...boxes.map((b) => b.y + b.height)) - y,
  };
}

/** Scale an element by `f` about the point (ox, oy). */
export function scaleElement(el: DesignElement, f: number, ox: number, oy: number): DesignElement {
  const sx = (v: number) => ox + (v - ox) * f;
  const sy = (v: number) => oy + (v - oy) * f;
  switch (el.type) {
    case "draw": {
      const points = el.points.map((p) => ({ x: sx(p.x), y: sy(p.y) }));
      return { ...el, points, strokeWidth: Math.max(1, el.strokeWidth * f), ...boundsOf(points) };
    }
    case "line":
      return { ...el, x: sx(el.x), y: sy(el.y), points: el.points.map((v) => v * f), strokeWidth: Math.max(1, el.strokeWidth * f) };
    case "text":
      return {
        ...el,
        x: sx(el.x),
        y: sy(el.y),
        fontSize: Math.max(4, Math.round(el.fontSize * f)),
        width: el.width !== undefined ? el.width * f : undefined,
        height: el.height !== undefined ? el.height * f : undefined,
      };
    default:
      return { ...el, x: sx(el.x), y: sy(el.y), width: Math.max(5, (el.width ?? 100) * f), height: Math.max(5, (el.height ?? 100) * f) };
  }
}
