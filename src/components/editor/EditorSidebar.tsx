"use client";
import { useEditorStore } from "@/store/editor.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, Square, Layers, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function EditorSidebar() {
  const { design, selectedElementId, addElement, removeElement, reorderElement, setSelectedElement, setBackground, updateElement } = useEditorStore();

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

  const selectedElement = design.elements.find(e => e.id === selectedElementId);

  return (
    <aside className="w-80 border-l bg-card flex flex-col shrink-0">
      <Tabs defaultValue="add" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b h-12 bg-transparent p-0">
          <TabsTrigger value="add" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary shadow-none">Add</TabsTrigger>
          <TabsTrigger value="layers" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary shadow-none">Layers</TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary shadow-none" disabled={!selectedElement}>Edit</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto p-4">
          <TabsContent value="add" className="mt-0 space-y-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Background</h3>
              <div className="flex items-center gap-2">
                <Input 
                  type="color" 
                  value={design.background || "#ffffff"} 
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-12 h-12 p-1 cursor-pointer"
                />
                <Input 
                  value={design.background || "#ffffff"} 
                  onChange={(e) => setBackground(e.target.value)}
                  className="flex-1 font-mono uppercase"
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm">Elements</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={handleAddText}>
                  <Type className="w-6 h-6" />
                  <span>Text</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2" onClick={handleAddShape}>
                  <Square className="w-6 h-6" />
                  <span>Shape</span>
                </Button>
                <Button variant="outline" className="h-20 flex flex-col gap-2 disabled:opacity-50">
                  <ImageIcon className="w-6 h-6" />
                  <span>Image</span>
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layers" className="mt-0 space-y-2">
            {[...design.elements].reverse().map((el, i) => (
              <div 
                key={el.id} 
                className={`flex items-center justify-between p-2 rounded border ${selectedElementId === el.id ? 'border-primary bg-primary/5' : 'bg-muted/50'}`}
                onClick={() => setSelectedElement(el.id)}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  {el.type === 'text' && <Type className="w-4 h-4 text-muted-foreground shrink-0" />}
                  {el.type === 'shape' && <Square className="w-4 h-4 text-muted-foreground shrink-0" />}
                  {el.type === 'image' && <ImageIcon className="w-4 h-4 text-muted-foreground shrink-0" />}
                  <span className="text-sm truncate font-medium">
                    {el.type === 'text' ? (el as any).content : el.type}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => { e.stopPropagation(); reorderElement(el.id, 'up'); }}>
                    <ArrowUp className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6" onClick={(e) => { e.stopPropagation(); reorderElement(el.id, 'down'); }}>
                    <ArrowDown className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="w-6 h-6 text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={(e) => { e.stopPropagation(); removeElement(el.id); }}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
            {design.elements.length === 0 && <p className="text-sm text-center text-muted-foreground mt-8">No layers yet.</p>}
          </TabsContent>

          <TabsContent value="edit" className="mt-0 space-y-4">
            {selectedElement ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>X Position</Label>
                    <Input type="number" value={Math.round(selectedElement.x)} onChange={(e) => updateElement(selectedElement.id, { x: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Y Position</Label>
                    <Input type="number" value={Math.round(selectedElement.y)} onChange={(e) => updateElement(selectedElement.id, { y: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Width</Label>
                    <Input type="number" value={Math.round(selectedElement.width)} onChange={(e) => updateElement(selectedElement.id, { width: Number(e.target.value) })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Opacity</Label>
                    <Input type="number" min="0" max="1" step="0.1" value={selectedElement.opacity ?? 1} onChange={(e) => updateElement(selectedElement.id, { opacity: Number(e.target.value) })} />
                  </div>
                </div>

                {selectedElement.type === "text" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Text</Label>
                      <Input value={(selectedElement as any).content} onChange={(e) => updateElement(selectedElement.id, { content: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={(selectedElement as any).fill} onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })} className="w-12 h-12 p-1" />
                        <Input value={(selectedElement as any).fill} onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })} className="flex-1 font-mono uppercase" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Font Size</Label>
                      <Input type="number" value={(selectedElement as any).fontSize} onChange={(e) => updateElement(selectedElement.id, { fontSize: Number(e.target.value) })} />
                    </div>
                  </div>
                )}

                 {selectedElement.type === "shape" && (
                  <div className="space-y-4 pt-4 border-t">
                    <div className="space-y-2">
                      <Label>Fill Color</Label>
                      <div className="flex items-center gap-2">
                        <Input type="color" value={(selectedElement as any).fill} onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })} className="w-12 h-12 p-1" />
                        <Input value={(selectedElement as any).fill} onChange={(e) => updateElement(selectedElement.id, { fill: e.target.value })} className="flex-1 font-mono uppercase" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-center text-muted-foreground">Select an element to edit.</p>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </aside>
  );
}
