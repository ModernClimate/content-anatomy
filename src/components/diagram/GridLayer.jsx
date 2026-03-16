import { useMemo } from 'react'
import { STAGE_WIDTH, LANE_HEIGHT, HEADER_HEIGHT, LANE_LABEL_WIDTH } from '@/lib/diagramConstants'

export default function GridLayer({ stages, swimLanes, bubbles }) {
  const totalWidth = LANE_LABEL_WIDTH + stages.length * STAGE_WIDTH
  const totalHeight = HEADER_HEIGHT + swimLanes.length * LANE_HEIGHT

  const emptyZones = useMemo(() => {
    const occupied = new Set(bubbles.map(b => `${b.stage}__${b.swimLane}`))
    const empty = []
    stages.forEach((stage, si) => {
      swimLanes.forEach((lane, li) => {
        if (!occupied.has(`${stage.label}__${lane.label}`)) {
          empty.push({ si, li })
        }
      })
    })
    return empty
  }, [bubbles, stages, swimLanes])

  return (
    <g className="grid-layer">
      {/* Canvas background */}
      <rect
        x={LANE_LABEL_WIDTH}
        y={HEADER_HEIGHT}
        width={stages.length * STAGE_WIDTH}
        height={swimLanes.length * LANE_HEIGHT}
        fill="white"
      />

      {/* Stage column backgrounds (alternating subtle shade) */}
      {stages.map((_, i) => i % 2 === 1 && (
        <rect
          key={i}
          x={LANE_LABEL_WIDTH + i * STAGE_WIDTH}
          y={HEADER_HEIGHT}
          width={STAGE_WIDTH}
          height={swimLanes.length * LANE_HEIGHT}
          fill="#fafafa"
        />
      ))}

      {/* Vertical column dividers */}
      {stages.map((_, i) => (
        <line
          key={`col-${i}`}
          x1={LANE_LABEL_WIDTH + (i + 1) * STAGE_WIDTH}
          y1={HEADER_HEIGHT}
          x2={LANE_LABEL_WIDTH + (i + 1) * STAGE_WIDTH}
          y2={totalHeight}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* Horizontal row dividers */}
      {swimLanes.map((_, i) => (
        <line
          key={`row-${i}`}
          x1={LANE_LABEL_WIDTH}
          y1={HEADER_HEIGHT + (i + 1) * LANE_HEIGHT}
          x2={totalWidth}
          y2={HEADER_HEIGHT + (i + 1) * LANE_HEIGHT}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
      ))}

      {/* Outer border */}
      <rect
        x={LANE_LABEL_WIDTH}
        y={HEADER_HEIGHT}
        width={stages.length * STAGE_WIDTH}
        height={swimLanes.length * LANE_HEIGHT}
        fill="none"
        stroke="#d1d5db"
        strokeWidth={1}
      />

      {/* Empty zone indicators */}
      {emptyZones.map(({ si, li }) => (
        <text
          key={`empty-${si}-${li}`}
          x={LANE_LABEL_WIDTH + si * STAGE_WIDTH + STAGE_WIDTH / 2}
          y={HEADER_HEIGHT + li * LANE_HEIGHT + LANE_HEIGHT / 2}
          textAnchor="middle"
          fill="#e5e7eb"
          fontSize={11}
          fontStyle="italic"
          fontFamily="Inter, sans-serif"
        >
          No content
        </text>
      ))}
    </g>
  )
}
