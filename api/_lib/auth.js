import { createClient } from '@supabase/supabase-js'

export async function requireAuth(req) {
  const authHeader = req.headers['authorization']
  const token = authHeader?.replace('Bearer ', '')
  if (!token) throw new Error('Unauthorized')

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('Unauthorized')

  return { user, supabase }
}

export async function requireStrategist(supabase, userId, projectId) {
  const { data, error } = await supabase
    .from('project_members')
    .select('role')
    .eq('project_id', projectId)
    .eq('user_id', userId)
    .single()

  if (error || !data || data.role !== 'strategist') {
    throw new Error('Forbidden: strategist role required')
  }
}
