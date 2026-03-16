import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import { useDiagramStore } from '@/stores/useDiagramStore'
import { useCommentStore } from '@/stores/useCommentStore'
import { useUIStore } from '@/stores/useUIStore'
import DiagramCanvas from '@/components/diagram/DiagramCanvas'
import BubbleSidebar from '@/components/sidebar/BubbleSidebar'
import DiagramLegend from '@/components/diagram/DiagramLegend'

export default function ClientViewPage() {
  const { id } = useParams()
  const { loadProject, currentProject, stages, swimLanes, colorCategories } = useProjectStore()
  const { loadPositions, sync, bubbles } = useDiagramStore()
  const { loadAllCounts, subscribeToComments, unsubscribe } = useCommentStore()
  const { sidebarOpen } = useUIStore()

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

  useEffect(() => {
    if (stages.length > 0 && swimLanes.length > 0 && bubbles.length === 0) {
      sync(id, stages, swimLanes)
    }
  }, [stages, swimLanes])

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Minimal client header */}
      <div className="flex items-center justify-between px-5 py-3 bg-white border-b border-gray-200 shrink-0">
        <div>
          <p className="text-xs text-gray-400">{currentProject?.client_name}</p>
          <h1 className="text-sm font-semibold text-gray-900">{currentProject?.name}</h1>
        </div>
        <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">View Only</span>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <DiagramCanvas
            projectId={id}
            stages={stages}
            swimLanes={swimLanes}
            colorCategories={colorCategories}
            readOnly={true}
          />
        </div>
        {sidebarOpen && (
          <BubbleSidebar projectId={id} readOnly={true} />
        )}
      </div>

      <DiagramLegend colorCategories={colorCategories} />
    </div>
  )
}
