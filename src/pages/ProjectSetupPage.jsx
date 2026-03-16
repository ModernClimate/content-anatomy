import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { useDiagramStore } from '@/stores/useDiagramStore'
import { api } from '@/lib/api'
import StagesEditor from '@/components/projects/StagesEditor'
import SwimLanesEditor from '@/components/projects/SwimLanesEditor'
import ColorCategoriesEditor from '@/components/projects/ColorCategoriesEditor'
import MembersEditor from '@/components/projects/MembersEditor'
import { ExternalLink, FileSpreadsheet, Copy, Check } from 'lucide-react'

const DEFAULT_STAGES = [
  'Awareness', 'Familiarity', 'Understanding',
  'Consideration', 'Conversion', 'Loyalty', 'Advocacy'
]

export default function ProjectSetupPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { loadProject, currentProject, stages, swimLanes, colorCategories, saveStages, saveSwimLanes, saveColorCategories } = useProjectStore()
  const { profile } = useAuthStore()

  const [localStages, setLocalStages] = useState([])
  const [localLanes, setLocalLanes] = useState([])
  const [localCategories, setLocalCategories] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [creatingSheet, setCreatingSheet] = useState(false)
  const [sheetError, setSheetError] = useState(null)

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
      // Keep sheet dropdowns in sync if sheet already exists
      if (currentProject?.sheet_id) {
        await api.sheets.updateConfig({
          projectId: id,
          stages: localStages,
          swimLanes: localLanes,
          colorCategories: localCategories.map(c => c.label)
        }).catch(console.error)
      }
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateSheet = async () => {
    if (!currentProject) {
      setSheetError('Project data is still loading. Please refresh the page and try again.')
      return
    }
    if (!profile) {
      setSheetError('User profile not found. Please sign out and sign back in.')
      return
    }
    if (!localStages.length || !localLanes.length || !localCategories.length) {
      setSheetError('Please configure stages, swim lanes, and color categories first.')
      return
    }
    setCreatingSheet(true)
    setSheetError(null)
    try {
      await api.sheets.create({
        projectId: id,
        projectName: currentProject.name,
        clientName: currentProject.client_name,
        stages: localStages,
        swimLanes: localLanes,
        colorCategories: localCategories.map(c => c.label),
        userEmail: profile.email
      })
      await loadProject(id)
    } catch (err) {
      setSheetError(err.message)
    } finally {
      setCreatingSheet(false)
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

        {!currentProject?.sheet_id ? (
          <div className="border border-dashed border-gray-300 rounded-xl p-6">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Google Sheet</h2>
            <p className="text-xs text-gray-500 mb-4">
              Generate a pre-formatted Google Sheet for this project. Once created, open it in your browser and start adding bubble data.
            </p>
            {sheetError && <p className="text-xs text-red-600 mb-3">{sheetError}</p>}
            <button
              onClick={handleCreateSheet}
              disabled={creatingSheet}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-500 disabled:opacity-50"
            >
              <FileSpreadsheet size={16} />
              {creatingSheet ? 'Creating Sheet...' : 'Create Google Sheet'}
            </button>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-gray-800 mb-1">Google Sheet Connected</h2>
            <a
              href={currentProject.sheet_url}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-sm text-green-700 hover:text-green-600 font-medium"
            >
              <ExternalLink size={14} />
              Open Sheet
            </a>
            <SyncTest projectId={id} stages={stages} swimLanes={swimLanes} />
          </div>
        )}

        <MembersEditor projectId={id} />

        <ClientShareLink projectId={id} />
      </div>
    </div>
  )
}

function ClientShareLink({ projectId }) {
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/projects/${projectId}/client`

  const copy = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="border border-gray-200 rounded-xl p-5">
      <p className="text-sm font-semibold text-gray-800 mb-1">Client View Link</p>
      <p className="text-xs text-gray-500 mb-3">Share this link with clients. They must accept their invite first.</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 bg-gray-100 text-xs text-gray-600 px-3 py-2 rounded-lg truncate">
          {shareUrl}
        </code>
        <button
          onClick={copy}
          className="flex items-center gap-1 text-xs px-3 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 shrink-0"
        >
          {copied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

function SyncTest({ projectId, stages, swimLanes }) {
  const { sync, bubbles, isSyncing, syncError, lastSyncedAt } = useDiagramStore()

  return (
    <div className="mt-4 pt-4 border-t border-green-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-gray-700">Sheet Data</p>
        <button
          onClick={() => sync(projectId, stages, swimLanes)}
          disabled={isSyncing}
          className="text-xs bg-brand-600 text-white px-3 py-1.5 rounded-lg hover:bg-brand-500 disabled:opacity-50"
        >
          {isSyncing ? 'Syncing...' : 'Refresh from Sheet'}
        </button>
      </div>
      {syncError && <p className="text-xs text-red-600">{syncError}</p>}
      {lastSyncedAt && <p className="text-xs text-gray-400">Last synced: {new Date(lastSyncedAt).toLocaleTimeString()}</p>}
      <p className="text-xs text-gray-500 mt-1">{bubbles.length} bubbles loaded ({bubbles.filter(b => !b.valid).length} with warnings)</p>
      {bubbles.filter(b => !b.valid).map(b => (
        <div key={b.id} className="mt-1 text-xs text-amber-600">
          Row {b.rowIndex} ({b.id}): {b.warnings.join(', ')}
        </div>
      ))}
    </div>
  )
}
