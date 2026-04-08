"use client";
import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer, Group } from "react-konva";
import useImage from "use-image";
import { useEditorStore } from "@/store/editor.store";
import type { DesignElement, TextElement, ImageElement, ShapeElement } from "@/types";

function URLImage({ element, isSelected, onSelect, onChange }: any) {
  const [img] = useImage(element.url, "anonymous");
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <KonvaImage
        image={img}
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        rotation={element.rotation || 0}
        opacity={element.opacity ?? 1}
        cornerRadius={element.cornerRadius || 0}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => {
          onChange({ x: e.target.x(), y: e.target.y() });
        }}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

function Shape({ element, isSelected, onSelect, onChange }: any) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  // Simplifying strictly to Rect for demo, can extend logic based on element.shape
  return (
    <>
      <Rect
        x={element.x}
        y={element.y}
        width={element.width}
        height={element.height}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth || 0}
        rotation={element.rotation || 0}
        opacity={element.opacity ?? 1}
        cornerRadius={element.cornerRadius || 0}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(5, node.height() * scaleY),
          });
        }}
      />
      {isSelected && <Transformer ref={trRef} />}
    </>
  );
}

function TextNode({ element, isSelected, onSelect, onChange }: any) {
  const shapeRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isSelected && trRef.current && shapeRef.current) {
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <>
      <Text
        text={element.content}
        x={element.x}
        y={element.y}
        width={element.width}
        fontSize={element.fontSize}
        fontFamily={element.fontFamily}
        fontStyle={element.fontStyle}
        fill={element.fill}
        align={element.textAlign || "left"}
        rotation={element.rotation || 0}
        opacity={element.opacity ?? 1}
        draggable
        ref={shapeRef}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
        onTransformEnd={(e) => {
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            x: node.x(),
            y: node.y(),
            rotation: node.rotation(),
            width: Math.max(node.width() * scaleX, 20),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={["middle-left", "middle-right"]}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20) return oldBox;
            return newBox;
          }}
        />
      )}
    </>
  );
}

export function EditorCanvas() {
  const { design, selectedElementId, setSelectedElement, updateElement } = useEditorStore();
  const [scale, setScale] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scale canvas to fit container
  useEffect(() => {
    const fitCanvas = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth - 64; 
        const containerHeight = containerRef.current.offsetHeight - 64;
        const scaleX = containerWidth / design.width;
        const scaleY = containerHeight / design.height;
        setScale(Math.min(scaleX, scaleY, 1)); // don't scale up past 100%
      }
    };
    fitCanvas();
    window.addEventListener("resize", fitCanvas);
    return () => window.removeEventListener("resize", fitCanvas);
  }, [design.width, design.height]);

  const checkDeselect = (e: any) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedElement(null);
    }
  };

  return (
    <div 
      className="w-full h-full flex flex-col items-center justify-center bg-muted/30 overflow-auto"
      ref={containerRef}
    >
      <div 
        className="shadow-2xl ring-1 ring-border transition-transform"
        style={{
          width: design.width * scale,
          height: design.height * scale,
          transformOrigin: "center center"
        }}
      >
        <Stage
          width={design.width * scale}
          height={design.height * scale}
          scaleX={scale}
          scaleY={scale}
          onMouseDown={checkDeselect}
          onTouchStart={checkDeselect}
        >
          <Layer>
            {/* Background */}
            <Rect 
              x={0} 
              y={0} 
              width={design.width} 
              height={design.height} 
              fill={design.background || "#ffffff"} 
            />

            {/* Elements */}
            {design.elements.map((el) => {
              const isSelected = el.id === selectedElementId;
              const props = {
                key: el.id,
                element: el,
                isSelected,
                onSelect: () => setSelectedElement(el.id),
                onChange: (newAttrs: any) => updateElement(el.id, newAttrs)
              };

              if (el.type === "text") return <TextNode {...props} />;
              if (el.type === "image" || el.type === "qr") return <URLImage {...props} />;
              if (el.type === "shape") return <Shape {...props} />;
              return null;
            })}
          </Layer>
        </Stage>
      </div>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-popover/80 backdrop-blur border text-popover-foreground px-3 py-1 rounded-full text-xs shadow-sm">
        {Math.round(scale * 100)}% Zoom
      </div>
    </div>
  );
}
