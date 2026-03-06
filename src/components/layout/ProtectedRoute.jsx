import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import AppShell from './AppShell'

export default function ProtectedRoute() {
  const { user } = useAuthStore()
  if (!user) return <Navigate to="/login" replace />
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
