import { Plus, X, GripVertical } from 'lucide-react'

export default function ColorCategoriesEditor({ categories, onChange }) {
  const add = () => onChange([...categories, { label: 'New Category', hex_color: '#6b7280', description: '' }])
  const remove = (i) => onChange(categories.filter((_, idx) => idx !== i))
  const update = (i, field, val) => onChange(
    categories.map((cat, idx) => idx === i ? { ...cat, [field]: val } : cat)
  )

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Color Categories</h2>
      <p className="text-xs text-gray-500 mb-3">Used to color-code bubbles by status, type, or audience. Each project defines its own categories.</p>
      <div className="space-y-2">
        {categories.map((cat, i) => (
          <div key={i} className="flex items-center gap-2">
            <GripVertical size={14} className="text-gray-300 cursor-grab flex-shrink-0" />
            <input
              type="color"
              value={cat.hex_color}
              onChange={e => update(i, 'hex_color', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border border-gray-200 p-0.5 flex-shrink-0"
            />
            <input
              value={cat.label}
              onChange={e => update(i, 'label', e.target.value)}
              placeholder="Label"
              className="w-36 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <input
              value={cat.description}
              onChange={e => update(i, 'description', e.target.value)}
              placeholder="Description (optional)"
              className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <button onClick={() => remove(i)} className="text-gray-300 hover:text-red-400 flex-shrink-0">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        onClick={add}
        className="mt-2 flex items-center gap-1 text-xs text-brand-600 hover:text-brand-500"
      >
        <Plus size={12} /> Add Category
      </button>
    </div>
  )
}
