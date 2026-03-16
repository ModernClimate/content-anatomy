import { useState } from 'react'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { api } from '@/lib/api'
import { UserPlus } from 'lucide-react'

export default function MembersEditor({ projectId }) {
  const { members, loadProject } = useProjectStore()
  const { profile } = useAuthStore()
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('client')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  const handleInvite = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      const data = await api.invite.send({ projectId, email, role })
      setSuccess(data.isNewUser ? `Invite sent to ${email}` : `${email} added to project`)
      setEmail('')
      await loadProject(projectId)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <h2 className="text-sm font-semibold text-gray-800 mb-1">Team Members</h2>
      <p className="text-xs text-gray-500 mb-3">Invite strategists or clients to this project.</p>

      {members && members.length > 0 && (
        <div className="mb-4 space-y-1">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between text-sm py-1.5 border-b border-gray-100">
              <span className="text-gray-700">{m.profile?.full_name || m.profile?.email}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                m.role === 'strategist' ? 'bg-brand-50 text-brand-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {m.role}
              </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleInvite} className="flex items-center gap-2 mt-2">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email address"
          required
          className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <select
          value={role}
          onChange={e => setRole(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="client">Client</option>
          <option value="strategist">Strategist</option>
        </select>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-1.5 bg-brand-600 text-white px-3 py-1.5 rounded-lg text-sm font-medium hover:bg-brand-500 disabled:opacity-50"
        >
          <UserPlus size={14} />
          {loading ? 'Inviting...' : 'Invite'}
        </button>
      </form>

      {success && <p className="mt-2 text-xs text-green-600">{success}</p>}
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  )
}
