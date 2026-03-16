import { useEffect } from 'react'
import { X } from 'lucide-react'
import { useDiagramStore } from '@/stores/useDiagramStore'
import { useProjectStore } from '@/stores/useProjectStore'
import { useUIStore } from '@/stores/useUIStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useCommentStore } from '@/stores/useCommentStore'
import { buildConnectionMap } from '@/lib/connectionUtils'
import CommentThread from './CommentThread'

export default function BubbleSidebar({ projectId, readOnly }) {
  const { activeBubbleId, closeSidebar } = useUIStore()
  const { bubbles } = useDiagramStore()
  const { stages, swimLanes, colorCategories, members } = useProjectStore()
  const { user, profile } = useAuthStore()
  const { loadComments, commentsByBubble } = useCommentStore()

  const bubble = bubbles.find(b => b.id === activeBubbleId)

  useEffect(() => {
    if (activeBubbleId && projectId) {
      loadComments(projectId, activeBubbleId)
    }
  }, [activeBubbleId, projectId])

  if (!bubble) return null

  const category = colorCategories.find(c => c.label === bubble.colorCategory)
  const connectionMap = buildConnectionMap(bubbles)
  const connectedIds = [...(connectionMap[bubble.id] || [])]
  const connectedBubbles = connectedIds.map(id => bubbles.find(b => b.id === id)).filter(Boolean)

  const myMembership = members.find(m => m.user_id === user?.id)
  const isStrategist = myMembership?.role === 'strategist'

  const comments = commentsByBubble[bubble.id] || []

  return (
    <div className="w-80 shrink-0 bg-white border-l border-gray-200 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between p-4 border-b border-gray-100">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 mb-1">
            {category && (
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: category.hex_color }}
              />
            )}
            <span className="text-xs text-gray-400 font-mono">{bubble.id}</span>
          </div>
          <h2 className="text-sm font-semibold text-gray-900 leading-snug">{bubble.title}</h2>
        </div>
        <button onClick={closeSidebar} className="text-gray-400 hover:text-gray-600 shrink-0 mt-0.5">
          <X size={16} />
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Metadata */}
        <div className="p-4 space-y-3 border-b border-gray-100">
          <MetaRow label="Stage" value={bubble.stage} />
          <MetaRow label="Swim Lane" value={bubble.swimLane} />
          <MetaRow label="Size" value={`${bubble.bubbleSize} / 5`} />
          <MetaRow label="Category" value={bubble.colorCategory} color={category?.hex_color} />
        </div>

        {/* Description */}
        {bubble.description && (
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">{bubble.description}</p>
          </div>
        )}

        {/* Notes — strategists only */}
        {isStrategist && bubble.notes && (
          <div className="p-4 border-b border-gray-100 bg-amber-50">
            <p className="text-xs font-medium text-amber-700 mb-1.5">Notes (Internal)</p>
            <p className="text-sm text-amber-800 leading-relaxed">{bubble.notes}</p>
          </div>
        )}

        {/* Validation warnings */}
        {!bubble.valid && bubble.warnings?.length > 0 && (
          <div className="p-4 border-b border-gray-100 bg-red-50">
            <p className="text-xs font-medium text-red-700 mb-1.5">Sheet Warnings</p>
            {bubble.warnings.map((w, i) => (
              <p key={i} className="text-xs text-red-600">• {w}</p>
            ))}
          </div>
        )}

        {/* Connected bubbles */}
        {connectedBubbles.length > 0 && (
          <div className="p-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Connections ({connectedBubbles.length})
            </p>
            <div className="space-y-1.5">
              {connectedBubbles.map(cb => {
                const cbCat = colorCategories.find(c => c.label === cb.colorCategory)
                return (
                  <button
                    key={cb.id}
                    className="w-full flex items-center gap-2 text-left hover:bg-gray-50 rounded-lg p-1.5 -mx-1.5 transition-colors"
                    onClick={() => useUIStore.getState().setActiveBubble(cb.id)}
                  >
                    {cbCat && (
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: cbCat.hex_color }}
                      />
                    )}
                    <span className="text-xs text-gray-700 leading-tight">{cb.title}</span>
                    <span className="text-xs text-gray-400 ml-auto shrink-0">{cb.stage}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Comments */}
        <CommentThread
          projectId={projectId}
          bubbleId={bubble.id}
          comments={comments}
          isStrategist={isStrategist}
          currentUserId={user?.id}
          currentUserName={profile?.full_name || profile?.email}
        />
      </div>
    </div>
  )
}

function MetaRow({ label, value, color }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="text-xs text-gray-400 shrink-0">{label}</span>
      <span className="flex items-center gap-1.5 text-xs text-gray-700 font-medium text-right">
        {color && (
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
        )}
        {value || '—'}
      </span>
    </div>
  )
}
