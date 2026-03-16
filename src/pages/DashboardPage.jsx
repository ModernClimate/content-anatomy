import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useProjectStore } from '@/stores/useProjectStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { Skeleton } from '@/components/ui/Skeleton'
import { Plus } from 'lucide-react'

export default function DashboardPage() {
  const { projects, loading, loadProjects } = useProjectStore()
  const { profile } = useAuthStore()

  useEffect(() => { loadProjects() }, [])

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, {profile?.full_name || profile?.email}</p>
        </div>
        <Link
          to="/projects/new"
          className="flex items-center gap-2 bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-500"
        >
          <Plus size={16} />
          New Project
        </Link>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-5">
              <Skeleton className="h-3 w-16 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="h-8 w-full" />
            </div>
          ))}
        </div>
      )}

      {!loading && projects.length === 0 && (
        <div className="text-center py-24 text-gray-400">
          <p className="text-lg font-medium mb-2">No projects yet</p>
          <p className="text-sm">Create your first content anatomy project to get started.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  )
}

function ProjectCard({ project }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-brand-500 hover:shadow-sm transition-all">
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{project.client_name}</p>
      <h2 className="text-base font-semibold text-gray-900 mb-3">{project.name}</h2>
      <div className="flex gap-2">
        <Link
          to={`/projects/${project.id}/diagram`}
          className="flex-1 text-center bg-brand-600 text-white rounded-lg py-1.5 text-xs font-medium hover:bg-brand-500"
        >
          Open Diagram
        </Link>
        <Link
          to={`/projects/${project.id}/setup`}
          className="flex-1 text-center bg-gray-100 text-gray-700 rounded-lg py-1.5 text-xs font-medium hover:bg-gray-200"
        >
          Settings
        </Link>
      </div>
    </div>
  )
}
