"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Stage, Layer, Group, Rect, Text, Image as KonvaImage, Shape, Line, Transformer } from "react-konva";
import useImage from "use-image";
import QRCode from "qrcode";
import { Check, ChevronDown, Repeat } from "lucide-react";
import { useEditorStore } from "@/store/editor.store";
import { DEFAULT_BLEED, boundsOf, clamp, fontStyleOf, getFaceOrder, getSide } from "@/lib/editor";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type {
  CardSide,
  DesignElement,
  DrawElement,
  ElementPatch,
  ImageElement,
  LineElement,
  Point,
  QRElement,
  ShapeElement,
  TextElement,
} from "@/types";

const ACCENT = "#6366f1";
const SNAP_COLOR = "#ec4899";
const PADDING = 64;
/** Vertical space between the two faces, in design units (holds the second label). */
const GAP = 180;
/** Screen space reserved above the first face for its label. */
const LABEL_SPACE = 44;

type Guides = { x: number | null; y: number | null };
type Marquee = { side: CardSide; x0: number; y0: number; x1: number; y1: number; additive: boolean };

// ─── Shape drawing ───────────────────────────────────────────────────────────

function drawShape(ctx: Konva.Context, shape: Konva.Shape, type: string) {
  const w = shape.width();
  const h = shape.height();
  ctx.beginPath();
  switch (type) {
    case "circle":
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    case "triangle":
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      break;
    case "diamond":
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w / 2, h);
      ctx.lineTo(0, h / 2);
      break;
    case "hexagon":
      for (let i = 0; i < 6; i++) {
        const a = (Math.PI / 3) * i;
        const px = w / 2 + (w / 2) * Math.cos(a);
        const py = h / 2 + (h / 2) * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    case "star":
      for (let i = 0; i < 10; i++) {
        const r = i % 2 === 0 ? 1 : 0.4;
        const a = -Math.PI / 2 + (Math.PI / 5) * i;
        const px = w / 2 + (w / 2) * r * Math.cos(a);
        const py = h / 2 + (h / 2) * r * Math.sin(a);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      break;
    default:
      ctx.rect(0, 0, w, h);
  }
  ctx.closePath();
  ctx.fillStrokeShape(shape);
}

// ─── Node → element patches ──────────────────────────────────────────────────

function resetScale(node: Konva.Node) {
  const sx = node.scaleX();
  const sy = node.scaleY();
  node.scaleX(1);
  node.scaleY(1);
  return { sx, sy };
}

/** Drawings store absolute points: fold the node's transform into them and reset the node. */
function bakeDrawing(el: DrawElement, node: Konva.Node): ElementPatch {
  const t = node.getTransform().copy();
  const points = el.points.map((p) => t.point(p));
  node.setAttrs({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
  return { points, ...boundsOf(points) };
}

/** Patch after a drag. */
function positionPatch(el: DesignElement, node: Konva.Node): ElementPatch {
  if (el.type === "draw") return bakeDrawing(el, node);
  return { x: node.x(), y: node.y() };
}

/** Patch after a resize/rotate: fold scale into the element's own size fields. */
function transformPatch(el: DesignElement, node: Konva.Node): ElementPatch {
  if (el.type === "draw") return bakeDrawing(el, node);
  const { sx, sy } = resetScale(node);
  const base = { x: node.x(), y: node.y(), rotation: node.rotation() };
  if (el.type === "text") {
    const text = node as Konva.Text;
    return {
      ...base,
      width: text.width() * sx,
      fontSize: Math.max(4, Math.round(el.fontSize * sx)),
      height: text.height() * sx,
    };
  }
  if (el.type === "line") {
    return { ...base, points: el.points.map((v, i) => (i % 2 === 0 ? v * sx : v * sy)) };
  }
  return {
    ...base,
    width: Math.max(5, (el.width ?? 100) * sx),
    height: Math.max(5, (el.height ?? 100) * sy),
  };
}

// ─── Element nodes ───────────────────────────────────────────────────────────

type Common = Konva.NodeConfig & Record<string, unknown>;

function TextNode({ el, common, hidden }: { el: TextElement; common: Common; hidden: boolean }) {
  return (
    <Text
      {...common}
      visible={!hidden}
      text={el.content || " "}
      fontSize={el.fontSize}
      fontFamily={el.fontFamily}
      fontStyle={fontStyleOf(el.fontWeight)}
      fill={el.fill}
      align={el.textAlign ?? "left"}
      width={el.width}
      lineHeight={1.2}
      onTransform={(e) => {
        const node = e.target as Konva.Text;
        const tr = node.getStage()?.findOne<Konva.Transformer>("Transformer");
        const anchor = tr?.getActiveAnchor();
        // With a single text selected, side handles change the wrap width instead of scaling the font.
        if (tr?.nodes().length === 1 && (anchor === "middle-left" || anchor === "middle-right")) {
          node.setAttrs({ width: Math.max(30, node.width() * node.scaleX()), scaleX: 1, scaleY: 1 });
        }
      }}
    />
  );
}

function ShapeNode({ el, common }: { el: ShapeElement; common: Common }) {
  return (
    <Shape
      {...common}
      width={el.width ?? 100}
      height={el.height ?? 100}
      fill={el.fill ?? "#000000"}
      sceneFunc={(ctx, shape) => drawShape(ctx, shape, el.shapeType)}
    />
  );
}

function ImageNode({ el, common }: { el: ImageElement; common: Common }) {
  const [img, status] = useImage(el.url, "anonymous");
  const w = el.width ?? 150;
  const h = el.height ?? 150;
  if (!img) return <Rect {...common} width={w} height={h} fill={status === "failed" ? "#fee2e2" : "#e5e7eb"} />;
  return <KonvaImage {...common} image={img} width={w} height={h} />;
}

function QRNode({ el, common }: { el: QRElement; common: Common }) {
  const updateElement = useEditorStore((s) => s.updateElement);
  const value = el.value ?? "";
  const color = el.fill ?? "#000000";

  // Render the QR image whenever the encoded value or colour changes.
  useEffect(() => {
    let cancelled = false;
    QRCode.toDataURL(value || " ", { margin: 1, width: 512, color: { dark: color, light: "#ffffff" } })
      .then((url) => {
        if (!cancelled && url !== el.data) updateElement(el.id, { data: url }, { history: false });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [value, color, el.id, el.data, updateElement]);

  const [img] = useImage(el.data || "");
  const size = { width: el.width ?? 160, height: el.height ?? 160 };
  if (!img) return <Rect {...common} {...size} fill="#f3f4f6" />;
  return <KonvaImage {...common} {...size} image={img} />;
}

function DrawNode({ el, common }: { el: DrawElement; common: Common }) {
  return (
    <Line
      {...common}
      x={0}
      y={0}
      rotation={0}
      points={el.points.flatMap((p) => [p.x, p.y])}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      lineCap={(el.lineCap as CanvasLineCap) ?? "round"}
      lineJoin={(el.lineJoin as CanvasLineJoin) ?? "round"}
      tension={0.4}
      hitStrokeWidth={Math.max(16, el.strokeWidth)}
    />
  );
}

function LineNode({ el, common }: { el: LineElement; common: Common }) {
  return (
    <Line
      {...common}
      points={el.points}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      dash={el.dash ?? undefined}
      hitStrokeWidth={Math.max(16, el.strokeWidth)}
    />
  );
}

// ─── Overlays ────────────────────────────────────────────────────────────────

function TextEditor({
  el,
  left,
  top,
  zoom,
  onDone,
}: {
  el: TextElement;
  left: number;
  top: number;
  zoom: number;
  onDone: (content: string | null) => void;
}) {
  const [value, setValue] = useState(el.content);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.focus();
    ta.select();
  }, []);

  useEffect(() => {
    const ta = ref.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${ta.scrollHeight}px`;
  }, [value, zoom]);

  const fontStyle = fontStyleOf(el.fontWeight);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={() => onDone(value)}
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Escape") onDone(null);
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onDone(value);
      }}
      spellCheck={false}
      className="absolute z-10 m-0 resize-none overflow-hidden border-0 bg-transparent p-0 outline-2 outline-offset-2 outline-indigo-500"
      style={{
        left,
        top,
        width: el.width ? el.width * zoom : undefined,
        minWidth: 40,
        fontSize: el.fontSize * zoom,
        fontFamily: el.fontFamily,
        fontWeight: fontStyle.includes("bold") ? 700 : 400,
        fontStyle: fontStyle.includes("italic") ? "italic" : "normal",
        lineHeight: 1.2,
        color: el.fill,
        textAlign: (el.textAlign as "left" | "center" | "right") ?? "left",
        transform: `rotate(${el.rotation ?? 0}deg)`,
        transformOrigin: "top left",
        opacity: el.opacity ?? 1,
      }}
    />
  );
}

/** Dropdown that labels a face of the card as Front or Back. */
function FaceLabel({ index, side, active, left, top }: { index: number; side: CardSide; active: boolean; left: number; top: number }) {
  const { setFaceLabel, setSide, swapFaces } = useEditorStore.getState();
  const label = side === "front" ? "Front" : "Back";

  return (
    <div className="absolute z-10 flex items-center gap-2" style={{ left, top }}>
      <DropdownMenu>
        <DropdownMenuTrigger
          onClick={() => setSide(side)}
          className={cn(
            "inline-flex h-7 items-center gap-1.5 rounded-lg border px-2.5 text-xs font-semibold shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50",
            active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:bg-muted"
          )}
          aria-label={`Face ${index + 1}: ${label}. Change label`}
        >
          <span className={cn("size-1.5 rounded-full", side === "front" ? "bg-emerald-400" : "bg-amber-400")} />
          {label}
          <ChevronDown className="size-3.5 opacity-70" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          {(["front", "back"] as CardSide[]).map((option) => (
            <DropdownMenuItem key={option} onClick={() => setFaceLabel(index, option)}>
              <Check className={cn("size-4", option !== side && "opacity-0")} />
              {option === "front" ? "Front" : "Back"}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={swapFaces}>
            <Repeat className="size-4" />
            Swap front and back
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {active && <span className="text-[11px] font-medium text-muted-foreground">Editing</span>}
    </div>
  );
}

// ─── Stage ───────────────────────────────────────────────────────────────────

export default function EditorStage() {
  const design = useEditorStore((s) => s.design);
  const side = useEditorStore((s) => s.side);
  const selectedIds = useEditorStore((s) => s.selectedIds);
  const editingTextId = useEditorStore((s) => s.editingTextId);
  const tool = useEditorStore((s) => s.tool);
  const drawColor = useEditorStore((s) => s.drawColor);
  const drawWidth = useEditorStore((s) => s.drawWidth);
  const zoom = useEditorStore((s) => s.zoom);
  const autoFit = useEditorStore((s) => s.autoFit);
  const fitNonce = useEditorStore((s) => s.fitNonce);
  const showGuides = useEditorStore((s) => s.showGuides);
  const showGrid = useEditorStore((s) => s.showGrid);
  const { select, selectMany, setSide, setEditingText, updateElement, updateElements, addElement, setZoom } = useEditorStore.getState();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const dragCommitted = useRef(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [guides, setGuides] = useState<Guides>({ x: null, y: null });
  /** Outline under the cursor (the whole group for grouped elements), in design units. */
  const [hover, setHover] = useState<{ side: CardSide; x: number; y: number; width: number; height: number } | null>(null);
  const [drawing, setDrawing] = useState<{ side: CardSide; points: Point[] } | null>(null);
  const [marquee, setMarquee] = useState<Marquee | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [fontsVersion, setFontsVersion] = useState(0);

  const W = design.width;
  const H = design.height;
  const bleed = design.bleed_area ?? DEFAULT_BLEED;
  const totalH = H * 2 + GAP;
  const order = getFaceOrder(design);

  // Track container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setSize({ w: entry.contentRect.width, h: entry.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit both faces to the viewport on load, on request, and on resize while auto-fitting
  useEffect(() => {
    if (!size.w || !size.h || !autoFit) return;
    const fit = Math.min((size.w - PADDING * 2) / W, (size.h - PADDING * 2 - LABEL_SPACE) / totalH);
    setZoom(clamp(fit, 0.1, 2), true);
    setPan({ x: 0, y: 0 });
  }, [size.w, size.h, W, totalH, autoFit, fitNonce, setZoom]);

  // Redraw text once web fonts finish loading so measurements are correct
  useEffect(() => {
    const bump = () => setFontsVersion((v) => v + 1);
    document.fonts?.ready.then(bump);
    document.fonts?.addEventListener("loadingdone", bump);
    return () => document.fonts?.removeEventListener("loadingdone", bump);
  }, []);

  // Space bar = temporary hand tool
  useEffect(() => {
    const isTyping = (t: EventTarget | null) =>
      (t as HTMLElement | null)?.closest?.("input, textarea, select, [contenteditable='true']");
    const down = (e: KeyboardEvent) => {
      if (e.code === "Space" && !isTyping(e.target)) {
        e.preventDefault();
        setSpaceDown(true);
      }
    };
    const up = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpaceDown(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  const originX = (size.w - W * zoom) / 2 + pan.x;
  const originY = (size.h - totalH * zoom) / 2 + pan.y + LABEL_SPACE / 2;
  const boards = order.map((s, i) => ({ side: s, index: i, x: originX, y: originY + i * (H + GAP) * zoom }));
  const boardOf = (s: CardSide) => boards.find((b) => b.side === s) ?? boards[0];

  const findElement = (id: string) =>
    getSide(design, "front").elements.find((el) => el.id === id) ?? getSide(design, "back").elements.find((el) => el.id === id);

  const activeElements = getSide(design, side).elements;
  const selected = activeElements.filter((el) => selectedIds.includes(el.id));
  const selectionLocked = selected.some((el) => el.isLocked);
  const single = selected.length === 1 ? selected[0] : null;

  // Attach the transformer to every selected node
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const nodes =
      tool === "select"
        ? selected
            .filter((el) => el.isVisible !== false && el.id !== editingTextId)
            .map((el) => stage.findOne(`#${CSS.escape(el.id)}`))
            .filter((n): n is Konva.Node => !!n)
        : [];
    tr.nodes(nodes);

    const corners = ["top-left", "top-right", "bottom-left", "bottom-right"];
    const anchors =
      selectionLocked ? []
      : !single ? corners
      : single.type === "text" ? [...corners, "middle-left", "middle-right"]
      : single.type === "image" || single.type === "qr" ? corners
      : [...corners, "top-center", "middle-left", "middle-right", "bottom-center"];
    tr.setAttrs({
      enabledAnchors: anchors,
      rotateEnabled: !selectionLocked,
      keepRatio: !(single && single.type === "shape"),
      borderDash: selectionLocked ? [4, 4] : selected.length > 1 ? [6, 3] : undefined,
    });
    tr.getLayer()?.batchDraw();
  }, [selected, single, selectionLocked, editingTextId, tool, fontsVersion]);

  /** Pointer position on the face under it (or nearest), in design units. */
  const pointerOnBoard = (): { side: CardSide; x: number; y: number } | null => {
    const p = stageRef.current?.getPointerPosition();
    if (!p) return null;
    let best = boards[0];
    for (const b of boards) {
      const mid = b.y + (H * zoom) / 2;
      if (Math.abs(p.y - mid) < Math.abs(p.y - (best.y + (H * zoom) / 2))) best = b;
    }
    return { side: best.side, x: (p.x - best.x) / zoom, y: (p.y - best.y) / zoom };
  };

  // Snap a single dragged element to its face's edges / centre
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    if (useEditorStore.getState().selectedIds.length > 1) return;
    const node = e.target;
    const card = node.findAncestor(".artboard") as Konva.Group | null;
    if (!card) return;
    const box = node.getClientRect({ relativeTo: card });
    const threshold = 8 / zoom;

    const snapAxis = (start: number, length: number, targets: number[]) => {
      let best: { diff: number; at: number } | null = null;
      for (const edge of [start, start + length / 2, start + length]) {
        for (const t of targets) {
          const diff = t - edge;
          if (Math.abs(diff) < threshold && (!best || Math.abs(diff) < Math.abs(best.diff))) best = { diff, at: t };
        }
      }
      return best;
    };

    const sx = snapAxis(box.x, box.width, [0, W / 2, W]);
    const sy = snapAxis(box.y, box.height, [0, H / 2, H]);
    if (sx) node.x(node.x() + sx.diff);
    if (sy) node.y(node.y() + sy.diff);
    setGuides({ x: sx?.at ?? null, y: sy?.at ?? null });
  };

  /** Commit positions of everything that moved together, as one undo step. */
  const handleDragEnd = (el: DesignElement) => {
    setGuides({ x: null, y: null });
    if (dragCommitted.current) return;
    dragCommitted.current = true;
    const stage = stageRef.current;
    if (!stage) return;
    const ids = useEditorStore.getState().selectedIds.includes(el.id) ? useEditorStore.getState().selectedIds : [el.id];
    const patches = ids.flatMap((id) => {
      const target = findElement(id);
      const node = stage.findOne(`#${CSS.escape(id)}`);
      return target && node ? [{ id, patch: positionPatch(target, node) }] : [];
    });
    updateElements(patches);
  };

  const handleTransformEnd = () => {
    const tr = trRef.current;
    if (!tr) return;
    const patches = tr.nodes().flatMap((node) => {
      const target = findElement(node.id());
      return target ? [{ id: target.id, patch: transformPatch(target, node) }] : [];
    });
    updateElements(patches);
  };

  /**
   * Attach the transformer to the current selection right now, without waiting for React to
   * re-render. Grabbing an unselected group and dragging in one motion starts the Konva drag
   * on the very next pointer move; the other group members must already be attached by then
   * or only the grabbed piece moves.
   */
  const attachSelectionNow = () => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const st = useEditorStore.getState();
    const visible = new Set(getSide(st.design, st.side).elements.filter((el) => el.isVisible !== false).map((el) => el.id));
    const nodes = st.selectedIds
      .filter((id) => visible.has(id) && id !== st.editingTextId)
      .map((id) => stage.findOne(`#${CSS.escape(id)}`))
      .filter((n): n is Konva.Node => !!n);
    tr.nodes(nodes);
  };

  const commonFor = (el: DesignElement, face: CardSide): Common => ({
    id: el.id,
    name: "element",
    side: face,
    x: el.x,
    y: el.y,
    rotation: el.rotation ?? 0,
    opacity: el.opacity ?? 1,
    draggable: tool === "select" && !el.isLocked && !spaceDown && !(selectedIds.includes(el.id) && selectionLocked),
    listening: tool === "select" && !spaceDown,
    onMouseDown: (e: KonvaEventObject<MouseEvent>) => {
      e.cancelBubble = true; // don't start a marquee
      setHover(null);
      const st = useEditorStore.getState();
      const additive = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
      // Keep a multi-selection intact so it can be dragged as a whole.
      if (!additive && st.side === face && st.selectedIds.includes(el.id)) return;
      select(el.id, { side: face, additive });
      attachSelectionNow();
    },
    onTouchStart: (e: KonvaEventObject<TouchEvent>) => {
      e.cancelBubble = true;
      const st = useEditorStore.getState();
      if (st.side === face && st.selectedIds.includes(el.id)) return;
      select(el.id, { side: face });
      attachSelectionNow();
    },
    onDragStart: () => {
      dragCommitted.current = false;
      setHover(null);
    },
    onDragMove: handleDragMove,
    onDragEnd: () => handleDragEnd(el),
    onMouseEnter: (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (stage) stage.container().style.cursor = el.isLocked ? "default" : "move";
      if (!stage || useEditorStore.getState().selectedIds.includes(el.id)) return;
      // Outline what a click would grab: the element, or its whole group.
      const board = e.target.findAncestor(".artboard") as Konva.Group | null;
      if (!board) return;
      const ids = el.groupId
        ? getSide(useEditorStore.getState().design, face).elements.filter((m) => m.groupId === el.groupId && m.isVisible !== false).map((m) => m.id)
        : [el.id];
      const rects = ids
        .map((id) => stage.findOne(`#${CSS.escape(id)}`)?.getClientRect({ relativeTo: board }))
        .filter((r): r is NonNullable<typeof r> => !!r);
      if (!rects.length) return;
      const x = Math.min(...rects.map((r) => r.x));
      const y = Math.min(...rects.map((r) => r.y));
      setHover({
        side: face,
        x,
        y,
        width: Math.max(...rects.map((r) => r.x + r.width)) - x,
        height: Math.max(...rects.map((r) => r.y + r.height)) - y,
      });
    },
    onMouseLeave: (e: KonvaEventObject<MouseEvent>) => {
      const c = e.target.getStage()?.container();
      if (c) c.style.cursor = "";
      setHover(null);
    },
    onDblClick: () => el.type === "text" && !el.isLocked && setEditingText(el.id),
    onDblTap: () => el.type === "text" && !el.isLocked && setEditingText(el.id),
  });

  // ── Stage pointer handlers: focus/deselect, marquee, pan, draw ──
  const handleDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const evt = e.evt as MouseEvent;
    const p = stageRef.current?.getPointerPosition();
    if (p && (spaceDown || evt.button === 1)) {
      panStart.current = { x: p.x, y: p.y, panX: pan.x, panY: pan.y };
      return;
    }
    const at = pointerOnBoard();
    if (!at) return;

    if (tool === "draw") {
      setSide(at.side);
      setDrawing({ side: at.side, points: [{ x: at.x, y: at.y }] });
      return;
    }

    // Only empty canvas or a card background starts a marquee / clears selection
    // (transformer handles bubble up here too and must not deselect).
    const target = e.target as Konva.Node;
    const onCard = target.name() === "card-bg";
    if (target !== target.getStage() && !onCard) return;
    const face = onCard ? (target.getAttr("side") as CardSide) : useEditorStore.getState().side;
    if (onCard) setSide(face);
    const additive = evt.shiftKey || evt.ctrlKey || evt.metaKey;
    if (!additive) select(null, { side: face });
    if (p) setMarquee({ side: at.side, x0: p.x, y0: p.y, x1: p.x, y1: p.y, additive });
  };

  const handleMove = () => {
    const p = stageRef.current?.getPointerPosition();
    if (!p) return;
    if (panStart.current) {
      setPan({ x: panStart.current.panX + p.x - panStart.current.x, y: panStart.current.panY + p.y - panStart.current.y });
      return;
    }
    if (drawing) {
      const b = boardOf(drawing.side);
      const pt = { x: (p.x - b.x) / zoom, y: (p.y - b.y) / zoom };
      setDrawing((d) => (d ? { ...d, points: [...d.points, pt] } : d));
      return;
    }
    if (marquee) setMarquee((m) => (m ? { ...m, x1: p.x, y1: p.y } : m));
  };

  const handleUp = () => {
    panStart.current = null;

    if (drawing) {
      if (drawing.points.length > 1) {
        addElement({
          type: "draw",
          points: drawing.points,
          stroke: drawColor,
          strokeWidth: drawWidth,
          lineCap: "round",
          lineJoin: "round",
          ...boundsOf(drawing.points),
        } as Omit<DrawElement, "id">);
        select(null);
      }
      setDrawing(null);
    }

    if (marquee) {
      const box = {
        x: Math.min(marquee.x0, marquee.x1),
        y: Math.min(marquee.y0, marquee.y1),
        width: Math.abs(marquee.x1 - marquee.x0),
        height: Math.abs(marquee.y1 - marquee.y0),
      };
      if (box.width > 4 || box.height > 4) {
        const stage = stageRef.current;
        const hits =
          stage
            ?.find(".element")
            .filter((n) => n.getAttr("side") === marquee.side && n.isVisible() && Konva.Util.haveIntersection(box, n.getClientRect()))
            .map((n) => n.id()) ?? [];
        if (hits.length) selectMany(hits, marquee.side, marquee.additive);
      }
      setMarquee(null);
    }
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const p = stageRef.current?.getPointerPosition();
    if (!p) return;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Zoom towards the cursor
      const next = clamp(zoom * (e.evt.deltaY > 0 ? 1 / 1.08 : 1.08), 0.1, 5);
      const pt = { x: (p.x - originX) / zoom, y: (p.y - originY) / zoom };
      setPan({
        x: p.x - pt.x * next - (size.w - W * next) / 2,
        y: p.y - pt.y * next - (size.h - totalH * next) / 2 - LABEL_SPACE / 2,
      });
      setZoom(next);
    } else {
      const dx = e.evt.shiftKey ? e.evt.deltaY : e.evt.deltaX;
      const dy = e.evt.shiftKey ? 0 : e.evt.deltaY;
      setPan((prev) => ({ x: prev.x - dx, y: prev.y - dy }));
    }
  };

  const gridLines = useMemo(() => {
    const step = 50;
    const lines: number[][] = [];
    for (let x = step; x < W; x += step) lines.push([x, 0, x, H]);
    for (let y = step; y < H; y += step) lines.push([0, y, W, y]);
    return lines;
  }, [W, H]);

  const renderElement = (el: DesignElement, face: CardSide) => {
    if (el.isVisible === false) return null;
    const common = commonFor(el, face);
    switch (el.type) {
      case "text":
        return <TextNode key={`${el.id}:${fontsVersion}`} el={el} common={common} hidden={editingTextId === el.id} />;
      case "shape":
        return <ShapeNode key={el.id} el={el} common={common} />;
      case "image":
        return <ImageNode key={el.id} el={el} common={common} />;
      case "qr":
        return <QRNode key={el.id} el={el} common={common} />;
      case "draw":
        return <DrawNode key={el.id} el={el} common={common} />;
      case "line":
        return <LineNode key={el.id} el={el} common={common} />;
      default:
        return null;
    }
  };

  const editingEl = editingTextId ? (findElement(editingTextId) as TextElement | undefined) : undefined;
  const editingBoard = editingEl ? boardOf(side) : null;
  const cursor = panStart.current ? "grabbing" : spaceDown ? "grab" : tool === "draw" ? "crosshair" : "default";

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden" style={{ cursor }}>
      {size.w > 0 && (
        <Stage
          ref={stageRef}
          width={size.w}
          height={size.h}
          onMouseDown={handleDown}
          onTouchStart={handleDown}
          onMouseMove={handleMove}
          onTouchMove={handleMove}
          onMouseUp={handleUp}
          onTouchEnd={handleUp}
          onMouseLeave={handleUp}
          onWheel={handleWheel}
        >
          <Layer>
            {boards.map((b) => {
              const face = getSide(design, b.side);
              const isActive = b.side === side;
              return (
                <Group key={b.side} name="artboard" x={b.x} y={b.y} scaleX={zoom} scaleY={zoom}>
                  {isActive && (
                    <Rect
                      x={-bleed - 10 / zoom}
                      y={-bleed - 10 / zoom}
                      width={W + bleed * 2 + 20 / zoom}
                      height={H + bleed * 2 + 20 / zoom}
                      stroke={ACCENT}
                      strokeWidth={2 / zoom}
                      cornerRadius={8 / zoom}
                      opacity={0.55}
                      listening={false}
                    />
                  )}
                  {showGuides && (
                    <Rect
                      x={-bleed}
                      y={-bleed}
                      width={W + bleed * 2}
                      height={H + bleed * 2}
                      stroke="#ef4444"
                      strokeWidth={1 / zoom}
                      dash={[6 / zoom, 4 / zoom]}
                      opacity={0.5}
                      listening={false}
                    />
                  )}
                  <Rect
                    name="card-bg"
                    side={b.side}
                    width={W}
                    height={H}
                    fill={face.background}
                    shadowColor="#000000"
                    shadowBlur={24}
                    shadowOpacity={0.18}
                    shadowOffsetY={6}
                  />
                  <Group clipX={0} clipY={0} clipWidth={W} clipHeight={H}>
                    {face.elements.map((el) => renderElement(el, b.side))}
                    {drawing?.side === b.side && (
                      <Line
                        points={drawing.points.flatMap((p) => [p.x, p.y])}
                        stroke={drawColor}
                        strokeWidth={drawWidth}
                        lineCap="round"
                        lineJoin="round"
                        tension={0.4}
                        listening={false}
                      />
                    )}
                  </Group>
                  {showGrid && (
                    <Group listening={false} opacity={0.35}>
                      {gridLines.map((pts, i) => (
                        <Line key={i} points={pts} stroke="#94a3b8" strokeWidth={1 / zoom} />
                      ))}
                    </Group>
                  )}
                  {showGuides && (
                    <Rect
                      x={bleed}
                      y={bleed}
                      width={W - bleed * 2}
                      height={H - bleed * 2}
                      stroke={ACCENT}
                      strokeWidth={1 / zoom}
                      dash={[4 / zoom, 4 / zoom]}
                      opacity={0.45}
                      listening={false}
                    />
                  )}
                  {hover?.side === b.side && !marquee && (
                    <Rect
                      x={hover.x - 3 / zoom}
                      y={hover.y - 3 / zoom}
                      width={hover.width + 6 / zoom}
                      height={hover.height + 6 / zoom}
                      stroke={ACCENT}
                      strokeWidth={1.5 / zoom}
                      dash={[5 / zoom, 3 / zoom]}
                      opacity={0.8}
                      listening={false}
                    />
                  )}
                  {isActive && guides.x !== null && (
                    <Line points={[guides.x, -bleed, guides.x, H + bleed]} stroke={SNAP_COLOR} strokeWidth={1 / zoom} listening={false} />
                  )}
                  {isActive && guides.y !== null && (
                    <Line points={[-bleed, guides.y, W + bleed, guides.y]} stroke={SNAP_COLOR} strokeWidth={1 / zoom} listening={false} />
                  )}
                </Group>
              );
            })}

            <Transformer
              ref={trRef}
              rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
              rotationSnapTolerance={4}
              anchorSize={12}
              anchorCornerRadius={3}
              anchorStroke={ACCENT}
              anchorStrokeWidth={2}
              anchorFill="#ffffff"
              borderStroke={ACCENT}
              borderStrokeWidth={2}
              rotateAnchorOffset={30}
              // Invisible padding around each handle so it's easy to grab.
              anchorStyleFunc={(anchor) => {
                anchor.hitStrokeWidth(14);
                if (anchor.hasName("rotater")) anchor.cornerRadius(6);
              }}
              padding={2}
              ignoreStroke
              flipEnabled={false}
              onTransformEnd={handleTransformEnd}
              boundBoxFunc={(oldBox, newBox) => (Math.abs(newBox.width) < 8 || Math.abs(newBox.height) < 8 ? oldBox : newBox)}
            />

            {marquee && (
              <Rect
                x={Math.min(marquee.x0, marquee.x1)}
                y={Math.min(marquee.y0, marquee.y1)}
                width={Math.abs(marquee.x1 - marquee.x0)}
                height={Math.abs(marquee.y1 - marquee.y0)}
                fill="rgba(99, 102, 241, 0.08)"
                stroke={ACCENT}
                strokeWidth={1}
                dash={[4, 3]}
                listening={false}
              />
            )}
          </Layer>
        </Stage>
      )}

      {size.w > 0 &&
        boards.map((b) => (
          <FaceLabel
            key={b.index}
            index={b.index}
            side={b.side}
            active={b.side === side}
            left={b.x - bleed * zoom}
            top={b.y - bleed * zoom - 38}
          />
        ))}

      {editingEl && editingBoard && (
        <TextEditor
          key={editingEl.id}
          el={editingEl}
          zoom={zoom}
          left={editingBoard.x + editingEl.x * zoom}
          top={editingBoard.y + editingEl.y * zoom}
          onDone={(content) => {
            if (content !== null && content !== editingEl.content) updateElement(editingEl.id, { content });
            setEditingText(null);
          }}
        />
      )}
    </div>
  );
}
