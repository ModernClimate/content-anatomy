export default function ConnectionMarkers() {
  return (
    <defs>
      {/* Default arrowhead: gray */}
      <marker
        id="arrow-default"
        markerWidth="8"
        markerHeight="6"
        refX="7"
        refY="3"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#d1d5db" />
      </marker>

      {/* Active arrowhead: blue */}
      <marker
        id="arrow-active"
        markerWidth="8"
        markerHeight="6"
        refX="7"
        refY="3"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#3b82f6" />
      </marker>

      {/* Hovered arrowhead: dark gray */}
      <marker
        id="arrow-hovered"
        markerWidth="8"
        markerHeight="6"
        refX="7"
        refY="3"
        orient="auto"
        markerUnits="userSpaceOnUse"
      >
        <polygon points="0 0, 8 3, 0 6" fill="#6b7280" />
      </marker>
    </defs>
  )
}
