export default function DiagramLegend({ colorCategories }) {
  if (!colorCategories.length) return null

  return (
    <div className="flex items-center gap-4 px-4 py-2 bg-white border-t border-gray-200 shrink-0 overflow-x-auto">
      <span className="text-xs text-gray-400 font-medium shrink-0">Legend:</span>
      {colorCategories.map(cat => (
        <div key={cat.id} className="flex items-center gap-1.5 shrink-0">
          <span
            style={{
              backgroundColor: cat.hex_color + '20',
              border: `1.5px solid ${cat.hex_color}`,
              borderRadius: '50%',
              width: 14,
              height: 14,
              display: 'inline-block',
              flexShrink: 0
            }}
          />
          <span className="text-xs text-gray-600">{cat.label}</span>
        </div>
      ))}
      <div className="flex items-center gap-1.5 shrink-0 ml-2 border-l border-gray-200 pl-4">
        <svg width="46" height="14" viewBox="0 0 46 14">
          <circle cx="5"  cy="7" r="4"  fill="none" stroke="#9ca3af" strokeWidth="1.5" />
          <circle cx="18" cy="7" r="6"  fill="none" stroke="#9ca3af" strokeWidth="1.5" />
          <circle cx="35" cy="7" r="9"  fill="none" stroke="#9ca3af" strokeWidth="1.5" />
        </svg>
        <span className="text-xs text-gray-400">Size = importance</span>
      </div>
    </div>
  )
}
