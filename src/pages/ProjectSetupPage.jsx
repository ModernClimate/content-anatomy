import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import StagesEditor from '@/components/projects/StagesEditor'
import SwimLanesEditor from '@/components/projects/SwimLanesEditor'
import ColorCategoriesEditor from '@/components/projects/ColorCategoriesEditor'
import MembersEditor from '@/components/projects/MembersEditor'

const DEFAULT_STAGES = [
  'Awareness', 'Familiarity', 'Understanding',
  'Consideration', 'Conversion', 'Loyalty', 'Advocacy'
]

export default function ProjectSetupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loadProject, currentProject, stages, swimLanes, colorCategories, saveStages, saveSwimLanes, saveColorCategories } = useProjectStore()

  const [localStages, setLocalStages] = useState([])
  const [localLanes, setLocalLanes] = useState([])
  const [localCategories, setLocalCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    loadProject(id)
  }, [id])

  useEffect(() => {
    if (stages.length > 0) setLocalStages(stages.map(s => s.label))
    else setLocalStages(DEFAULT_STAGES)

    if (swimLanes.length > 0) setLocalLanes(swimLanes.map(l => l.label))
    else setLocalLanes(['Primary Journey'])

    if (colorCategories.length > 0) setLocalCategories(colorCategories)
    else setLocalCategories([
      { label: 'Existing Content', hex_color: '#6b7280', description: '' },
      { label: 'Content Gap', hex_color: '#ef4444', description: 'Content that needs to be created' },
      { label: 'Needs Rework', hex_color: '#f59e0b', description: '' },
      { label: 'Interaction', hex_color: '#3b82f6', description: '' },
      { label: 'External Link', hex_color: '#8b5cf6', description: '' },
    ])
  }, [stages, swimLanes, colorCategories])

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([
        saveStages(id, localStages),
        saveSwimLanes(id, localLanes),
        saveColorCategories(id, localCategories)
      ])
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-wide">{currentProject?.client_name}</p>
          <h1 className="text-xl font-semibold text-gray-900">{currentProject?.name} — Setup</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(`/projects/${id}/diagram`)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            Go to Diagram
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm bg-brand-600 text-white rounded-lg hover:bg-brand-500 disabled:opacity-50"
          >
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Configuration'}
          </button>
        </div>
      </div>

      <div className="space-y-8">
        <StagesEditor stages={localStages} onChange={setLocalStages} />
        <SwimLanesEditor lanes={localLanes} onChange={setLocalLanes} />
        <ColorCategoriesEditor categories={localCategories} onChange={setLocalCategories} />
        <MembersEditor projectId={id} />
      </div>
    </div>
  )
}
