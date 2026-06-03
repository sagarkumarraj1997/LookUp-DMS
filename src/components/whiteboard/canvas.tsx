"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { WhiteboardToolbar, type Tool } from "./toolbar"

interface CanvasElement {
  id: string
  type: Tool
  x: number
  y: number
  x2?: number
  y2?: number
  width?: number
  height?: number
  text?: string
  strokeColor: string
  fillColor: string
  strokeWidth: number
  points?: Array<[number, number]>
}

interface WhiteboardCanvasProps {
  initialContent?: { elements: CanvasElement[] }
  onSave?: (content: { elements: CanvasElement[] }) => void
}

export function WhiteboardCanvas({ initialContent, onSave }: WhiteboardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>("select")
  const [strokeColor, setStrokeColor] = useState("#0F172A")
  const [fillColor, setFillColor] = useState("transparent")
  const [strokeWidth, setStrokeWidth] = useState(2)
  const [elements, setElements] = useState<CanvasElement[]>(initialContent?.elements ?? [])
  const [history, setHistory] = useState<CanvasElement[][]>([initialContent?.elements ?? []])
  const [historyIdx, setHistoryIdx] = useState(0)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentElement, setCurrentElement] = useState<CanvasElement | null>(null)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const lastPan = useRef({ x: 0, y: 0 })

  const getCanvasPos = useCallback((e: React.MouseEvent): { x: number; y: number } => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left - offset.x) / zoom,
      y: (e.clientY - rect.top - offset.y) / zoom,
    }
  }, [offset, zoom])

  const drawGrid = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const gridSize = 20 * zoom
    ctx.strokeStyle = "#e2e8f0"
    ctx.lineWidth = 0.5
    const offsetX = offset.x % gridSize
    const offsetY = offset.y % gridSize
    for (let x = offsetX; x < canvas.width; x += gridSize) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke()
    }
    for (let y = offsetY; y < canvas.height; y += gridSize) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke()
    }
  }

  const drawElement = (ctx: CanvasRenderingContext2D, el: CanvasElement) => {
    ctx.save()
    ctx.strokeStyle = el.strokeColor
    ctx.lineWidth = el.strokeWidth
    ctx.fillStyle = el.fillColor === "transparent" ? "rgba(0,0,0,0)" : el.fillColor
    ctx.lineCap = "round"
    ctx.lineJoin = "round"

    switch (el.type) {
      case "pen":
        if (el.points && el.points.length > 1) {
          ctx.beginPath()
          ctx.moveTo(el.points[0][0], el.points[0][1])
          for (let i = 1; i < el.points.length; i++) {
            ctx.lineTo(el.points[i][0], el.points[i][1])
          }
          ctx.stroke()
        }
        break
      case "line":
        if (el.x2 !== undefined && el.y2 !== undefined) {
          ctx.beginPath()
          ctx.moveTo(el.x, el.y)
          ctx.lineTo(el.x2, el.y2)
          ctx.stroke()
        }
        break
      case "rect":
        if (el.width !== undefined && el.height !== undefined) {
          ctx.beginPath()
          ctx.rect(el.x, el.y, el.width, el.height)
          ctx.fill()
          ctx.stroke()
        }
        break
      case "circle":
        if (el.width !== undefined && el.height !== undefined) {
          const rx = Math.abs(el.width) / 2
          const ry = Math.abs(el.height) / 2
          ctx.beginPath()
          ctx.ellipse(el.x + el.width / 2, el.y + el.height / 2, rx, ry, 0, 0, 2 * Math.PI)
          ctx.fill()
          ctx.stroke()
        }
        break
      case "arrow":
        if (el.x2 !== undefined && el.y2 !== undefined) {
          const angle = Math.atan2(el.y2 - el.y, el.x2 - el.x)
          const headLen = 12
          ctx.beginPath()
          ctx.moveTo(el.x, el.y)
          ctx.lineTo(el.x2, el.y2)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(el.x2, el.y2)
          ctx.lineTo(el.x2 - headLen * Math.cos(angle - 0.4), el.y2 - headLen * Math.sin(angle - 0.4))
          ctx.lineTo(el.x2 - headLen * Math.cos(angle + 0.4), el.y2 - headLen * Math.sin(angle + 0.4))
          ctx.closePath()
          ctx.fill()
        }
        break
      case "text":
        if (el.text) {
          ctx.font = `${14 * zoom}px sans-serif`
          ctx.fillStyle = el.strokeColor
          ctx.fillText(el.text, el.x, el.y)
        }
        break
      case "sticky":
        if (el.width !== undefined && el.height !== undefined) {
          ctx.fillStyle = "#fef08a"
          ctx.fillRect(el.x, el.y, el.width || 150, el.height || 120)
          ctx.strokeStyle = "#eab308"
          ctx.strokeRect(el.x, el.y, el.width || 150, el.height || 120)
          if (el.text) {
            ctx.fillStyle = "#78350f"
            ctx.font = `${12}px sans-serif`
            ctx.fillText(el.text, el.x + 8, el.y + 20, (el.width || 150) - 16)
          }
        }
        break
    }
    ctx.restore()
  }

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid(ctx, canvas)

    ctx.save()
    ctx.translate(offset.x, offset.y)
    ctx.scale(zoom, zoom)

    elements.forEach((el) => drawElement(ctx, el))
    if (currentElement) drawElement(ctx, currentElement)

    ctx.restore()
  }, [elements, currentElement, offset, zoom])

  useEffect(() => {
    render()
  }, [render])

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
      render()
    }
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [render])

  const saveToHistory = (els: CanvasElement[]) => {
    const newHistory = history.slice(0, historyIdx + 1)
    newHistory.push(els)
    setHistory(newHistory)
    setHistoryIdx(newHistory.length - 1)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsPanning(true)
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
      return
    }
    if (tool === "select") return

    const pos = getCanvasPos(e)
    const newEl: CanvasElement = {
      id: `el-${Date.now()}`,
      type: tool,
      x: pos.x,
      y: pos.y,
      strokeColor,
      fillColor,
      strokeWidth,
    }

    if (tool === "pen") {
      newEl.points = [[pos.x, pos.y]]
    } else if (tool === "sticky") {
      newEl.width = 150
      newEl.height = 120
      newEl.text = "Note..."
    }

    setCurrentElement(newEl)
    setIsDrawing(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setOffset({ x: e.clientX - panStart.x, y: e.clientY - panStart.y })
      return
    }
    if (!isDrawing || !currentElement) return
    const pos = getCanvasPos(e)

    if (tool === "pen") {
      setCurrentElement({
        ...currentElement,
        points: [...(currentElement.points ?? []), [pos.x, pos.y]],
      })
    } else {
      setCurrentElement({
        ...currentElement,
        x2: pos.x,
        y2: pos.y,
        width: pos.x - currentElement.x,
        height: pos.y - currentElement.y,
      })
    }
  }

  const handleMouseUp = () => {
    setIsPanning(false)
    if (!isDrawing || !currentElement) return
    const newElements = [...elements, currentElement]
    setElements(newElements)
    saveToHistory(newElements)
    setCurrentElement(null)
    setIsDrawing(false)
    onSave?.({ elements: newElements })
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? 0.9 : 1.1
    setZoom((z) => Math.min(Math.max(z * delta, 0.1), 5))
  }

  const undo = () => {
    if (historyIdx > 0) {
      const idx = historyIdx - 1
      setHistoryIdx(idx)
      setElements(history[idx])
    }
  }

  const redo = () => {
    if (historyIdx < history.length - 1) {
      const idx = historyIdx + 1
      setHistoryIdx(idx)
      setElements(history[idx])
    }
  }

  const exportPNG = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const url = canvas.toDataURL("image/png")
    const a = document.createElement("a")
    a.href = url
    a.download = "whiteboard.png"
    a.click()
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") undo()
      if ((e.ctrlKey || e.metaKey) && e.key === "y") redo()
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [historyIdx, history])

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-50 rounded-xl">
      <WhiteboardToolbar
        activeTool={tool}
        onToolChange={setTool}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={strokeWidth}
        onStrokeColorChange={setStrokeColor}
        onFillColorChange={setFillColor}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={undo}
        onRedo={redo}
        onZoomIn={() => setZoom((z) => Math.min(z * 1.2, 5))}
        onZoomOut={() => setZoom((z) => Math.max(z * 0.8, 0.1))}
        onExport={exportPNG}
        canUndo={historyIdx > 0}
        canRedo={historyIdx < history.length - 1}
      />
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ cursor: isPanning ? "grabbing" : tool === "select" ? "default" : "crosshair" }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      />
      <div className="absolute bottom-4 right-4 bg-white/80 backdrop-blur px-2 py-1 rounded text-xs text-slate-500 border border-slate-200">
        {Math.round(zoom * 100)}%
      </div>
    </div>
  )
}
