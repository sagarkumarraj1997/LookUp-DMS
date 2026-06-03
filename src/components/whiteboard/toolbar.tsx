"use client"

import {
  MousePointer2, Pen, Square, Circle, ArrowRight, Type, StickyNote,
  Minus, Download, Undo2, Redo2, ZoomIn, ZoomOut,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"

export type Tool = "select" | "pen" | "rect" | "circle" | "arrow" | "text" | "sticky" | "line"

interface ToolbarProps {
  activeTool: Tool
  onToolChange: (tool: Tool) => void
  strokeColor: string
  fillColor: string
  strokeWidth: number
  onStrokeColorChange: (color: string) => void
  onFillColorChange: (color: string) => void
  onStrokeWidthChange: (width: number) => void
  onUndo: () => void
  onRedo: () => void
  onZoomIn: () => void
  onZoomOut: () => void
  onExport: () => void
  canUndo: boolean
  canRedo: boolean
}

const TOOLS: Array<{ id: Tool; icon: React.ElementType; label: string }> = [
  { id: "select", icon: MousePointer2, label: "Select (V)" },
  { id: "pen", icon: Pen, label: "Pen (P)" },
  { id: "rect", icon: Square, label: "Rectangle (R)" },
  { id: "circle", icon: Circle, label: "Circle (C)" },
  { id: "arrow", icon: ArrowRight, label: "Arrow (A)" },
  { id: "line", icon: Minus, label: "Line (L)" },
  { id: "text", icon: Type, label: "Text (T)" },
  { id: "sticky", icon: StickyNote, label: "Sticky Note (S)" },
]

const COLORS = ["#0F172A", "#ef4444", "#f97316", "#eab308", "#22c55e", "#06B6D4", "#8B5CF6", "#ec4899", "#ffffff"]
const STROKE_WIDTHS = [1, 2, 4, 6, 10]

export function WhiteboardToolbar({
  activeTool, onToolChange,
  strokeColor, onStrokeColorChange,
  fillColor, onFillColorChange,
  strokeWidth, onStrokeWidthChange,
  onUndo, onRedo, onZoomIn, onZoomOut, onExport,
  canUndo, canRedo,
}: ToolbarProps) {
  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur border border-slate-200 rounded-xl shadow-lg px-3 py-2">
      {/* Tools */}
      {TOOLS.map(({ id, icon: Icon, label }) => (
        <Button
          key={id}
          variant="ghost"
          size="icon"
          title={label}
          className={cn("h-8 w-8", activeTool === id ? "bg-cyan-100 text-cyan-700" : "text-slate-600")}
          onClick={() => onToolChange(id)}
        >
          <Icon className="w-4 h-4" />
        </Button>
      ))}

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Colors */}
      <div className="flex gap-1">
        {COLORS.slice(0, 6).map((c) => (
          <button
            key={c}
            onClick={() => onStrokeColorChange(c)}
            className={cn(
              "w-5 h-5 rounded-full border-2 transition-all",
              c === "#ffffff" ? "border-slate-300" : "border-transparent",
              strokeColor === c ? "border-cyan-500 scale-125" : "hover:scale-110"
            )}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Stroke width */}
      <div className="flex items-center gap-1">
        {STROKE_WIDTHS.map((w) => (
          <button
            key={w}
            onClick={() => onStrokeWidthChange(w)}
            className={cn(
              "flex items-center justify-center w-6 h-6 rounded hover:bg-slate-100 transition-all",
              strokeWidth === w ? "bg-cyan-100" : ""
            )}
          >
            <div
              className="rounded-full bg-slate-700"
              style={{ width: Math.min(w * 2, 16), height: Math.min(w, 8) }}
            />
          </button>
        ))}
      </div>

      <div className="w-px h-6 bg-slate-200 mx-1" />

      {/* Actions */}
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onUndo} disabled={!canUndo} title="Undo (Ctrl+Z)">
        <Undo2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRedo} disabled={!canRedo} title="Redo (Ctrl+Y)">
        <Redo2 className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomOut} title="Zoom Out">
        <ZoomOut className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onZoomIn} title="Zoom In">
        <ZoomIn className="w-4 h-4" />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onExport} title="Export PNG">
        <Download className="w-4 h-4" />
      </Button>
    </div>
  )
}
