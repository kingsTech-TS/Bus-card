"use client";
import { useRef, useState } from "react";
import { Type, Shapes, ImageIcon, Pencil, Sparkles, UploadCloud, Loader2, QrCode, Minus, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/store/editor.store";
import { useAssets, useUploadAsset } from "@/hooks/useAssets";
import { Skeleton } from "@/components/ui/skeleton";
import { SHAPES, SWATCHES } from "@/lib/editor";
import { AIPanel } from "./AIPanel";
import type { DesignElement } from "@/types";

type Tab = "text" | "elements" | "uploads" | "draw" | "ai";

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "text", label: "Text", icon: Type },
  { id: "elements", label: "Elements", icon: Shapes },
  { id: "uploads", label: "Uploads", icon: ImageIcon },
  { id: "draw", label: "Draw", icon: Pencil },
  { id: "ai", label: "AI", icon: Sparkles },
];

/** Add an element centred on the card. */
function useAddCentered() {
  const addElement = useEditorStore((s) => s.addElement);
  return (el: Omit<DesignElement, "id" | "x" | "y">, w: number, h: number) => {
    const { width, height } = useEditorStore.getState().design;
    addElement({ ...el, x: Math.round((width - w) / 2), y: Math.round((height - h) / 2) } as Omit<DesignElement, "id">);
  };
}

function TextTab() {
  const add = useAddCentered();
  const presets = [
    { label: "Add a heading", content: "Your Name", fontSize: 72, fontWeight: "bold", width: 640, cls: "text-xl font-bold" },
    { label: "Add a subheading", content: "Job Title", fontSize: 40, fontWeight: "normal", width: 520, cls: "text-base font-medium" },
    { label: "Add body text", content: "hello@example.com", fontSize: 28, fontWeight: "normal", width: 460, cls: "text-sm" },
  ];
  return (
    <div className="space-y-2">
      {presets.map((p) => (
        <button
          key={p.label}
          type="button"
          onClick={() =>
            add(
              {
                type: "text",
                content: p.content,
                fontSize: p.fontSize,
                fontFamily: "Inter",
                fontWeight: p.fontWeight,
                fill: "#111827",
                textAlign: "left",
                width: p.width,
              } as Omit<DesignElement, "id" | "x" | "y">,
              p.width,
              p.fontSize * 1.2
            )
          }
          className={cn(
            "w-full rounded-xl border border-border bg-background px-4 py-3 text-left transition-colors hover:border-primary/50 hover:bg-muted",
            p.cls
          )}
        >
          {p.label}
        </button>
      ))}
      <p className="pt-2 text-xs text-muted-foreground">Double-click text on the card to edit it.</p>
    </div>
  );
}

