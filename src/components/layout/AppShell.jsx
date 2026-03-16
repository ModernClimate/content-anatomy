import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { LayoutGrid, LogOut } from 'lucide-react'

export default function AppShell({ children }) {
  const { profile, signOut } = useAuthStore()
  const location = useLocation()

  // Diagram and client pages use the full screen — no top nav
  const isDiagramPage = location.pathname.includes('/diagram') || location.pathname.includes('/client')
  if (isDiagramPage) return <>{children}</>

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between h-12">
          <Link to="/dashboard" className="flex items-center gap-2 text-sm font-semibold text-gray-900">
            <LayoutGrid size={16} className="text-brand-600" />
            Content Anatomy Builder
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">{profile?.full_name || profile?.email}</span>
            <button
              onClick={signOut}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </div>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  )
}
