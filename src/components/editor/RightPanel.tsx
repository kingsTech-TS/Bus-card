"use client";
import { useState } from "react";
import {
  AlignCenter, AlignLeft, AlignRight, ArrowDown, ArrowDownToLine, ArrowUp, ArrowUpToLine, Bold, Copy,
  Eye, EyeOff, ImageIcon, Italic, Loader2, Lock, Minus, PenLine, QrCode, Shapes, Trash2, Type, Unlock, Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore, selectSelectedElement } from "@/store/editor.store";
import { useImproveText } from "@/hooks/useAI";
import { FONT_FAMILIES, SHAPES, elementLabel, fontStyleOf } from "@/lib/editor";
import type { DesignElement, ElementPatch } from "@/types";
import { ColorField, IconToggle, NumberField, PanelSection } from "./fields";

const TYPE_ICON: Record<DesignElement["type"], React.ElementType> = {
  text: Type,
  shape: Shapes,
  image: ImageIcon,
  qr: QrCode,
  draw: PenLine,
  line: Minus,
};

const PX_PER_INCH = 300;

function CardSettings() {
  const design = useEditorStore((s) => s.design);
  const showGuides = useEditorStore((s) => s.showGuides);
  const showGrid = useEditorStore((s) => s.showGrid);
  const { setBackground, toggleGuides, toggleGrid } = useEditorStore.getState();
  const dpi = design.dpi ?? PX_PER_INCH;

  return (
    <>
      <PanelSection title="Card">
        <dl className="grid grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">Size</dt>
            <dd className="font-medium tabular-nums">{(design.width / dpi).toFixed(2)} × {(design.height / dpi).toFixed(2)} in</dd>
          </div>
          <div className="rounded-lg bg-muted/60 px-3 py-2">
            <dt className="text-muted-foreground">Pixels</dt>
            <dd className="font-medium tabular-nums">{design.width} × {design.height}</dd>
          </div>
        </dl>
      </PanelSection>
      <PanelSection title="Background">
        <ColorField value={design.background ?? "#ffffff"} onChange={setBackground} extraSwatches={design.brand_kit?.colors} />
      </PanelSection>
      <PanelSection title="View">
        <label className="flex items-center justify-between text-sm">
          <span>Bleed & safe-zone guides</span>
          <input type="checkbox" checked={showGuides} onChange={toggleGuides} className="size-4 accent-primary" />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span>Grid</span>
          <input type="checkbox" checked={showGrid} onChange={toggleGrid} className="size-4 accent-primary" />
        </label>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Keep important content inside the dashed safe zone. The red line marks the bleed edge used when printing.
        </p>
      </PanelSection>
    </>
  );
}

