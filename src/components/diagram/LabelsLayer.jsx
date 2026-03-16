import { STAGE_WIDTH, LANE_HEIGHT, HEADER_HEIGHT, LANE_LABEL_WIDTH } from '@/lib/diagramConstants'

export default function LabelsLayer({ stages, swimLanes }) {
  return (
    <g className="labels-layer" style={{ pointerEvents: 'none' }}>
      {/* Stage column headers */}
      {stages.map((stage, i) => (
        <g key={stage.id}>
          <rect
            x={LANE_LABEL_WIDTH + i * STAGE_WIDTH}
            y={0}
            width={STAGE_WIDTH}
            height={HEADER_HEIGHT}
            fill="#1f2937"
          />
          <text
            x={LANE_LABEL_WIDTH + i * STAGE_WIDTH + STAGE_WIDTH / 2}
            y={HEADER_HEIGHT / 2 + 5}
            textAnchor="middle"
            fill="white"
            fontSize={12}
            fontWeight="600"
            fontFamily="Inter, sans-serif"
            letterSpacing="0.03em"
          >
            {stage.label}
          </text>
        </g>
      ))}

      {/* Top-left corner cell */}
      <rect x={0} y={0} width={LANE_LABEL_WIDTH} height={HEADER_HEIGHT} fill="#111827" />

      {/* Swim lane row labels */}
      {swimLanes.map((lane, i) => {
        const cy = HEADER_HEIGHT + i * LANE_HEIGHT + LANE_HEIGHT / 2
        return (
          <g key={lane.id}>
            <rect
              x={0}
              y={HEADER_HEIGHT + i * LANE_HEIGHT}
              width={LANE_LABEL_WIDTH}
              height={LANE_HEIGHT}
              fill="#f3f4f6"
            />
            <line
              x1={LANE_LABEL_WIDTH - 1}
              y1={HEADER_HEIGHT + i * LANE_HEIGHT}
              x2={LANE_LABEL_WIDTH - 1}
              y2={HEADER_HEIGHT + (i + 1) * LANE_HEIGHT}
              stroke="#e5e7eb"
              strokeWidth={1}
            />
            <text
              x={LANE_LABEL_WIDTH / 2}
              y={cy}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="#374151"
              fontSize={11}
              fontWeight="600"
              fontFamily="Inter, sans-serif"
              transform={`rotate(-90, ${LANE_LABEL_WIDTH / 2}, ${cy})`}
            >
              {lane.label.length > 22 ? lane.label.slice(0, 20) + '…' : lane.label}
            </text>
          </g>
        )
      })}
    </g>
  )
}
