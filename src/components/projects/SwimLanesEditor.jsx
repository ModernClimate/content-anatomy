import { Plus, X, GripVertical } from 'lucide-react'

export default function SwimLanesEditor({ lanes, onChange }) {
  const add = () => onChange([...lanes, 'New Lane'])
  const remove = (i) => onChange(lanes.filter((_, idx) => idx !== i))
  const update = (i, val) => onChange(lanes.map((l, idx) => idx === i ? val : l))

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Swim Lanes</h2>
      <p className="text-xs text-gray-500 mb-3">The horizontal rows of the diagram. Use these for parallel audience journeys (e.g. "Patient Journey" vs "B2B Journey").</p>
      <div className="space-y-2">
        {lanes.map((lane, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical size={14} className="text-gray-300 cursor-grab" />
            <input
              value={lane}
              onChange={e => update(i, e.target.value)}
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-400">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-500"
      >
        <Plus size={12} /> Add Lane
      </button>
    </div>
  )
}
