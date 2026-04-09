"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Minus, 
  Layers, 
  MousePointer2, 
  Type, 
  Square, 
  Image as ImageIcon, 
  Grid3X3,
  Undo2,
  Redo2,
  Save,
  Download,
  ChevronLeft,
  Pencil,
  Minus as LineIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { EditorToolbox } from "./EditorToolbox";

// --- Sub-components ---

const Ruler = ({ orientation }: { orientation: "horizontal" | "vertical" }) => {
  const length = orientation === "horizontal" ? 1000 : 800;
  const marks = Array.from({ length: length / 10 });

  return (
    <div className={cn(
      "absolute bg-zinc-900 border-zinc-800 text-[8px] text-zinc-600 flex overflow-hidden pointer-events-none z-10",
      orientation === "horizontal" ? "top-0 left-8 right-0 h-6 border-b" : "top-8 left-0 bottom-0 w-8 border-r flex-col"
    )}>
      {marks.map((_, i) => (
        <div 
          key={i} 
          className={cn(
            "flex-shrink-0 border-zinc-800 flex items-end justify-center pb-0.5",
            orientation === "horizontal" ? "w-[10px] border-r h-full" : "h-[10px] border-b w-full flex-row items-center justify-end pr-0.5"
          )}
        >
          {i % 5 === 0 && (
            <span className={orientation === "horizontal" ? "mb-0.5" : "mr-0.5"}>{i * 10}</span>
          )}
        </div>
      ))}
    </div>
  );
};

const GridOverlay = () => (
  <div 
    className="absolute inset-0 pointer-events-none opacity-[0.03]" 
    style={{ 
      backgroundImage: `
        linear-gradient(to right, white 1px, transparent 1px),
        linear-gradient(to bottom, white 1px, transparent 1px)
      `,
      backgroundSize: '20px 20px'
    }} 
  />
);

const CardGuides = ({ show, baseWidth, baseHeight, bleed }: { show: boolean, baseWidth: number, baseHeight: number, bleed: number }) => {
  if (!show) return null;
  return (
    <>
      {/* Bleed Area */}
      <div
        className="absolute border border-red-500/20 bg-red-500/5 rounded-sm pointer-events-none"
        style={{
          width: baseWidth + bleed * 2,
          height: baseHeight + bleed * 2,
        }}
      >
        <div className="absolute -top-5 left-0 text-[9px] uppercase tracking-widest text-red-500/40 font-medium">
          Bleed Area
        </div>
      </div>
      
      {/* Safe Zone (Inside Card) */}
      <div
        className="absolute border border-dashed border-indigo-500/30 pointer-events-none z-20"
        style={{
          width: baseWidth - 24,
          height: baseHeight - 24,
        }}
      >
        <div className="absolute -top-4 left-0 text-[8px] uppercase tracking-tighter text-indigo-500/40 font-semibold">
          Safe Zone
        </div>
      </div>
    </>
  );
};

// --- Main Editor Canvas ---