function ElementSettings({ el }: { el: DesignElement }) {
  const brandColors = useEditorStore((s) => s.design.brand_kit?.colors);
  const { updateElement, duplicateElement, removeElement, toggleLock, toggleVisibility, moveLayer } = useEditorStore.getState();
  const { mutate: improveText, isPending: improving } = useImproveText();
  const locked = !!el.isLocked;
  const Icon = TYPE_ICON[el.type];

  const set = (patch: ElementPatch, field?: string) =>
    updateElement(el.id, patch, field ? { coalesce: `${el.id}:${field}` } : undefined);

  const isBox = el.type !== "draw" && el.type !== "line";

  return (
    <>
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <span className="flex-1 truncate text-sm font-medium">{elementLabel(el)}</span>
        <IconToggle title="Duplicate (Ctrl+D)" onClick={() => duplicateElement(el.id)}><Copy className="size-4" /></IconToggle>
        <IconToggle title={locked ? "Unlock" : "Lock"} active={locked} onClick={() => toggleLock(el.id)}>
          {locked ? <Lock className="size-4" /> : <Unlock className="size-4" />}
        </IconToggle>
        <IconToggle title="Hide" onClick={() => toggleVisibility(el.id)}><EyeOff className="size-4" /></IconToggle>
        <IconToggle title="Delete (Del)" onClick={() => removeElement(el.id)} disabled={locked}>
          <Trash2 className="size-4 text-destructive" />
        </IconToggle>
      </div>

      {locked && (
        <p className="mx-4 mt-3 rounded-lg bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          This element is locked. Unlock it to move or edit.
        </p>
      )}

      <fieldset disabled={locked} className="contents">
        {el.type === "text" && (
          <PanelSection
            title="Text"
            action={
              <button
                type="button"
                disabled={improving || locked || !el.content.trim()}
                onClick={() =>
                  improveText(
                    { text: el.content, tone: "professional" },
                    { onSuccess: (d) => updateElement(el.id, { content: d.improved_text }) }
                  )
                }
                className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/10 disabled:opacity-50"
              >
                {improving ? <Loader2 className="size-3 animate-spin" /> : <Wand2 className="size-3" />}
                Improve with AI
              </button>
            }
          >
            <textarea
              value={el.content}
              rows={2}
              onChange={(e) => set({ content: e.target.value }, "content")}
              className="w-full resize-y rounded-lg border border-input bg-background px-2.5 py-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            />
            <select
              value={el.fontFamily}
              onChange={(e) => set({ fontFamily: e.target.value })}
              className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm outline-none focus:ring-2 focus:ring-ring/50"
              style={{ fontFamily: el.fontFamily }}
            >
              {!FONT_FAMILIES.includes(el.fontFamily as (typeof FONT_FAMILIES)[number]) && <option value={el.fontFamily}>{el.fontFamily}</option>}
              {FONT_FAMILIES.map((f) => (
                <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
              ))}
            </select>
            <div className="flex items-center gap-1">
              <div className="w-24">
                <NumberField label="Aa" value={el.fontSize} min={4} max={400} onChange={(v) => set({ fontSize: Math.round(v) }, "fontSize")} />
              </div>
              <div className="ml-auto flex items-center">
                {(() => {
                  const style = fontStyleOf(el.fontWeight);
                  const bold = style.includes("bold");
                  const italic = style.includes("italic");
                  const compose = (b: boolean, i: boolean) => (b && i ? "italic bold" : b ? "bold" : i ? "italic" : "normal");
                  return (
                    <>
                      <IconToggle title="Bold" active={bold} onClick={() => set({ fontWeight: compose(!bold, italic) })}><Bold className="size-4" /></IconToggle>
                      <IconToggle title="Italic" active={italic} onClick={() => set({ fontWeight: compose(bold, !italic) })}><Italic className="size-4" /></IconToggle>
                    </>
                  );
                })()}
                <div className="mx-1 h-5 w-px bg-border" />
                {([["left", AlignLeft], ["center", AlignCenter], ["right", AlignRight]] as const).map(([a, A]) => (
                  <IconToggle key={a} title={`Align ${a}`} active={(el.textAlign ?? "left") === a} onClick={() => set({ textAlign: a })}>
                    <A className="size-4" />
                  </IconToggle>
                ))}
              </div>
            </div>
            <ColorField value={el.fill} onChange={(c) => set({ fill: c }, "fill")} extraSwatches={brandColors} />
          </PanelSection>
        )}

        {el.type === "shape" && (
          <PanelSection title="Shape">
            <div className="grid grid-cols-6 gap-1">
              {SHAPES.map((s) => (
                <button
                  key={s.type}
                  type="button"
                  title={s.label}
                  onClick={() => set({ shapeType: s.type })}
                  className={cn(
                    "rounded-md border border-border py-1 text-[10px] hover:bg-muted",
                    el.shapeType === s.type && "border-primary bg-primary/10 text-primary"
                  )}
                >
                  {s.label.slice(0, 4)}
                </button>
              ))}
            </div>
            <ColorField value={el.fill ?? "#000000"} onChange={(c) => set({ fill: c }, "fill")} extraSwatches={brandColors} />
          </PanelSection>
        )}

        {el.type === "qr" && (
          <PanelSection title="QR code">
            <input
              value={el.value ?? ""}
              onChange={(e) => set({ value: e.target.value }, "value")}
              placeholder="https://your-site.com"
              className="h-8 w-full rounded-lg border border-input bg-background px-2.5 text-sm outline-none focus:ring-2 focus:ring-ring/50"
            />
            <ColorField value={el.fill ?? "#000000"} onChange={(c) => set({ fill: c }, "fill")} extraSwatches={brandColors} />
          </PanelSection>
        )}

        {(el.type === "draw" || el.type === "line") && (
          <PanelSection title="Stroke">
            <div className="w-28">
              <NumberField label="W" value={el.strokeWidth} min={1} max={100} onChange={(v) => set({ strokeWidth: Math.round(v) }, "strokeWidth")} suffix="px" />
            </div>
            <ColorField value={el.stroke} onChange={(c) => set({ stroke: c }, "stroke")} extraSwatches={brandColors} />
          </PanelSection>
        )}

        <PanelSection title="Position & size">
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="X" value={el.x} onChange={(v) => set({ x: v }, "x")} disabled={el.type === "draw"} />
            <NumberField label="Y" value={el.y} onChange={(v) => set({ y: v }, "y")} disabled={el.type === "draw"} />
            {isBox && (
              <>
                <NumberField label="W" value={el.width ?? 0} min={5} onChange={(v) => set({ width: v }, "width")} />
                {el.type !== "text" && <NumberField label="H" value={el.height ?? 0} min={5} onChange={(v) => set({ height: v }, "height")} />}
              </>
            )}
            {el.type !== "draw" && (
              <NumberField label="↻" value={el.rotation ?? 0} min={-360} max={360} suffix="°" onChange={(v) => set({ rotation: v }, "rotation")} />
            )}
          </div>
          <div className="space-y-1.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Opacity</span>
              <span className="tabular-nums">{Math.round((el.opacity ?? 1) * 100)}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round((el.opacity ?? 1) * 100)}
              onChange={(e) => set({ opacity: Number(e.target.value) / 100 }, "opacity")}
              className="w-full accent-primary"
            />
          </div>
        </PanelSection>

        <PanelSection title="Arrange">
          <div className="grid grid-cols-4 gap-1">
            <IconToggle title="Bring to front (Ctrl+Shift+])" onClick={() => moveLayer(el.id, "top")}><ArrowUpToLine className="size-4" /></IconToggle>
            <IconToggle title="Bring forward (Ctrl+])" onClick={() => moveLayer(el.id, "up")}><ArrowUp className="size-4" /></IconToggle>
            <IconToggle title="Send backward (Ctrl+[)" onClick={() => moveLayer(el.id, "down")}><ArrowDown className="size-4" /></IconToggle>
            <IconToggle title="Send to back (Ctrl+Shift+[)" onClick={() => moveLayer(el.id, "bottom")}><ArrowDownToLine className="size-4" /></IconToggle>
          </div>
        </PanelSection>
      </fieldset>
    </>
  );
}

