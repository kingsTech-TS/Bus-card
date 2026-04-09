"use client";
import { useEditorStore } from "@/store/editor.store";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, Square, MousePointer2 } from "lucide-react";

export function EditorToolbox() {
  const { addElement } = useEditorStore();

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

  return (
    <div className="bg-card shadow-soft rounded-full py-2 px-4 md:py-4 md:px-2 flex flex-row md:flex-col gap-4 items-center w-auto md:w-14 h-14 md:h-auto">
      <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 bg-primary/10 text-primary hover:bg-primary/20" title="Select Tool">
        <MousePointer2 className="w-5 h-5" />
      </Button>
      
      <div className="h-8 w-px md:w-8 md:h-px bg-border" />
      
      <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-muted" onClick={handleAddText} title="Add Text">
        <Type className="w-5 h-5" />
      </Button>
      
      <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-muted" onClick={handleAddShape} title="Add Shape">
        <Square className="w-5 h-5" />
      </Button>
      
      <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-muted opacity-50 cursor-not-allowed" title="Add Image">
        <ImageIcon className="w-5 h-5" />
      </Button>
    </div>
  );
}