function ElementsTab() {
  const add = useAddCentered();
  return (
    <div className="space-y-5">
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground">Shapes</h4>
        <div className="grid grid-cols-3 gap-2">
          {SHAPES.map((s) => (
            <button
              key={s.type}
              type="button"
              title={s.label}
              onClick={() => add({ type: "shape", shapeType: s.type, fill: "#6366f1", width: 200, height: 200 } as Omit<DesignElement, "id" | "x" | "y">, 200, 200)}
              className="flex aspect-square flex-col items-center justify-center gap-1.5 rounded-xl border border-border bg-background transition-colors hover:border-primary/50 hover:bg-muted"
            >
              <ShapePreview type={s.type} />
              <span className="text-[10px] text-muted-foreground">{s.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 className="mb-2 text-xs font-medium text-muted-foreground">Lines & codes</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => add({ type: "shape", shapeType: "rect", fill: "#111827", width: 400, height: 6 } as Omit<DesignElement, "id" | "x" | "y">, 400, 6)}
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-muted"
          >
            <Minus className="size-5" />
            <span className="text-[10px] text-muted-foreground">Divider</span>
          </button>
          <button
            type="button"
            onClick={() => add({ type: "qr", value: "https://example.com", data: "", fill: "#000000", width: 180, height: 180 } as Omit<DesignElement, "id" | "x" | "y">, 180, 180)}
            className="flex h-16 flex-col items-center justify-center gap-1 rounded-xl border border-border bg-background hover:border-primary/50 hover:bg-muted"
          >
            <QrCode className="size-5" />
            <span className="text-[10px] text-muted-foreground">QR code</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ShapePreview({ type }: { type: string }) {
  const common = { className: "size-8 fill-primary/80" };
  switch (type) {
    case "circle":
      return <svg viewBox="0 0 32 32" {...common}><circle cx="16" cy="16" r="14" /></svg>;
    case "triangle":
      return <svg viewBox="0 0 32 32" {...common}><polygon points="16,2 30,30 2,30" /></svg>;
    case "diamond":
      return <svg viewBox="0 0 32 32" {...common}><polygon points="16,2 30,16 16,30 2,16" /></svg>;
    case "hexagon":
      return <svg viewBox="0 0 32 32" {...common}><polygon points="30,16 23,28 9,28 2,16 9,4 23,4" /></svg>;
    case "star":
      return <svg viewBox="0 0 32 32" {...common}><polygon points="16,2 19.5,11.5 30,12 22,18.5 25,29 16,23 7,29 10,18.5 2,12 12.5,11.5" /></svg>;
    default:
      return <svg viewBox="0 0 32 32" {...common}><rect x="3" y="7" width="26" height="18" rx="2" /></svg>;
  }
}

function UploadsTab() {
  const { data: assets, isLoading, isError } = useAssets();
  const { mutate: upload, isPending } = useUploadAsset();
  const fileRef = useRef<HTMLInputElement>(null);
  const add = useAddCentered();

  const addImage = (url: string) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const { width, height } = useEditorStore.getState().design;
      const scale = Math.min((width * 0.5) / img.naturalWidth, (height * 0.6) / img.naturalHeight, 1);
      const w = Math.round(img.naturalWidth * scale);
      const h = Math.round(img.naturalHeight * scale);
      add({ type: "image", url, width: w, height: h } as Omit<DesignElement, "id" | "x" | "y">, w, h);
    };
    img.onerror = () => add({ type: "image", url, width: 300, height: 300 } as Omit<DesignElement, "id" | "x" | "y">, 300, 300);
    img.src = url;
  };

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => fileRef.current?.click()}
        disabled={isPending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}
        {isPending ? "Uploading…" : "Upload image"}
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) upload(file, { onSuccess: (asset) => addImage(asset.url) });
          e.target.value = "";
        }}
      />

      {isLoading ? (
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="aspect-square rounded-xl" />)}
        </div>
      ) : isError ? (
        <p className="text-center text-xs text-destructive">Couldn&apos;t load your uploads.</p>
      ) : !assets?.length ? (
        <p className="py-8 text-center text-xs text-muted-foreground">Uploaded images will appear here.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {assets.map((a) => (
            <button
              key={a.id}
              type="button"
              title={a.filename}
              onClick={() => addImage(a.url)}
              className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-muted"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={a.url} alt={a.filename} className="size-full object-cover transition-transform group-hover:scale-105" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function DrawTab() {
  const drawColor = useEditorStore((s) => s.drawColor);
  const drawWidth = useEditorStore((s) => s.drawWidth);
  const { setDrawColor, setDrawWidth } = useEditorStore.getState();
  return (
    <div className="space-y-5">
      <p className="text-xs text-muted-foreground">Draw freely on the card. Press <kbd className="rounded border px-1">Esc</kbd> or pick another tool to stop.</p>
      <div className="space-y-2">
        <h4 className="text-xs font-medium text-muted-foreground">Colour</h4>
        <div className="grid grid-cols-5 gap-2">
          {SWATCHES.map((c) => (
            <button
              key={c}
              type="button"
              title={c}
              onClick={() => setDrawColor(c)}
              className={cn("aspect-square rounded-full border border-black/10 dark:border-white/15", drawColor === c && "ring-2 ring-primary ring-offset-2 ring-offset-background")}
              style={{ background: c }}
            />
          ))}
        </div>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="font-medium text-muted-foreground">Brush size</span>
          <span className="tabular-nums">{drawWidth}px</span>
        </div>
        <input type="range" min={1} max={40} value={drawWidth} onChange={(e) => setDrawWidth(Number(e.target.value))} className="w-full accent-primary" />
      </div>
    </div>
  );
}

export function LeftPanel() {
  const [tab, setTab] = useState<Tab | null>("text");
  const setTool = useEditorStore((s) => s.setTool);
  const tool = useEditorStore((s) => s.tool);

  const choose = (t: Tab) => {
    const next = tab === t ? null : t;
    setTab(next);
    setTool(next === "draw" ? "draw" : "select");
  };

  const active = tool === "draw" ? "draw" : tab;
  const current = TABS.find((t) => t.id === active);

  return (
    <div className="flex h-full shrink-0">
      <nav className="flex w-[72px] flex-col items-center gap-1 border-r border-border bg-card py-3">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => choose(id)}
            className={cn(
              "flex w-14 flex-col items-center gap-1 rounded-xl py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              active === id && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
            )}
          >
            <Icon className="size-5" />
            {label}
          </button>
        ))}
      </nav>

      {active && current && (
        <div className="flex w-72 flex-col border-r border-border bg-card">
          <div className="flex h-12 items-center justify-between border-b border-border px-4">
            <h2 className="text-sm font-semibold">{current.label}</h2>
            <button
              type="button"
              onClick={() => {
                setTab(null);
                setTool("select");
              }}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close panel"
            >
              <X className="size-4" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {active === "text" && <TextTab />}
            {active === "elements" && <ElementsTab />}
            {active === "uploads" && <UploadsTab />}
            {active === "draw" && <DrawTab />}
            {active === "ai" && <AIPanel />}
          </div>
        </div>
      )}
    </div>
  );
}
