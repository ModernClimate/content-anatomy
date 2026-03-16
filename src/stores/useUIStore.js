import { create } from 'zustand'

export const useUIStore = create((set) => ({
  activeBubbleId: null,
  hoveredBubbleId: null,
  sidebarOpen: false,
  zoom: 1,
  panOffset: { x: 60, y: 20 },
  showConnections: true,
  showLabels: true,
  highlightCategory: null,

  setActiveBubble: (id) => set({ activeBubbleId: id, sidebarOpen: !!id }),
  setHoveredBubble: (id) => set({ hoveredBubbleId: id }),
  closeSidebar: () => set({ activeBubbleId: null, sidebarOpen: false }),
  setZoom: (zoom) => set({ zoom: Math.min(3, Math.max(0.15, zoom)) }),
  setPanOffset: (offset) => set({ panOffset: offset }),
  toggleConnections: () => set(s => ({ showConnections: !s.showConnections })),
  toggleLabels: () => set(s => ({ showLabels: !s.showLabels })),
  setHighlightCategory: (cat) => set({ highlightCategory: cat })
}))
