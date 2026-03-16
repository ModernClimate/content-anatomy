import { useState } from 'react'
import { RefreshCw, ExternalLink, ZoomIn, ZoomOut, Eye, EyeOff, Download, FileImage, FileText } from 'lucide-react'
import { useUIStore } from '@/stores/useUIStore'
import { STAGE_WIDTH, LANE_HEIGHT, HEADER_HEIGHT, LANE_LABEL_WIDTH } from '@/lib/diagramConstants'

export default function DiagramToolbar({
  projectId, projectName, clientName, sheetUrl,
  isSyncing, onSync,
  svgRef, stages, swimLanes
}) {
  const { zoom, setZoom, showConnections, showLabels, toggleConnections, toggleLabels } = useUIStore()
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format) => {
    if (!svgRef?.current) return
    setExporting(true)
    try {
      const { generateExportSVG, downloadSVG, downloadPDF } = await import('@/lib/exportUtils')
      const svgString = generateExportSVG(svgRef.current, stages, swimLanes, projectName, clientName)
      const safeName = `${(clientName || 'project').replace(/\s+/g, '-')}-content-anatomy`
      const totalWidth  = LANE_LABEL_WIDTH + stages.length   * STAGE_WIDTH  + 60
      const totalHeight = HEADER_HEIGHT    + swimLanes.length * LANE_HEIGHT  + 80

      if (format === 'svg') {
        downloadSVG(svgString, `${safeName}.svg`)
      } else {
        await downloadPDF(svgString, `${safeName}.pdf`, totalWidth, totalHeight)
      }
    } catch (err) {
      console.error('Export failed:', err)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
      {/* Project info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 truncate">{clientName}</p>
        <p className="text-sm font-semibold text-gray-800 truncate">{projectName}</p>
      </div>

      {/* Zoom controls */}
      <div className="flex items-center gap-1 border border-gray-200 rounded-lg px-1">
        <button onClick={() => setZoom(zoom / 1.2)} className="p-1.5 hover:bg-gray-100 rounded">
          <ZoomOut size={14} />
        </button>
        <span className="text-xs text-gray-500 w-10 text-center">{Math.round(zoom * 100)}%</span>
        <button onClick={() => setZoom(zoom * 1.2)} className="p-1.5 hover:bg-gray-100 rounded">
          <ZoomIn size={14} />
        </button>
      </div>

      {/* Toggle labels */}
      <button
        onClick={toggleLabels}
        className={`p-2 rounded-lg border text-xs flex items-center gap-1 ${showLabels ? 'border-brand-500 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-500'}`}
      >
        {showLabels ? <Eye size={13} /> : <EyeOff size={13} />}
        Labels
      </button>

      {/* Toggle connections */}
      <button
        onClick={toggleConnections}
        className={`p-2 rounded-lg border text-xs flex items-center gap-1 ${showConnections ? 'border-brand-500 text-brand-600 bg-brand-50' : 'border-gray-200 text-gray-500'}`}
      >
        Connections
      </button>

      {/* Open sheet */}
      {sheetUrl && (
        <a
          href={sheetUrl}
          target="_blank"
          rel="noreferrer"
          className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 flex items-center gap-1 text-xs"
        >
          <ExternalLink size={13} />
          Sheet
        </a>
      )}

      {/* Export dropdown */}
      <div className="relative group">
        <button
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 rounded-lg text-xs hover:bg-gray-50 disabled:opacity-50"
        >
          <Download size={13} />
          {exporting ? 'Exporting...' : 'Export'}
        </button>
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50 hidden group-hover:block w-36">
          <button
            onClick={() => handleExport('svg')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            <FileImage size={12} /> Export as SVG
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            <FileText size={12} /> Export as PDF
          </button>
        </div>
      </div>

      {/* Sync */}
      <button
        onClick={onSync}
        disabled={isSyncing}
        className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-brand-500 disabled:opacity-50"
      >
        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
        {isSyncing ? 'Syncing...' : 'Refresh'}
      </button>
    </div>
  )
}
