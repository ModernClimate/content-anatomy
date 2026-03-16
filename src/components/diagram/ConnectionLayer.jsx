import { useMemo } from 'react'
import { useUIStore } from '@/stores/useUIStore'
import { deriveConnections, getConnectionPath } from '@/lib/connectionUtils'

export default function ConnectionLayer({ bubbles, positions }) {
  const { activeBubbleId, hoveredBubbleId } = useUIStore()

  const connections = useMemo(() => deriveConnections(bubbles), [bubbles])

  const bubbleMap = useMemo(() => {
    const map = {}
    bubbles.forEach(b => { map[b.id] = b })
    return map
  }, [bubbles])

  return (
    <g className="connection-layer" style={{ pointerEvents: 'none' }}>
      {connections.map(({ sourceId, targetId }) => {
        const sourcePos = positions[sourceId]
        const targetPos = positions[targetId]
        const sourceBubble = bubbleMap[sourceId]
        const targetBubble = bubbleMap[targetId]

        if (!sourcePos || !targetPos || !sourceBubble || !targetBubble) return null

        const path = getConnectionPath(sourcePos, targetPos, sourceBubble, targetBubble)
        if (!path) return null

        const isActive = activeBubbleId === sourceId || activeBubbleId === targetId
        const isHovered = hoveredBubbleId === sourceId || hoveredBubbleId === targetId

        let stroke = '#e5e7eb'
        let strokeWidth = 1
        let markerEnd = 'url(#arrow-default)'
        let strokeDasharray = '5 4'
        let opacity = 0.8

        if (isActive) {
          stroke = '#3b82f6'
          strokeWidth = 2
          markerEnd = 'url(#arrow-active)'
          strokeDasharray = 'none'
          opacity = 1
        } else if (isHovered) {
          stroke = '#6b7280'
          strokeWidth = 1.5
          markerEnd = 'url(#arrow-hovered)'
          strokeDasharray = 'none'
          opacity = 1
        }

        return (
          <path
            key={`${sourceId}↔${targetId}`}
            d={path}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={strokeDasharray}
            markerEnd={markerEnd}
            opacity={opacity}
          />
        )
      })}
    </g>
  )
}
