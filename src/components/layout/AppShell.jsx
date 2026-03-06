import { Link } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'

export default function AppShell({ children }) {
  const { profile, signOut } = useAuthStore()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <Link to="/dashboard" className="text-sm font-semibold text-gray-900">
          Content Anatomy
        </Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{profile?.full_name || profile?.email}</span>
          <button
            onClick={signOut}
            className="text-sm text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
