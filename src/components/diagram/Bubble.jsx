import React from 'react'
import { getRadius } from '@/lib/diagramConstants'

const Bubble = React.memo(function Bubble({
  bubble, position, colorCategories,
  isActive, isHovered, isDimmed, commentCount,
  showLabels,
  onMouseDown, onMouseEnter, onMouseLeave, onClick
}) {
  const radius = getRadius(bubble.bubbleSize)
  const category = colorCategories.find(c => c.label === bubble.colorCategory)
  const color = category?.hex_color || '#9ca3af'
  const { x, y } = position

  return (
    <g
      transform={`translate(${x}, ${y})`}
      style={{
        cursor: 'pointer',
        opacity: isDimmed ? 0.18 : 1,
        transition: 'opacity 0.15s ease'
      }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Selection / hover ring */}
      {(isActive || isHovered) && (
        <circle
          r={radius + 7}
          fill="none"
          stroke={isActive ? '#3b82f6' : '#9ca3af'}
          strokeWidth={isActive ? 2 : 1}
          strokeDasharray={isActive ? 'none' : '5 3'}
        />
      )}

      {/* Main circle */}
      <circle
        r={radius}
        fill={color}
        fillOpacity={0.12}
        stroke={color}
        strokeWidth={isActive ? 2.5 : 1.5}
      />

      {/* Invalid warning ring */}
      {!bubble.valid && (
        <circle
          r={radius + 4}
          fill="none"
          stroke="#ef4444"
          strokeWidth={1.5}
          strokeDasharray="4 2"
        />
      )}

      {/* Comment badge */}
      {commentCount > 0 && (
        <g data-comment-badge="true" transform={`translate(${radius - 6}, ${-radius + 6})`}>
          <circle r={9} fill="#3b82f6" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            fill="white"
            fontSize={8}
            fontWeight="bold"
            fontFamily="Inter, sans-serif"
          >
            {commentCount > 9 ? '9+' : commentCount}
          </text>
        </g>
      )}

      {/* Label */}
      {showLabels && <BubbleLabel title={bubble.title} radius={radius} />}
    </g>
  )
})

function BubbleLabel({ title, radius }) {
  if (!title) return null
  const maxCharsPerLine = Math.max(8, Math.floor((radius * 1.6) / 6.5))
  const lines = wrapText(title, maxCharsPerLine).slice(0, 4)
  const lineHeight = 13
  const totalHeight = lines.length * lineHeight

  if (radius >= 38) {
    return (
      <g>
        {lines.map((line, i) => (
          <text
            key={i}
            x={0}
            y={-totalHeight / 2 + i * lineHeight + lineHeight * 0.7}
            textAnchor="middle"
            fill="#1f2937"
            fontSize={10}
            fontFamily="Inter, sans-serif"
            fontWeight="500"
          >
            {line}
          </text>
        ))}
      </g>
    )
  }

  // Small bubble: show label below
  return (
    <text
      x={0}
      y={radius + 13}
      textAnchor="middle"
      fill="#374151"
      fontSize={9}
      fontFamily="Inter, sans-serif"
    >
      {title.length > 18 ? title.slice(0, 16) + '…' : title}
    </text>
  )
}

function wrapText(text, maxChars) {
  const words = text.split(' ')
  const lines = []
  let current = ''
  for (const word of words) {
    const test = current ? `${current} ${word}` : word
    if (test.length <= maxChars) {
      current = test
    } else {
      if (current) lines.push(current)
      current = word.length > maxChars ? word.slice(0, maxChars - 1) + '…' : word
    }
  }
  if (current) lines.push(current)
  return lines
}

export default Bubble
