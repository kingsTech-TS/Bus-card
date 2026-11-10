"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SWATCHES } from "@/lib/editor";

export function PanelSection({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3 border-b border-border px-4 py-4 last:border-b-0">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

/**
 * Numeric input that lets you type freely.
 * By default valid numbers apply as you type; with `commitOnBlur` they apply on Enter or when the
 * field loses focus (use this when each change is relative, e.g. scaling a group).
 */
export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  disabled,
  commitOnBlur = false,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  disabled?: boolean;
  commitOnBlur?: boolean;
}) {
  const rounded = Math.round(value * 100) / 100;
  // While focused, show what the user typed; otherwise mirror the live value.
  const [draft, setDraft] = useState<string | null>(null);

  const parse = (raw: string) => {
    const n = Number(raw);
    return raw !== "" && Number.isFinite(n) ? Math.min(max ?? Infinity, Math.max(min ?? -Infinity, n)) : null;
  };
  const commit = () => {
    if (draft === null) return;
    const n = parse(draft);
    if (n !== null && n !== rounded) onChange(n);
  };

  return (
    <label className={cn("flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-2 text-xs focus-within:ring-2 focus-within:ring-ring/50", disabled && "opacity-50")}>
      <span className="w-4 shrink-0 font-medium text-muted-foreground">{label}</span>
      <input
        type="number"
        className="w-full min-w-0 bg-transparent tabular-nums outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
        value={draft ?? String(rounded)}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onFocus={() => setDraft(String(rounded))}
        onBlur={() => {
          if (commitOnBlur) commit();
          setDraft(null);
        }}
        onKeyDown={(e) => {
          // Enter just leaves the field; onBlur applies the value exactly once.
          if (commitOnBlur && e.key === "Enter") (e.target as HTMLInputElement).blur();
        }}
        onChange={(e) => {
          setDraft(e.target.value);
          if (commitOnBlur) return;
          const n = parse(e.target.value);
          if (n !== null) onChange(n);
        }}
      />
      {suffix && <span className="shrink-0 text-muted-foreground">{suffix}</span>}
    </label>
  );
}

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

export function ColorField({
  value,
  onChange,
  extraSwatches = [],
}: {
  value: string;
  onChange: (v: string) => void;
  extraSwatches?: string[];
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const swatches = Array.from(new Set([...extraSwatches, ...SWATCHES])).slice(0, 20);

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label
          className="relative size-8 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-input shadow-sm"
          style={{ background: value }}
        >
          <input
            type="color"
            className="absolute inset-0 cursor-pointer opacity-0"
            value={HEX.test(value) && value.length === 7 ? value : "#000000"}
            onChange={(e) => onChange(e.target.value)}
            aria-label="Pick colour"
          />
        </label>
        <input
          className="h-8 w-full min-w-0 rounded-lg border border-input bg-background px-2 font-mono text-xs uppercase outline-none focus:ring-2 focus:ring-ring/50"
          value={draft ?? value}
          onFocus={() => setDraft(value)}
          onChange={(e) => {
            setDraft(e.target.value);
            if (HEX.test(e.target.value)) onChange(e.target.value);
          }}
          onBlur={() => setDraft(null)}
        />
      </div>
      <div className="grid grid-cols-10 gap-1">
        {swatches.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(c)}
            className={cn(
              "aspect-square rounded-md border border-black/10 transition-transform hover:scale-110 dark:border-white/15",
              value.toLowerCase() === c.toLowerCase() && "ring-2 ring-primary ring-offset-1 ring-offset-background"
            )}
            style={{ background: c }}
          />
        ))}
      </div>
    </div>
  );
}

export function IconToggle({
  active,
  onClick,
  title,
  children,
  disabled,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40",
        active && "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
      )}
    >
      {children}
    </button>
  );
}
