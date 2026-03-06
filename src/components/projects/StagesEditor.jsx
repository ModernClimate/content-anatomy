import { Plus, X, GripVertical } from 'lucide-react'

export default function StagesEditor({ stages, onChange }) {
  const add = () => onChange([...stages, 'New Stage'])
  const remove = (i) => onChange(stages.filter((_, idx) => idx !== i))
  const update = (i, val) => onChange(stages.map((s, idx) => idx === i ? val : s))

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Mindset Stages</h2>
      <p className="text-xs text-gray-500 mb-3">The horizontal columns of the diagram. Order matters — left to right is the consumer's journey.</p>
      <div className="space-y-2">
        {stages.map((stage, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical size={14} className="text-gray-300 cursor-grab" />
            <input
              value={stage}
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
        <Plus size={12} /> Add Stage
      </button>
    </div>
  )
}
