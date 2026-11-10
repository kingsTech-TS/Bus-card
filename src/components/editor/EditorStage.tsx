"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Konva from "konva";
import type { KonvaEventObject } from "konva/lib/Node";
import { Stage, Layer, Group, Rect, Text, Image as KonvaImage, Shape, Line, Transformer } from "react-konva";
import useImage from "use-image";
import QRCode from "qrcode";
import { useEditorStore } from "@/store/editor.store";
import { DEFAULT_BLEED, boundsOf, clamp, fontStyleOf } from "@/lib/editor";
import type {
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

type Guides = { x: number | null; y: number | null };

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

// ─── Element nodes ───────────────────────────────────────────────────────────

interface NodeProps {
  el: DesignElement;
  common: Konva.NodeConfig & Record<string, unknown>;
  onChange: (id: string, patch: ElementPatch) => void;
}

function resetScale(node: Konva.Node) {
  const sx = node.scaleX();
  const sy = node.scaleY();
  node.scaleX(1);
  node.scaleY(1);
  return { sx, sy };
}

/** Box-sized nodes (shapes, images, QR): fold scale into width/height. */
function boxTransformEnd(el: DesignElement, onChange: NodeProps["onChange"]) {
  return (e: KonvaEventObject<Event>) => {
    const node = e.target;
    const { sx, sy } = resetScale(node);
    onChange(el.id, {
      x: node.x(),
      y: node.y(),
      rotation: node.rotation(),
      width: Math.max(5, (el.width ?? 100) * sx),
      height: Math.max(5, (el.height ?? 100) * sy),
    });
  };
}

function TextNode({ el, common, onChange, hidden }: NodeProps & { el: TextElement; hidden: boolean }) {
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
        const anchor = node.getStage()?.findOne<Konva.Transformer>("Transformer")?.getActiveAnchor();
        // Side handles change the wrap width, corner handles scale the font.
        if (anchor === "middle-left" || anchor === "middle-right") {
          node.setAttrs({ width: Math.max(30, node.width() * node.scaleX()), scaleX: 1, scaleY: 1 });
        }
      }}
      onTransformEnd={(e) => {
        const node = e.target as Konva.Text;
        const { sx } = resetScale(node);
        const width = node.width() * sx;
        onChange(el.id, {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          width,
          fontSize: Math.max(4, Math.round(el.fontSize * sx)),
          height: node.height() * sx,
        });
      }}
    />
  );
}

function ShapeNode({ el, common, onChange }: NodeProps & { el: ShapeElement }) {
  return (
    <Shape
      {...common}
      width={el.width ?? 100}
      height={el.height ?? 100}
      fill={el.fill ?? "#000000"}
      sceneFunc={(ctx, shape) => drawShape(ctx, shape, el.shapeType)}
      onTransformEnd={boxTransformEnd(el, onChange)}
    />
  );
}

function ImageNode({ el, common, onChange }: NodeProps & { el: ImageElement }) {
  const [img, status] = useImage(el.url, "anonymous");
  const w = el.width ?? 150;
  const h = el.height ?? 150;
  if (!img) {
    return (
      <Rect
        {...common}
        width={w}
        height={h}
        fill={status === "failed" ? "#fee2e2" : "#e5e7eb"}
        onTransformEnd={boxTransformEnd(el, onChange)}
      />
    );
  }
  return <KonvaImage {...common} image={img} width={w} height={h} onTransformEnd={boxTransformEnd(el, onChange)} />;
}

function QRNode({ el, common, onChange }: NodeProps & { el: QRElement }) {
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
  if (!img) return <Rect {...common} {...size} fill="#f3f4f6" onTransformEnd={boxTransformEnd(el, onChange)} />;
  return <KonvaImage {...common} {...size} image={img} onTransformEnd={boxTransformEnd(el, onChange)} />;
}

