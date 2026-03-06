import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  stages: [],
  swimLanes: [],
  colorCategories: [],
  members: [],
  loading: false,

  loadProjects: async () => {
    set({ loading: true })
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('archived', false)
      .order('created_at', { ascending: false })
    if (!error) set({ projects: data })
    set({ loading: false })
  },

  loadProject: async (id) => {
    set({ loading: true })
    const [
      { data: project },
      { data: stages },
      { data: swimLanes },
      { data: colorCategories },
      { data: members }
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('id', id).single(),
      supabase.from('stages').select('*').eq('project_id', id).order('order'),
      supabase.from('swim_lanes').select('*').eq('project_id', id).order('order'),
      supabase.from('color_categories').select('*').eq('project_id', id).order('order'),
      supabase.from('project_members').select('*, profile:profiles(*)').eq('project_id', id)
    ])
    set({ currentProject: project, stages, swimLanes, colorCategories, members, loading: false })
  },

  createProject: async ({ name, clientName, userId }) => {
    const { data, error } = await supabase
      .from('projects')
      .insert({ name, client_name: clientName, created_by: userId })
      .select()
      .single()
    if (error) throw error

    // Creator becomes a strategist automatically
    await supabase.from('project_members').insert({
      project_id: data.id,
      user_id: userId,
      role: 'strategist'
    })

    return data
  },

  saveStages: async (projectId, stages) => {
    await supabase.from('stages').delete().eq('project_id', projectId)
    if (stages.length === 0) return
    const { error } = await supabase.from('stages').insert(
      stages.map((label, i) => ({ project_id: projectId, label, order: i }))
    )
    if (error) throw error
    set({ stages: stages.map((label, i) => ({ label, order: i })) })
  },

  saveSwimLanes: async (projectId, swimLanes) => {
    await supabase.from('swim_lanes').delete().eq('project_id', projectId)
    if (swimLanes.length === 0) return
    const { error } = await supabase.from('swim_lanes').insert(
      swimLanes.map((label, i) => ({ project_id: projectId, label, order: i }))
    )
    if (error) throw error
    set({ swimLanes: swimLanes.map((label, i) => ({ label, order: i })) })
  },

  saveColorCategories: async (projectId, colorCategories) => {
    await supabase.from('color_categories').delete().eq('project_id', projectId)
    if (colorCategories.length === 0) return
    const { error } = await supabase.from('color_categories').insert(
      colorCategories.map((cat, i) => ({
        project_id: projectId,
        label: cat.label,
        hex_color: cat.hex_color,
        description: cat.description || '',
        order: i
      }))
    )
    if (error) throw error
  }
}))
