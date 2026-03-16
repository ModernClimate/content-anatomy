import { createClient } from '@supabase/supabase-js'

export async function requireAuth(req) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) throw { status: 401, message: 'No authorization token' }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw { status: 401, message: 'Invalid or expired token' }
  return { user, supabase }
}

export async function requireProjectMember(supabase, userId, projectId) {
  const { data, error } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()
  if (error || !data) throw { status: 403, message: 'Not a member of this project' }
  return data.role
}

export async function requireStrategist(supabase, userId, projectId) {
  const role = await requireProjectMember(supabase, userId, projectId)
  if (role !== 'strategist') throw { status: 403, message: 'Strategist role required' }
  return role
}
