import type { DesignElement, DesignSchema, Point } from "@/types";

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

/** Fill defaults and order elements by zIndex so array order == stacking order. */
export function normalizeDesign(design?: Partial<DesignSchema> | null): DesignSchema {
  const elements = [...(design?.elements ?? [])]
    .map((el, i) => ({ el, i }))
    .sort((a, b) => (a.el.zIndex ?? a.i) - (b.el.zIndex ?? b.i) || a.i - b.i)
    .map(({ el }, i) => normalizeElement(el, i));

  return {
    ...DEFAULT_DESIGN,
    ...design,
    width: design?.width || DEFAULT_DESIGN.width,
    height: design?.height || DEFAULT_DESIGN.height,
    background: design?.background || "#ffffff",
    bleed_area: design?.bleed_area ?? DEFAULT_BLEED,
    elements,
  };
}

/** Make the design acceptable to the backend's Pydantic schema (some fields are ints). */
export function serializeDesign(design: DesignSchema): DesignSchema {
  return {
    ...design,
    elements: design.elements.map((el, i) => {
      const out = { ...el, zIndex: i } as DesignElement;
      if (out.type === "text") out.fontSize = Math.max(1, Math.round(out.fontSize));
      if (out.type === "draw" || out.type === "line") {
        out.strokeWidth = Math.max(1, Math.round(out.strokeWidth));
      }
      return out;
    }),
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