/** Drawings keep absolute points (as the backend export expects); the node sits at 0,0. */
function DrawNode({ el, common, onChange }: NodeProps & { el: DrawElement }) {
  const bake = (node: Konva.Node, mapPoint: (p: Point) => Point) => {
    const points = el.points.map(mapPoint);
    node.setAttrs({ x: 0, y: 0, scaleX: 1, scaleY: 1, rotation: 0 });
    const b = boundsOf(points);
    onChange(el.id, { points, x: b.x, y: b.y, width: b.width, height: b.height });
  };
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
      onTransformEnd={(e) => {
        const t = e.target.getTransform().copy();
        bake(e.target, (p) => t.point(p));
      }}
    />
  );
}

function LineNode({ el, common, onChange }: NodeProps & { el: LineElement }) {
  return (
    <Line
      {...common}
      points={el.points}
      stroke={el.stroke}
      strokeWidth={el.strokeWidth}
      dash={el.dash ?? undefined}
      hitStrokeWidth={Math.max(16, el.strokeWidth)}
      onTransformEnd={(e) => {
        const node = e.target;
        const { sx, sy } = resetScale(node);
        onChange(el.id, {
          x: node.x(),
          y: node.y(),
          rotation: node.rotation(),
          points: el.points.map((v, i) => (i % 2 === 0 ? v * sx : v * sy)),
        });
      }}
    />
  );
}

// ─── Inline text editor ──────────────────────────────────────────────────────

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

// ─── Stage ───────────────────────────────────────────────────────────────────

