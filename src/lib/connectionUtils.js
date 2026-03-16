import { getRadius } from './diagramConstants'

/**
 * Derive a deduplicated list of unique connection pairs from bubble data.
 * Returns an array of { sourceId, targetId } where each pair appears once
 * regardless of which bubble lists the connection.
 */
export function deriveConnections(bubbles) {
  const seen = new Set()
  const connections = []

  bubbles.forEach(bubble => {
    bubble.connections.forEach(targetId => {
      const key = [bubble.id, targetId].sort().join('↔')
      if (!seen.has(key)) {
        seen.add(key)
        connections.push({ sourceId: bubble.id, targetId })
      }
    })
  })

  return connections
}

/**
 * Build a map of bubbleId → Set of connected bubble IDs.
 * Used for hover highlighting in BubbleLayer.
 */
export function buildConnectionMap(bubbles) {
  const map = {}
  bubbles.forEach(bubble => {
    if (!map[bubble.id]) map[bubble.id] = new Set()
    bubble.connections.forEach(targetId => {
      map[bubble.id].add(targetId)
      if (!map[targetId]) map[targetId] = new Set()
      map[targetId].add(bubble.id)
    })
  })
  return map
}

/**
 * Calculate the SVG path 'd' attribute for a connection between two bubbles.
 * The path starts at the edge of the source bubble and ends at the edge of
 * the target bubble, with bezier control points that produce a natural arc.
 */
export function getConnectionPath(sourcePos, targetPos, sourceBubble, targetBubble) {
  const { x: x1, y: y1 } = sourcePos
  const { x: x2, y: y2 } = targetPos

  const r1 = getRadius(sourceBubble.bubbleSize)
  const r2 = getRadius(targetBubble.bubbleSize)

  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx * dx + dy * dy)

  if (dist === 0) return null

  // Normalized direction
  const nx = dx / dist
  const ny = dy / dist

  // Start and end points at bubble edges
  const startX = x1 + nx * r1
  const startY = y1 + ny * r1
  const endX   = x2 - nx * r2
  const endY   = y2 - ny * r2

  // Perpendicular direction for control point offset
  const perpX = -ny
  const perpY = nx

  const horizontalDist = Math.abs(dx)
  const isLongRange = horizontalDist > 400

  // Wide arc for cross-zone, gentle curve for nearby bubbles
  const curvature = isLongRange
    ? Math.min(160, horizontalDist * 0.2)
    : Math.max(30, dist * 0.25)

  const midX = (startX + endX) / 2
  const midY = (startY + endY) / 2
  const cpX = midX + perpX * curvature
  const cpY = midY + perpY * curvature

  return `M ${startX} ${startY} Q ${cpX} ${cpY} ${endX} ${endY}`
}
