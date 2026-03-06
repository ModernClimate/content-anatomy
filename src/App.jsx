import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import ProjectNewPage from '@/pages/ProjectNewPage'
import ProjectSetupPage from '@/pages/ProjectSetupPage'
import DiagramPage from '@/pages/DiagramPage'
import ClientViewPage from '@/pages/ClientViewPage'
import InvitePage from '@/pages/InvitePage'
import ProtectedRoute from '@/components/layout/ProtectedRoute'

export default function App() {
  const { initialize, loading } = useAuthStore()

  useEffect(() => { initialize() }, [])

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invite/:token" element={<InvitePage />} />
      <Route path="/" element={<ProtectedRoute />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="projects/new" element={<ProjectNewPage />} />
        <Route path="projects/:id/setup" element={<ProjectSetupPage />} />
        <Route path="projects/:id/diagram" element={<DiagramPage />} />
        <Route path="projects/:id/client" element={<ClientViewPage />} />
      </Route>
    </Routes>
  )
}