export default function EditorStage() {
  const design = useEditorStore((s) => s.design);
  const selectedId = useEditorStore((s) => s.selectedId);
  const editingTextId = useEditorStore((s) => s.editingTextId);
  const tool = useEditorStore((s) => s.tool);
  const drawColor = useEditorStore((s) => s.drawColor);
  const drawWidth = useEditorStore((s) => s.drawWidth);
  const zoom = useEditorStore((s) => s.zoom);
  const autoFit = useEditorStore((s) => s.autoFit);
  const fitNonce = useEditorStore((s) => s.fitNonce);
  const showGuides = useEditorStore((s) => s.showGuides);
  const showGrid = useEditorStore((s) => s.showGrid);
  const { select, setEditingText, updateElement, addElement, setZoom } = useEditorStore.getState();

  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const cardRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);

  const [size, setSize] = useState({ w: 0, h: 0 });
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [guides, setGuides] = useState<Guides>({ x: null, y: null });
  const [drawing, setDrawing] = useState<Point[] | null>(null);
  const [spaceDown, setSpaceDown] = useState(false);
  const [fontsVersion, setFontsVersion] = useState(0);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  const W = design.width;
  const H = design.height;
  const bleed = design.bleed_area ?? DEFAULT_BLEED;

  // Track container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setSize({ w: entry.contentRect.width, h: entry.contentRect.height });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Fit card to the viewport on load, on request, and on resize while auto-fitting
  useEffect(() => {
    if (!size.w || !size.h || !autoFit) return;
    const fit = Math.min((size.w - PADDING * 2) / W, (size.h - PADDING * 2) / H);
    setZoom(clamp(fit, 0.1, 2), true);
    setPan({ x: 0, y: 0 });
  }, [size.w, size.h, W, H, autoFit, fitNonce, setZoom]);

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
  const originY = (size.h - H * zoom) / 2 + pan.y;

  const selected = design.elements.find((el) => el.id === selectedId) ?? null;

  // Attach the transformer to the selected node
  useEffect(() => {
    const tr = trRef.current;
    const stage = stageRef.current;
    if (!tr || !stage) return;
    const node =
      selected && selected.isVisible !== false && editingTextId !== selected.id && tool === "select"
        ? stage.findOne(`#${CSS.escape(selected.id)}`)
        : null;
    tr.nodes(node ? [node] : []);

    if (selected) {
      const locked = !!selected.isLocked;
      const anchors =
        locked ? []
        : selected.type === "text" ? ["top-left", "top-right", "bottom-left", "bottom-right", "middle-left", "middle-right"]
        : selected.type === "image" || selected.type === "qr" ? ["top-left", "top-right", "bottom-left", "bottom-right"]
        : undefined;
      tr.setAttrs({
        enabledAnchors: anchors ?? ["top-left", "top-center", "top-right", "middle-left", "middle-right", "bottom-left", "bottom-center", "bottom-right"],
        rotateEnabled: !locked,
        keepRatio: selected.type !== "shape",
        borderDash: locked ? [4, 4] : undefined,
      });
    }
    tr.getLayer()?.batchDraw();
  }, [selected, editingTextId, tool, fontsVersion]);

  const onChange = useCallback(
    (id: string, patch: ElementPatch) => updateElement(id, patch),
    [updateElement]
  );

  /** Card-space pointer position */
  const pointer = (): Point | null => {
    const p = stageRef.current?.getPointerPosition();
    if (!p) return null;
    return { x: (p.x - originX) / zoom, y: (p.y - originY) / zoom };
  };

  // Snap to card edges / centre while dragging
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    const card = cardRef.current;
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

  const commonFor = (el: DesignElement) => ({
    id: el.id,
    name: "element",
    x: el.x,
    y: el.y,
    rotation: el.rotation ?? 0,
    opacity: el.opacity ?? 1,
    draggable: tool === "select" && !el.isLocked && !spaceDown,
    listening: tool === "select" && !spaceDown,
    onMouseDown: () => select(el.id),
    onTouchStart: () => select(el.id),
    onDragStart: () => select(el.id),
    onDragMove: handleDragMove,
    onDragEnd: (e: KonvaEventObject<DragEvent>) => {
      setGuides({ x: null, y: null });
      const node = e.target;
      if (el.type === "draw") {
        // Bake the drag offset into the absolute points.
        const dx = node.x();
        const dy = node.y();
        node.position({ x: 0, y: 0 });
        const points = el.points.map((p) => ({ x: p.x + dx, y: p.y + dy }));
        onChange(el.id, { points, ...boundsOf(points) });
        return;
      }
      onChange(el.id, { x: node.x(), y: node.y() });
    },
    onMouseEnter: (e: KonvaEventObject<MouseEvent>) => {
      const c = e.target.getStage()?.container();
      if (c) c.style.cursor = el.isLocked ? "default" : "move";
    },
    onMouseLeave: (e: KonvaEventObject<MouseEvent>) => {
      const c = e.target.getStage()?.container();
      if (c) c.style.cursor = "";
    },
    onDblClick: () => el.type === "text" && !el.isLocked && setEditingText(el.id),
    onDblTap: () => el.type === "text" && !el.isLocked && setEditingText(el.id),
  });

  // ── Stage pointer handlers: deselect, pan, draw ──
  const handleDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    const evt = e.evt as MouseEvent;
    const p = stageRef.current?.getPointerPosition();
    if (p && (spaceDown || evt.button === 1)) {
      panStart.current = { x: p.x, y: p.y, panX: pan.x, panY: pan.y };
      return;
    }
    if (tool === "draw") {
      const pt = pointer();
      if (pt) setDrawing([pt]);
      return;
    }
    const target = e.target;
    if (target === target.getStage() || target.name() === "card-bg") select(null);
  };

  const handleMove = () => {
    const p = stageRef.current?.getPointerPosition();
    if (panStart.current && p) {
      setPan({
        x: panStart.current.panX + p.x - panStart.current.x,
        y: panStart.current.panY + p.y - panStart.current.y,
      });
      return;
    }
    if (drawing) {
      const pt = pointer();
      if (pt) setDrawing((d) => (d ? [...d, pt] : d));
    }
  };

  const handleUp = () => {
    panStart.current = null;
    if (drawing) {
      if (drawing.length > 1) {
        const b = boundsOf(drawing);
        addElement({
          type: "draw",
          points: drawing,
          stroke: drawColor,
          strokeWidth: drawWidth,
          lineCap: "round",
          lineJoin: "round",
          ...b,
        } as Omit<DrawElement, "id">);
        select(null);
      }
      setDrawing(null);
    }
  };

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const p = stageRef.current?.getPointerPosition();
    if (!p) return;
    if (e.evt.ctrlKey || e.evt.metaKey) {
      // Zoom towards the cursor
      const next = clamp(zoom * (e.evt.deltaY > 0 ? 1 / 1.08 : 1.08), 0.1, 5);
      const cardPt = { x: (p.x - originX) / zoom, y: (p.y - originY) / zoom };
      const newOriginX = p.x - cardPt.x * next;
      const newOriginY = p.y - cardPt.y * next;
      setPan({
        x: newOriginX - (size.w - W * next) / 2,
        y: newOriginY - (size.h - H * next) / 2,
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

  const editingEl = design.elements.find((el) => el.id === editingTextId && el.type === "text") as TextElement | undefined;

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
            <Group ref={cardRef} x={originX} y={originY} scaleX={zoom} scaleY={zoom}>
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
                width={W}
                height={H}
                fill={design.background ?? "#ffffff"}
                shadowColor="#000000"
                shadowBlur={24}
                shadowOpacity={0.18}
                shadowOffsetY={6}
              />
              <Group clipX={0} clipY={0} clipWidth={W} clipHeight={H}>
                {design.elements.map((el) => {
                  if (el.isVisible === false) return null;
                  const props = { el, common: commonFor(el), onChange } as const;
                  switch (el.type) {
                    case "text":
                      return (
                        <TextNode
                          key={`${el.id}:${fontsVersion}`}
                          {...props}
                          el={el}
                          hidden={editingTextId === el.id}
                        />
                      );
                    case "shape":
                      return <ShapeNode key={el.id} {...props} el={el} />;
                    case "image":
                      return <ImageNode key={el.id} {...props} el={el} />;
                    case "qr":
                      return <QRNode key={el.id} {...props} el={el} />;
                    case "draw":
                      return <DrawNode key={el.id} {...props} el={el} />;
                    case "line":
                      return <LineNode key={el.id} {...props} el={el} />;
                    default:
                      return null;
                  }
                })}
                {drawing && (
                  <Line
                    points={drawing.flatMap((p) => [p.x, p.y])}
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
              {guides.x !== null && (
                <Line points={[guides.x, -bleed, guides.x, H + bleed]} stroke={SNAP_COLOR} strokeWidth={1 / zoom} listening={false} />
              )}
              {guides.y !== null && (
                <Line points={[-bleed, guides.y, W + bleed, guides.y]} stroke={SNAP_COLOR} strokeWidth={1 / zoom} listening={false} />
              )}
            </Group>

            <Transformer
              ref={trRef}
              rotationSnaps={[0, 45, 90, 135, 180, 225, 270, 315]}
              rotationSnapTolerance={4}
              anchorSize={9}
              anchorCornerRadius={5}
              anchorStroke={ACCENT}
              anchorFill="#ffffff"
              borderStroke={ACCENT}
              borderStrokeWidth={1.5}
              rotateAnchorOffset={28}
              padding={2}
              ignoreStroke
              flipEnabled={false}
              boundBoxFunc={(oldBox, newBox) =>
                Math.abs(newBox.width) < 8 || Math.abs(newBox.height) < 8 ? oldBox : newBox
              }
            />
          </Layer>
        </Stage>
      )}

      {editingEl && (
        <TextEditor
          key={editingEl.id}
          el={editingEl}
          zoom={zoom}
          left={originX + editingEl.x * zoom}
          top={originY + editingEl.y * zoom}
          onDone={(content) => {
            if (content !== null && content !== editingEl.content) {
              updateElement(editingEl.id, { content });
            }
            setEditingText(null);
          }}
        />
      )}
    </div>
  );
}
