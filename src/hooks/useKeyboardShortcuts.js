import { useEffect } from 'react'
import { useUIStore } from '@/stores/useUIStore'

export function useKeyboardShortcuts({ onSync } = {}) {
  const { closeSidebar, toggleConnections, toggleLabels, setZoom, zoom } = useUIStore()

  useEffect(() => {
    const handler = (e) => {
      // Escape: close sidebar
      if (e.key === 'Escape') closeSidebar()

      // Cmd/Ctrl + R: refresh from sheet
      if ((e.metaKey || e.ctrlKey) && e.key === 'r') {
        e.preventDefault()
        onSync?.()
      }

      // Cmd/Ctrl + L: toggle labels
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault()
        toggleLabels()
      }

      // + / - : zoom
      if (e.key === '=' || e.key === '+') setZoom(zoom * 1.15)
      if (e.key === '-') setZoom(zoom / 1.15)

      // Cmd/Ctrl + 0: reset zoom
      if (e.key === '0' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setZoom(1)
      }
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [zoom, onSync])
}
