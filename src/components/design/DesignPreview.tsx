"use client";
import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { cn } from "@/lib/utils";
import { fontStyleOf, getSide, normalizeDesign } from "@/lib/editor";
import type { CardSide, DesignElement, DesignSchema, QRElement } from "@/types";

/** SVG geometry matching the editor's Konva shapes (see EditorStage drawShape). */
function ShapeSvg({ type, w, h, fill }: { type: string; w: number; h: number; fill: string }) {
  const poly = (pts: [number, number][]) => <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={fill} />;
  let body: React.ReactNode;
  switch (type) {
    case "circle":
      body = <ellipse cx={w / 2} cy={h / 2} rx={w / 2} ry={h / 2} fill={fill} />;
      break;
    case "triangle":
      body = poly([[w / 2, 0], [w, h], [0, h]]);
      break;
    case "diamond":
      body = poly([[w / 2, 0], [w, h / 2], [w / 2, h], [0, h / 2]]);
      break;
    case "hexagon":
      body = poly(Array.from({ length: 6 }, (_, i) => {
        const a = (Math.PI / 3) * i;
        return [w / 2 + (w / 2) * Math.cos(a), h / 2 + (h / 2) * Math.sin(a)];
      }));
      break;
    case "star":
      body = poly(Array.from({ length: 10 }, (_, i) => {
        const r = i % 2 === 0 ? 1 : 0.4;
        const a = -Math.PI / 2 + (Math.PI / 5) * i;
        return [w / 2 + (w / 2) * r * Math.cos(a), h / 2 + (h / 2) * r * Math.sin(a)];
      }));
      break;
    default:
      body = <rect width={w} height={h} fill={fill} />;
  }
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="block overflow-visible">
      {body}
    </svg>
  );
}

function QRPreview({ el }: { el: QRElement }) {
  const [generated, setGenerated] = useState<string | null>(null);
  const hasImage = el.data?.startsWith("data:image");

  useEffect(() => {
    if (hasImage) return;
    let cancelled = false;
    QRCode.toDataURL(el.value || el.data || " ", { margin: 1, width: 256, color: { dark: el.fill ?? "#000000", light: "#ffffff" } })
      .then((url) => !cancelled && setGenerated(url))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hasImage, el.value, el.data, el.fill]);

  const src = hasImage ? el.data : generated;
  // eslint-disable-next-line @next/next/no-img-element
  return src ? <img src={src} alt="" className="block size-full" draggable={false} /> : null;
}

function ElementView({ el, width, height }: { el: DesignElement; width: number; height: number }) {
  const base: React.CSSProperties = {
    position: "absolute",
    left: el.x,
    top: el.y,
    opacity: el.opacity ?? 1,
    transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
    transformOrigin: "top left",
  };

  switch (el.type) {
    case "text": {
      const style = fontStyleOf(el.fontWeight);
      return (
        <div
          style={{
            ...base,
            width: el.width,
            fontSize: el.fontSize,
            fontFamily: el.fontFamily,
            fontWeight: style.includes("bold") ? 700 : 400,
            fontStyle: style.includes("italic") ? "italic" : "normal",
            color: el.fill,
            textAlign: (el.textAlign as React.CSSProperties["textAlign"]) ?? "left",
            lineHeight: 1.2,
            whiteSpace: el.width ? "pre-wrap" : "pre",
            overflowWrap: "break-word",
          }}
        >
          {el.content}
        </div>
      );
    }
    case "shape":
      return (
        <div style={base}>
          <ShapeSvg type={el.shapeType} w={el.width ?? 100} h={el.height ?? 100} fill={el.fill ?? "#000000"} />
        </div>
      );
    case "image":
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={el.url} alt="" draggable={false} style={{ ...base, width: el.width ?? 150, height: el.height ?? 150, objectFit: "fill" }} />
      );
    case "qr":
      return (
        <div style={{ ...base, width: el.width ?? 160, height: el.height ?? 160 }}>
          <QRPreview el={el} />
        </div>
      );
    case "draw":
      return (
        <svg width={width} height={height} style={{ position: "absolute", left: 0, top: 0, opacity: el.opacity ?? 1 }}>
          <polyline
            points={el.points.map((p) => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke={el.stroke}
            strokeWidth={el.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "line": {
      const pts: string[] = [];
      for (let i = 0; i < el.points.length; i += 2) pts.push(`${el.points[i]},${el.points[i + 1]}`);
      return (
        <svg width={width} height={height} style={{ ...base, overflow: "visible" }}>
          <polyline points={pts.join(" ")} fill="none" stroke={el.stroke} strokeWidth={el.strokeWidth} strokeDasharray={el.dash?.join(" ")} />
        </svg>
      );
    }
    default:
      return null;
  }
}

/** Static, scaled rendering of a card design that fills its container's width. */
export function DesignPreview({
  design: raw,
  side = "front",
  className,
}: {
  design?: DesignSchema | null;
  side?: CardSide;
  className?: string;
}) {
  const design = normalizeDesign(raw);
  const { background, elements } = getSide(design, side);
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setScale(entry.contentRect.width / design.width));
    ro.observe(el);
    return () => ro.disconnect();
  }, [design.width]);

  return (
    <div
      ref={ref}
      className={cn("relative w-full overflow-hidden", className)}
      style={{ aspectRatio: `${design.width} / ${design.height}`, background }}
    >
      {scale > 0 && (
        <div
          className="pointer-events-none absolute left-0 top-0 select-none"
          style={{ width: design.width, height: design.height, transform: `scale(${scale})`, transformOrigin: "top left" }}
          aria-hidden
        >
          {elements
            .filter((el) => el.isVisible !== false)
            .map((el) => (
              <ElementView key={el.id} el={el} width={design.width} height={design.height} />
            ))}
        </div>
      )}
    </div>
  );
}
