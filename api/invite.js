import { requireAuth, requireStrategist } from './_lib/auth.js'
import { handleError } from './_lib/errors.js'
import { createClient } from '@supabase/supabase-js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()
  try {
    const { user, supabase } = await requireAuth(req)
    const { projectId, email, role } = req.body
    await requireStrategist(supabase, user.id, projectId)

    // Admin client to send invite email and create user if needed
    const adminSupabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Check if user already exists
    const { data: existingUsers } = await adminSupabase
      .from('profiles')
      .select('id')
      .eq('email', email)

    if (existingUsers?.length > 0) {
      // User exists: add directly to project
      await supabase.from('project_members').upsert({
        project_id: projectId,
        user_id: existingUsers[0].id,
        role,
        invited_by: user.id
      })
      return res.status(200).json({ success: true, data: { invited: true, isNewUser: false, email } })
    }

    // New user: create invite record and send magic link
    const token = crypto.randomUUID()
    await adminSupabase.from('invites').insert({
      project_id: projectId,
      email,
      role,
      invited_by: user.id,
      token
    })

    const siteUrl = process.env.SITE_URL || 'http://localhost:5173'
    await adminSupabase.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${siteUrl}/invite/${token}`
    })

    return res.status(200).json({ success: true, data: { invited: true, isNewUser: true, email } })
  } catch (err) {
    return handleError(res, err)
  }
}
