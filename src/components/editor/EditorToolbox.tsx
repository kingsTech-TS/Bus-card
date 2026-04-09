"use client";
import React, { useState, useRef, useEffect } from "react";
import { useEditorStore } from "@/store/editor.store";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, Square, MousePointer2, Pencil, Slash, GripVertical, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssetPicker } from "./AssetPicker";

export function EditorToolbox() {
  const { addElement } = useEditorStore();
  const [position, setPosition] = useState({ x: 16, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !dragRef.current) return;

      const deltaX = e.clientX - dragRef.current.startX;
      const deltaY = e.clientY - dragRef.current.startY;
      const newX = dragRef.current.startPosX + deltaX;
      const newY = dragRef.current.startPosY + deltaY;

      // Keep within window boundaries
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 300;

      setPosition({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY)),
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleAddText = () => {
    addElement({
      type: "text",
      x: 50,
      y: 50,
      width: 300,
      height: 50,
      content: "Double click to edit",
      fontSize: 24,
      fontFamily: "Inter, sans-serif",
      fill: "#000000",
    } as any);
  };

  const handleAddShape = () => {
    addElement({
      type: "shape",
      shapeType: "rect",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: "#cccccc",
    } as any);
  };

  const handleAddLine = () => {
    addElement({
      type: "shape",
      shapeType: "line",
      x: 100,
      y: 100,
      width: 200,
      height: 2,
      fill: "#000000",
    } as any);
  };

  const handleAddDraw = () => {
    addElement({
      type: "draw",
      x: 0,
      y: 0,
      points: [],
      stroke: "#000000",
      strokeWidth: 5,
    } as any);
  };

  const handleAddQR = () => {
    addElement({
      type: "qr",
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      data: "https://example.com",
      fill: "#000000",
    } as any);
  };

  const handleAddImage = (url: string) => {
    addElement({
      type: "image",
      x: 50,
      y: 50,
      width: 150,
      height: 150,
      url,
    } as any);
  };

  return (
    <div 
      className={cn(
        "fixed z-[100] bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-xl shadow-2xl flex flex-col gap-1 p-1 transition-shadow",
        isDragging ? "shadow-indigo-500/20 cursor-grabbing" : "cursor-default"
      )}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      {/* Drag Handle */}
      <div 
        className="h-6 flex items-center justify-center cursor-grab active:cursor-grabbing hover:bg-zinc-800 rounded-lg transition-colors mb-1"
        onMouseDown={handleMouseDown}
      >
        <GripVertical className="w-3.5 h-3.5 text-zinc-500" />
      </div>

      <div className="flex flex-col gap-1">
        <Button variant="ghost" size="icon" className="w-10 h-10 text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg" title="Select Tool">
          <MousePointer2 className="w-4.5 h-4.5" />
        </Button>
        
        <div className="h-px w-8 bg-zinc-800 mx-auto my-1" />
        
        <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg" onClick={handleAddText} title="Add Text">
          <Type className="w-4.5 h-4.5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg" onClick={handleAddShape} title="Add Shape">
          <Square className="w-4.5 h-4.5" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg" onClick={handleAddLine} title="Add Line">
          <Slash className="w-4.5 h-4.5" />
        </Button>

        <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg" onClick={handleAddDraw} title="Draw Tool">
          <Pencil className="w-4.5 h-4.5" />
        </Button>
        
        <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg" onClick={handleAddQR} title="Add QR Code">
          <QrCode className="w-4.5 h-4.5" />
        </Button>

        <AssetPicker 
          onSelect={handleAddImage}
          trigger={
            <Button variant="ghost" size="icon" className="w-10 h-10 text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg" title="Add Image">
              <ImageIcon className="w-4.5 h-4.5" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
