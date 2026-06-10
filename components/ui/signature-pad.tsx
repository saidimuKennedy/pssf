"use client"

import { useRef, useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SignaturePadProps {
  onChange?: (dataUrl: string | null) => void
  className?: string
}

export function SignaturePad({ onChange, className }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<{ x: number; y: number } | null>(null)
  const [hasSignature, setHasSignature] = useState(false)

  function getPos(e: MouseEvent | TouchEvent, canvas: HTMLCanvasElement) {
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ("touches" in e) {
      const t = e.touches[0]
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY }
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
  }

  const startDraw = useCallback((e: MouseEvent | TouchEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return
    e.preventDefault()
    drawing.current = true
    lastPos.current = getPos(e, canvas)
  }, [])

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      if (!drawing.current) return
      const canvas = canvasRef.current
      if (!canvas) return
      e.preventDefault()
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      const pos = getPos(e, canvas)
      ctx.beginPath()
      ctx.moveTo(lastPos.current!.x, lastPos.current!.y)
      ctx.lineTo(pos.x, pos.y)
      ctx.strokeStyle = "#0D2137"
      ctx.lineWidth = 2
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
      lastPos.current = pos
      if (!hasSignature) {
        setHasSignature(true)
        onChange?.(canvas.toDataURL("image/png"))
      } else {
        onChange?.(canvas.toDataURL("image/png"))
      }
    },
    [hasSignature, onChange]
  )

  const stopDraw = useCallback(() => {
    drawing.current = false
    lastPos.current = null
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Set internal resolution for clarity
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    const ctx = canvas.getContext("2d")
    if (ctx) {
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    canvas.addEventListener("mousedown", startDraw)
    canvas.addEventListener("mousemove", draw)
    canvas.addEventListener("mouseup", stopDraw)
    canvas.addEventListener("mouseleave", stopDraw)
    canvas.addEventListener("touchstart", startDraw, { passive: false })
    canvas.addEventListener("touchmove", draw, { passive: false })
    canvas.addEventListener("touchend", stopDraw)

    return () => {
      canvas.removeEventListener("mousedown", startDraw)
      canvas.removeEventListener("mousemove", draw)
      canvas.removeEventListener("mouseup", stopDraw)
      canvas.removeEventListener("mouseleave", stopDraw)
      canvas.removeEventListener("touchstart", startDraw)
      canvas.removeEventListener("touchmove", draw)
      canvas.removeEventListener("touchend", stopDraw)
    }
  }, [startDraw, draw, stopDraw])

  function clear() {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasSignature(false)
    onChange?.(null)
  }

  return (
    <div className={cn("space-y-2", className)}>
      <canvas
        ref={canvasRef}
        className="w-full h-28 rounded-lg border border-gray-300 bg-white cursor-crosshair touch-none"
        style={{ display: "block" }}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">Draw your signature above</p>
        {hasSignature && (
          <Button type="button" variant="ghost" size="sm" onClick={clear} className="text-xs h-7">
            Clear
          </Button>
        )}
      </div>
    </div>
  )
}
