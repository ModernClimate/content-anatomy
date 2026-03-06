import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'

export default function ProjectNewPage() {
  const { createProject } = useProjectStore()
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const project = await createProject({ name, clientName, userId: user.id })
      navigate(`/projects/${project.id}/setup`)
    } catch (err) {
      setError(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg mx-auto px-6 py-10">
      <h1 className="text-xl font-semibold text-gray-900 mb-6">New Project</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Website Content Anatomy v2"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Client Name</label>
          <input
            type="text"
            value={clientName}
            onChange={e => setClientName(e.target.value)}
            placeholder="e.g. Acme Corporation"
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-brand-500 disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Project & Configure →'}
        </button>
      </form>
    </div>
  )
}
