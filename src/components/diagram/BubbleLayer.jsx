import { useMemo } from 'react'
import { useUIStore } from '@/stores/useUIStore'
import { useCommentStore } from '@/stores/useCommentStore'
import { buildConnectionMap } from '@/lib/connectionUtils'
import Bubble from './Bubble'

export default function BubbleLayer({ bubbles, localPositions, colorCategories, onDragStart, readOnly }) {
  const { activeBubbleId, hoveredBubbleId, setActiveBubble, setHoveredBubble, highlightCategory, showLabels } = useUIStore()
  const { unresolvedCounts } = useCommentStore()

  const connectionMap = useMemo(() => buildConnectionMap(bubbles), [bubbles])

  return (
    <g className="bubble-layer">
      {bubbles.map(bubble => {
        const pos = localPositions[bubble.id]
        if (!pos) return null

        const isActive = activeBubbleId === bubble.id
        const isHovered = hoveredBubbleId === bubble.id

        let isDimmed = false
        if (hoveredBubbleId && hoveredBubbleId !== bubble.id) {
          isDimmed = !connectionMap[hoveredBubbleId]?.has(bubble.id)
        }
        if (highlightCategory && bubble.colorCategory !== highlightCategory) {
          isDimmed = true
        }

        return (
          <Bubble
            key={bubble.id}
            bubble={bubble}
            position={pos}
            colorCategories={colorCategories}
            isActive={isActive}
            isHovered={isHovered}
            isDimmed={isDimmed}
            showLabels={showLabels}
            commentCount={unresolvedCounts[bubble.id] || 0}
            onMouseDown={(e) => !readOnly && onDragStart(e, bubble.id)}
            onMouseEnter={() => setHoveredBubble(bubble.id)}
            onMouseLeave={() => setHoveredBubble(null)}
            onClick={() => setActiveBubble(isActive ? null : bubble.id)}
          />
        )
      })}
    </g>
  )
}
