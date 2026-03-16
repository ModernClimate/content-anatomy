import { useRef, useCallback, useMemo } from 'react'
import { useDiagramStore } from '@/stores/useDiagramStore'
import { useUIStore } from '@/stores/useUIStore'
import { getCanvasSize } from '@/lib/diagramConstants'
import { useBubbleDrag } from '@/hooks/useBubbleDrag'
import GridLayer from './GridLayer'
import LabelsLayer from './LabelsLayer'
import ConnectionLayer from './ConnectionLayer'
import BubbleLayer from './BubbleLayer'
import ConnectionMarkers from './ConnectionMarkers'
import { usePanZoom } from '@/hooks/usePanZoom'

export default function DiagramCanvas({ projectId, stages, swimLanes, colorCategories, readOnly, svgRef: externalSvgRef }) {
  const containerRef = useRef(null)
  const internalSvgRef = useRef(null)
  const svgRef = externalSvgRef || internalSvgRef
  const { bubbles, positions, saveBubblePosition } = useDiagramStore()
  const { zoom, panOffset, showConnections } = useUIStore()
  const { handleWheel, handlePanStart, handlePanMove, handlePanEnd } = usePanZoom()

  const { width: canvasWidth, height: canvasHeight } = useMemo(
    () => getCanvasSize(stages, swimLanes),
    [stages, swimLanes]
  )

  const handleDragComplete = useCallback((bubbleId, x, y) => {
    if (!readOnly) saveBubblePosition(projectId, bubbleId, x, y)
  }, [projectId, readOnly])

  // Drag state lifted here so ConnectionLayer gets real-time positions during drag
  const { localPositions, handleDragStart } = useBubbleDrag({
    positions,
    zoom,
    onDragComplete: handleDragComplete,
    readOnly
  })

  if (stages.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-sm">
        No stages configured. Go to project settings to set up your mindset stages.
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden cursor-grab active:cursor-grabbing select-none"
      onWheel={handleWheel}
      onMouseDown={handlePanStart}
      onMouseMove={handlePanMove}
      onMouseUp={handlePanEnd}
      onMouseLeave={handlePanEnd}
    >
      <svg
        ref={svgRef}
        width={canvasWidth}
        height={canvasHeight}
        style={{ display: 'block' }}
      >
        <ConnectionMarkers />
        <g transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoom})`}>
          <GridLayer stages={stages} swimLanes={swimLanes} bubbles={bubbles} />
          {showConnections && (
            <ConnectionLayer bubbles={bubbles} positions={localPositions} />
          )}
          <BubbleLayer
            bubbles={bubbles}
            localPositions={localPositions}
            colorCategories={colorCategories}
            onDragStart={handleDragStart}
            readOnly={readOnly}
          />
          <LabelsLayer stages={stages} swimLanes={swimLanes} />
        </g>
      </svg>
    </div>
  )
}
