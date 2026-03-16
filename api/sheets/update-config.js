import { requireAuth, requireStrategist } from '../_lib/auth.js'
import { getGoogleAuth, getSheets } from '../_lib/google.js'
import { handleError } from '../_lib/errors.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { user, supabase } = await requireAuth(req)
    const { projectId, stages, swimLanes, colorCategories } = req.body

    await requireStrategist(supabase, user.id, projectId)

    const { data: project } = await supabase
      .from('projects')
      .select('sheet_id')
      .eq('id', projectId)
      .single()

    if (!project?.sheet_id) {
      return res.status(200).json({ success: true, data: { updated: false, reason: 'No sheet connected yet' } })
    }

    const auth = getGoogleAuth()
    const sheets = getSheets(auth)

    // Overwrite reference data
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: project.sheet_id,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          {
            range: `Reference!A1:A${stages.length + 1}`,
            values: [['Stages'], ...stages.map(s => [s])]
          },
          {
            range: `Reference!B1:B${swimLanes.length + 1}`,
            values: [['Swim Lanes'], ...swimLanes.map(s => [s])]
          },
          {
            range: `Reference!C1:C${colorCategories.length + 1}`,
            values: [['Color Categories'], ...colorCategories.map(c => [c])]
          }
        ]
      }
    })

    return res.status(200).json({ success: true, data: { updated: true } })

  } catch (err) {
    return handleError(res, err)
  }
}
