import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { STAGE_WIDTH, LANE_HEIGHT, HEADER_HEIGHT, LANE_LABEL_WIDTH } from '@/lib/diagramConstants'

export const useDiagramStore = create((set, get) => ({
  bubbles: [],
  positions: {},       // { [bubbleId]: { x, y } }
  isSyncing: false,
  syncError: null,
  lastSyncedAt: null,

  // Load saved positions from Supabase
  loadPositions: async (projectId) => {
    const { data } = await supabase
      .from('bubble_positions')
      .select('bubble_id, x, y')
      .eq('project_id', projectId)

    if (data) {
      const positions = {}
      data.forEach(p => { positions[p.bubble_id] = { x: p.x, y: p.y } })
      set({ positions })
    }
  },

  // Fetch bubbles from Google Sheet via API
  sync: async (projectId, stages, swimLanes) => {
    set({ isSyncing: true, syncError: null })
    try {
      const data = await api.sheets.sync(projectId)
      const { bubbles, syncedAt } = data

      // Compute positions for new bubbles (no saved position yet)
      const currentPositions = get().positions
      const newPositions = autoLayout(bubbles, currentPositions, stages, swimLanes)

      // Save new positions to Supabase
      const toSave = Object.entries(newPositions)
        .filter(([bubbleId]) => !currentPositions[bubbleId])
        .map(([bubbleId, pos]) => ({ project_id: projectId, bubble_id: bubbleId, x: pos.x, y: pos.y }))

      if (toSave.length > 0) {
        await supabase.from('bubble_positions').upsert(toSave, { onConflict: 'project_id,bubble_id' })
      }

      set({
        bubbles,
        positions: newPositions,
        isSyncing: false,
        lastSyncedAt: syncedAt
      })
    } catch (err) {
      set({ isSyncing: false, syncError: err.message })
    }
  },

  saveBubblePosition: async (projectId, bubbleId, x, y) => {
    set(state => ({
      positions: { ...state.positions, [bubbleId]: { x, y } }
    }))
    await supabase.from('bubble_positions').upsert(
      { project_id: projectId, bubble_id: bubbleId, x, y, updated_at: new Date().toISOString() },
      { onConflict: 'project_id,bubble_id' }
    )
  }
}))


function autoLayout(bubbles, existingPositions, stages, swimLanes) {
  const positions = { ...existingPositions }
  const byZone = {}

  bubbles.forEach(bubble => {
    if (positions[bubble.id]) return
    const si = stages.findIndex(s => s.label === bubble.stage)
    const li = swimLanes.findIndex(l => l.label === bubble.swimLane)
    if (si === -1 || li === -1) return
    const key = `${si}_${li}`
    if (!byZone[key]) byZone[key] = { si, li, bubbles: [] }
    byZone[key].bubbles.push(bubble)
  })

  Object.values(byZone).forEach(({ si, li, bubbles: zoneBubbles }) => {
    const baseX = LANE_LABEL_WIDTH + si * STAGE_WIDTH
    const baseY = HEADER_HEIGHT + li * LANE_HEIGHT
    const pad = 30
    const inner = { x: baseX + pad, y: baseY + pad, w: STAGE_WIDTH - pad * 2, h: LANE_HEIGHT - pad * 2 }
    const sorted = [...zoneBubbles].sort((a, b) => b.bubbleSize - a.bubbleSize)
    const cols = Math.ceil(Math.sqrt(sorted.length))

    sorted.forEach((bubble, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const rows = Math.ceil(sorted.length / cols)
      const cw = inner.w / cols
      const ch = inner.h / rows
      positions[bubble.id] = {
        x: inner.x + col * cw + cw / 2 + (Math.random() - 0.5) * 20,
        y: inner.y + row * ch + ch / 2 + (Math.random() - 0.5) * 20
      }
    })
  })

  return positions
}
