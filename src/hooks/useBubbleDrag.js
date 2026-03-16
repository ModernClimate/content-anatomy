import { useState, useRef, useCallback, useEffect } from 'react'

export function useBubbleDrag({ positions, zoom, onDragComplete, readOnly }) {
  const [localPositions, setLocalPositions] = useState(positions)
  const dragRef = useRef(null)

  // Keep local positions in sync when external positions change (after sync)
  useEffect(() => {
    setLocalPositions(positions)
  }, [positions])

  const handleDragStart = useCallback((e, bubbleId) => {
    if (readOnly) return
    e.stopPropagation()
    e.preventDefault()
    const pos = localPositions[bubbleId]
    if (!pos) return

    dragRef.current = {
      bubbleId,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      origX: pos.x,
      origY: pos.y
    }

    const handleMove = (moveEvent) => {
      if (!dragRef.current) return
      const { bubbleId, startMouseX, startMouseY, origX, origY } = dragRef.current
      const dx = (moveEvent.clientX - startMouseX) / zoom
      const dy = (moveEvent.clientY - startMouseY) / zoom
      setLocalPositions(prev => ({
        ...prev,
        [bubbleId]: { x: origX + dx, y: origY + dy }
      }))
    }

    const handleUp = () => {
      if (!dragRef.current) return
      const { bubbleId } = dragRef.current
      setLocalPositions(prev => {
        const finalPos = prev[bubbleId]
        if (finalPos) onDragComplete(bubbleId, finalPos.x, finalPos.y)
        return prev
      })
      dragRef.current = null
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
  }, [localPositions, zoom, onDragComplete, readOnly])

  return { localPositions, handleDragStart }
}
