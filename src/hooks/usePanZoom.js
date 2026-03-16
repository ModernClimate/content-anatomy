import { useRef, useCallback } from 'react'
import { useUIStore } from '@/stores/useUIStore'

export function usePanZoom() {
  const { zoom, panOffset, setZoom, setPanOffset } = useUIStore()
  const isPanning = useRef(false)
  const panStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })

  const handleWheel = useCallback((e) => {
    e.preventDefault()
    const factor = e.deltaY > 0 ? 0.92 : 1.09
    setZoom(zoom * factor)
  }, [zoom, setZoom])

  const handlePanStart = useCallback((e) => {
    // Pan on middle mouse or alt+left click
    if (e.button !== 1 && !e.altKey) return
    e.preventDefault()
    isPanning.current = true
    panStart.current = {
      x: e.clientX,
      y: e.clientY,
      ox: panOffset.x,
      oy: panOffset.y
    }
  }, [panOffset])

  const handlePanMove = useCallback((e) => {
    if (!isPanning.current) return
    setPanOffset({
      x: panStart.current.ox + (e.clientX - panStart.current.x),
      y: panStart.current.oy + (e.clientY - panStart.current.y)
    })
  }, [setPanOffset])

  const handlePanEnd = useCallback(() => {
    isPanning.current = false
  }, [])

  return { handleWheel, handlePanStart, handlePanMove, handlePanEnd }
}
