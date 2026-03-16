import { STAGE_WIDTH, LANE_HEIGHT, HEADER_HEIGHT, LANE_LABEL_WIDTH } from './diagramConstants'

/**
 * Generate a clean SVG string from the diagram SVG element.
 * Resets transform, embeds font import, adds footer.
 */
export function generateExportSVG(svgElement, stages, swimLanes, projectName, clientName) {
  const totalWidth  = LANE_LABEL_WIDTH + stages.length   * STAGE_WIDTH  + 60
  const totalHeight = HEADER_HEIGHT    + swimLanes.length * LANE_HEIGHT  + 80

  const clone = svgElement.cloneNode(true)

  // Reset the transform group to show the full canvas
  const mainGroup = clone.querySelector('g')
  if (mainGroup) mainGroup.setAttribute('transform', 'translate(0,0) scale(1)')

  clone.setAttribute('width',   String(totalWidth))
  clone.setAttribute('height',  String(totalHeight))
  clone.setAttribute('viewBox', `0 0 ${totalWidth} ${totalHeight}`)
  clone.setAttribute('xmlns',   'http://www.w3.org/2000/svg')

  // Remove comment badges from export
  clone.querySelectorAll('[data-comment-badge]').forEach(el => el.remove())

  // Inline font
  const style = document.createElementNS('http://www.w3.org/2000/svg', 'style')
  style.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
    text { font-family: Inter, system-ui, sans-serif; }
  `
  clone.insertBefore(style, clone.firstChild)

  // Footer
  const footerY = totalHeight - 20
  const footer = document.createElementNS('http://www.w3.org/2000/svg', 'g')
  footer.innerHTML = `
    <line x1="${LANE_LABEL_WIDTH}" y1="${footerY - 12}" x2="${totalWidth - 40}" y2="${footerY - 12}" stroke="#e5e7eb" stroke-width="1"/>
    <text x="${LANE_LABEL_WIDTH}" y="${footerY}" font-size="10" fill="#9ca3af" font-family="Inter, sans-serif">
      ${clientName} — ${projectName} — Content Anatomy
    </text>
    <text x="${totalWidth - 40}" y="${footerY}" text-anchor="end" font-size="10" fill="#d1d5db" font-family="Inter, sans-serif">
      Modern Climate
    </text>
  `
  clone.appendChild(footer)

  const serializer = new XMLSerializer()
  return serializer.serializeToString(clone)
}

/**
 * Download an SVG string as a .svg file.
 */
export function downloadSVG(svgString, filename) {
  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Render SVG to canvas using canvg, then generate a PDF via jsPDF.
 */
export async function downloadPDF(svgString, filename, totalWidth, totalHeight) {
  const { jsPDF } = await import('jspdf')
  const { Canvg } = await import('canvg')

  const canvas = document.createElement('canvas')
  const scale = 2
  canvas.width  = totalWidth  * scale
  canvas.height = totalHeight * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  const v = Canvg.fromString(ctx, svgString, {
    ignoreDimensions: true,
    scaleWidth: totalWidth,
    scaleHeight: totalHeight
  })
  await v.render()

  const imgData = canvas.toDataURL('image/png', 1.0)

  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [totalWidth, totalHeight],
    compress: true
  })

  pdf.addImage(imgData, 'PNG', 0, 0, totalWidth, totalHeight, undefined, 'FAST')
  pdf.save(filename)
}