export function EditorCanvas() {
  const router = useRouter();
  const [zoom, setZoom] = useState(1.2);
  const [showGuides, setShowGuides] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  // Business Card Base Dimensions (96 DPI)
  const baseWidth = 336; // 3.5"
  const baseHeight = 192; // 2"
  const bleed = 12; // 0.125"

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.1, 0.5));
  const handleResetZoom = () => setZoom(1);

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-zinc-950 select-none">
      {/* Rulers */}
      <Ruler orientation="horizontal" />
      <Ruler orientation="vertical" />
      <div className="absolute top-0 left-0 w-8 h-6 bg-zinc-900 border-b border-r border-zinc-800 z-20 flex items-center justify-center">
        <div className="w-2 h-2 border border-zinc-700 rounded-sm" />
      </div>

      {/* Main Workspace */}
      <div className="relative flex-1 flex items-center justify-center overflow-auto scrollbar-hide p-8 md:p-12 lg:p-20 pt-24 pl-32">
        {/* Workspace Background Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
        
        {showGrid && <GridOverlay />}

        {/* Canvas Scalable Container */}
        <div
          className="relative transition-transform duration-200 ease-out flex items-center justify-center"
          style={{ transform: `scale(${zoom})` }}
        >
          <CardGuides show={showGuides} baseWidth={baseWidth} baseHeight={baseHeight} bleed={bleed} />

          {/* Actual Card Surface */}
          <div
            className="relative bg-white shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden group border border-white/10"
            style={{
              width: baseWidth,
              height: baseHeight,
            }}
          >
            {/* Design Elements Placeholder */}
            <div className="absolute inset-0 p-6 flex flex-col justify-between z-10">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 bg-zinc-900 rounded-md flex items-center justify-center shadow-lg">
                  <div className="w-5 h-5 border-2 border-white rotate-45" />
                </div>
                <div className="text-right">
                  <div className="text-[8px] font-bold uppercase tracking-tighter text-zinc-400">Design</div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-zinc-900 -mt-1">Studio</div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="group/text relative cursor-text">
                  <h1 className="text-lg font-bold text-zinc-900 leading-tight tracking-tight">Alex Rivera</h1>
                  <div className="absolute -inset-1 border border-blue-500/0 group-hover/text:border-blue-500/40 rounded transition-colors" />
                </div>
                <div className="group/text relative cursor-text">
                  <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-[0.2em]">Senior Product Designer</p>
                  <div className="absolute -inset-1 border border-blue-500/0 group-hover/text:border-blue-500/40 rounded transition-colors" />
                </div>
              </div>

              <div className="w-12 h-[2px] bg-zinc-900 rounded-full" />

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <p className="text-[7px] text-zinc-400 uppercase font-black">Phone</p>
                  <p className="text-[8px] text-zinc-800 font-bold">+1 (555) 000-1234</p>
                </div>
                <div className="space-y-0.5">
                  <p className="text-[7px] text-zinc-400 uppercase font-black">Email</p>
                  <p className="text-[8px] text-zinc-800 font-bold italic">hello@alexrivera.design</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Floating UI Controls --- */}

      {/* Top Bar (Actions) */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-4 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => router.back()}
          className="bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-lg shadow-2xl w-10 h-10 text-zinc-400 hover:text-white"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-1 p-1 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-lg shadow-2xl">
          <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-400 hover:text-white">
            <Undo2 className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-8 h-8 text-zinc-400 hover:text-white">
            <Redo2 className="w-4 h-4" />
          </Button>
          <div className="w-[1px] h-4 bg-zinc-800 mx-1" />
          <Button variant="ghost" size="sm" className="h-8 px-3 text-[11px] font-bold text-indigo-400 hover:bg-indigo-500/10">
            <Save className="w-3.5 h-3.5 mr-2" />
            Save Design
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-3 text-[11px] font-bold text-zinc-300 hover:bg-zinc-800">
            <Download className="w-3.5 h-3.5 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Moveable Toolbox */}
      <EditorToolbox />

      {/* Bottom Bar (View Controls) */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-full shadow-2xl z-50">
        <TooltipProvider>
          <div className="flex items-center gap-1 pr-3 border-r border-zinc-800">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("w-8 h-8", showGuides ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-500")}
                  onClick={() => setShowGuides(!showGuides)}
                >
                  <Layers className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Guides (Ctrl+;)</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn("w-8 h-8", showGrid ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-500")}
                  onClick={() => setShowGrid(!showGrid)}
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">Grid (Ctrl+')</TooltipContent>
            </Tooltip>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-zinc-500 hover:text-zinc-200"
              onClick={handleZoomOut}
            >
              <Minus className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              className="h-8 px-2 text-[11px] font-mono text-zinc-400 hover:text-zinc-200"
              onClick={handleResetZoom}
            >
              {Math.round(zoom * 100)}%
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="w-8 h-8 text-zinc-500 hover:text-zinc-200"
              onClick={handleZoomIn}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
}
