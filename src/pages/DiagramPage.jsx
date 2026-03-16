import { useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagramStore } from '@/stores/useDiagramStore'
import { useUIStore } from '@/stores/useUIStore'
import { useCommentStore } from '@/stores/useCommentStore'
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts'
import DiagramToolbar from '@/components/diagram/DiagramToolbar'
import DiagramCanvas from '@/components/diagram/DiagramCanvas'
import BubbleSidebar from '@/components/sidebar/BubbleSidebar'
import DiagramLegend from '@/components/diagram/DiagramLegend'

export default function DiagramPage() {
  const { id } = useParams()
  const { loadProject, currentProject, stages, swimLanes, colorCategories } = useProjectStore()
  const { loadPositions, sync, bubbles, isSyncing, syncError } = useDiagramStore()
  const { sidebarOpen } = useUIStore()
  const { loadAllCounts, subscribeToComments, unsubscribe } = useCommentStore()
  const svgRef = useRef(null)

  useKeyboardShortcuts({ onSync: () => sync(id, stages, swimLanes) })

  useEffect(() => {
    const init = async () => {
      await loadProject(id)
      await loadPositions(id)
      await loadAllCounts(id)
      subscribeToComments(id)
    }
    init()
    return () => unsubscribe()
  }, [id])

  // Auto-sync on first load once project config is available
  useEffect(() => {
    if (stages.length > 0 && swimLanes.length > 0 && bubbles.length === 0) {
      sync(id, stages, swimLanes)
    }
  }, [stages, swimLanes])

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      <DiagramToolbar
        projectId={id}
        projectName={currentProject?.name}
        clientName={currentProject?.client_name}
        sheetUrl={currentProject?.sheet_url}
        isSyncing={isSyncing}
        onSync={() => sync(id, stages, swimLanes)}
        svgRef={svgRef}
        stages={stages}
        swimLanes={swimLanes}
      />
      <div className="flex flex-1 overflow-hidden relative">
        {syncError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2 rounded-lg shadow z-50">
            Sync failed: {syncError}
          </div>
        )}
        <div className="flex-1 overflow-hidden">
          <DiagramCanvas
            projectId={id}
            stages={stages}
            swimLanes={swimLanes}
            colorCategories={colorCategories}
            readOnly={false}
            svgRef={svgRef}
          />
        </div>
        {sidebarOpen && (
          <BubbleSidebar projectId={id} readOnly={false} />
        )}
      </div>
      <DiagramLegend colorCategories={colorCategories} />
    </div>
  )
}
