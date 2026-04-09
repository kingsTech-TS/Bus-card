"use client";
import { useEditorStore } from "@/store/editor.store";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Type, Image as ImageIcon, Square, Layers, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function EditorSidebar() {
  const { design, selectedElementId, removeElement, reorderElement, setSelectedElement, setBackground, updateElement } = useEditorStore();

  const selectedElement = design.elements.find(e => e.id === selectedElementId);

  return (
    <aside className="w-80 bg-card rounded-[2rem] shadow-soft border-0 flex flex-col shrink-0 overflow-hidden h-[calc(100vh-140px)]">
      <Tabs defaultValue="layers" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b h-12 bg-transparent p-0">
          <TabsTrigger value="layers" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary shadow-none">Layers</TabsTrigger>
          <TabsTrigger value="edit" className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary shadow-none" disabled={!selectedElement}>Edit</TabsTrigger>
        </TabsList>

        <div className="flex-1 overflow-auto p-4">


          <TabsContent value="layers" className="mt-0 space-y-2">
            <div className="space-y-3 p-2 bg-muted/30 rounded-xl mb-4">
              <h3 className="font-medium text-xs px-2 text-muted-foreground uppercase tracking-widest">Background</h3>
              <div className="flex items-center gap-2">
                <Input 
                  type="color" 
                  value={design.background || "#ffffff"} 
                  onChange={(e) => setBackground(e.target.value)}
                  className="w-10 h-10 p-0 cursor-pointer rounded-full overflow-hidden border-0 shadow-sm shrink-0"
                />
                <Input 
                  value={design.background || "#ffffff"} 
                  onChange={(e) => setBackground(e.target.value)}
                  className="flex-1 font-mono uppercase bg-card border-0 shadow-sm"
                />
              </div>
            </div>
            
            <h3 className="font-medium text-xs px-2 mb-2 text-muted-foreground uppercase tracking-widest pt-2">Canvas Layers</h3>
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
