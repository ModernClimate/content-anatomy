export const STAGE_WIDTH = 300
export const LANE_HEIGHT = 420
export const HEADER_HEIGHT = 56
export const LANE_LABEL_WIDTH = 130

export const BUBBLE_RADIUS = { 1: 22, 2: 35, 3: 50, 4: 65, 5: 82 }

export function getRadius(size) {
  return BUBBLE_RADIUS[Math.min(5, Math.max(1, parseInt(size) || 2))]
}

export function getCanvasSize(stages, swimLanes) {
  return {
    width: LANE_LABEL_WIDTH + stages.length * STAGE_WIDTH + 60,
    height: HEADER_HEIGHT + swimLanes.length * LANE_HEIGHT + 40
  }
}

export function getZoneBounds(stageIndex, laneIndex) {
  return {
    x: LANE_LABEL_WIDTH + stageIndex * STAGE_WIDTH,
    y: HEADER_HEIGHT + laneIndex * LANE_HEIGHT,
    width: STAGE_WIDTH,
    height: LANE_HEIGHT
  }
}