function LayersList() {
  const elements = useEditorStore((s) => s.design.elements);
  const selectedId = useEditorStore((s) => s.selectedId);
  const { select, toggleLock, toggleVisibility, moveLayer } = useEditorStore.getState();

  if (elements.length === 0) {
    return <p className="px-4 py-10 text-center text-sm text-muted-foreground">No layers yet. Add text or elements from the left.</p>;
  }

  return (
    <ul className="space-y-0.5 p-2">
      {[...elements].reverse().map((el, i) => {
        const Icon = TYPE_ICON[el.type];
        const hidden = el.isVisible === false;
        return (
          <li
            key={el.id}
            onClick={() => !hidden && select(el.id)}
            className={cn(
              "group flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-muted",
              selectedId === el.id && "bg-primary/10 text-primary hover:bg-primary/15",
              hidden && "opacity-50"
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span className="flex-1 truncate">{elementLabel(el)}</span>
            <div className="flex items-center opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" title="Move up" disabled={i === 0} onClick={(e) => { e.stopPropagation(); moveLayer(el.id, "up"); }} className="rounded p-1 hover:bg-background disabled:opacity-30"><ArrowUp className="size-3.5" /></button>
              <button type="button" title="Move down" disabled={i === elements.length - 1} onClick={(e) => { e.stopPropagation(); moveLayer(el.id, "down"); }} className="rounded p-1 hover:bg-background disabled:opacity-30"><ArrowDown className="size-3.5" /></button>
            </div>
            <button
              type="button"
              title={el.isLocked ? "Unlock" : "Lock"}
              onClick={(e) => { e.stopPropagation(); toggleLock(el.id); }}
              className={cn("rounded p-1 hover:bg-background", !el.isLocked && "opacity-0 group-hover:opacity-100")}
            >
              {el.isLocked ? <Lock className="size-3.5" /> : <Unlock className="size-3.5" />}
            </button>
            <button
              type="button"
              title={hidden ? "Show" : "Hide"}
              onClick={(e) => { e.stopPropagation(); toggleVisibility(el.id); }}
              className={cn("rounded p-1 hover:bg-background", !hidden && "opacity-0 group-hover:opacity-100")}
            >
              {hidden ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function RightPanel() {
  const [tab, setTab] = useState<"design" | "layers">("design");
  const selected = useEditorStore(selectSelectedElement);
  const count = useEditorStore((s) => s.design.elements.length);

  return (
    <aside className="flex h-full w-72 shrink-0 flex-col border-l border-border bg-card">
      <div className="flex h-12 shrink-0 items-center gap-1 border-b border-border px-2">
        {(["design", "layers"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={cn(
              "flex-1 rounded-lg py-1.5 text-sm font-medium capitalize text-muted-foreground transition-colors hover:text-foreground",
              tab === t && "bg-muted text-foreground"
            )}
          >
            {t === "design" ? (selected ? "Properties" : "Design") : `Layers (${count})`}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto">
        {tab === "layers" ? <LayersList /> : selected ? <ElementSettings key={selected.id} el={selected} /> : <CardSettings />}
      </div>
    </aside>
  );
}
