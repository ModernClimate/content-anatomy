import { requireAuth, requireProjectMember } from '../_lib/auth.js'
import { getGoogleAuth, getSheets } from '../_lib/google.js'
import { handleError } from '../_lib/errors.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).end()

  try {
    const { user, supabase } = await requireAuth(req)
    const { projectId } = req.query
    if (!projectId) throw { status: 400, message: 'projectId is required' }

    const role = await requireProjectMember(supabase, user.id, projectId)
    const isClient = role === 'client'

    // Load project + config in parallel
    const [
      { data: project },
      { data: stages },
      { data: swimLanes },
      { data: colorCategories }
    ] = await Promise.all([
      supabase.from('projects').select('sheet_id').eq('id', projectId).single(),
      supabase.from('stages').select('label').eq('project_id', projectId),
      supabase.from('swim_lanes').select('label').eq('project_id', projectId),
      supabase.from('color_categories').select('label').eq('project_id', projectId)
    ])

    if (!project?.sheet_id) {
      throw { status: 400, message: 'This project has no connected Google Sheet yet', code: 'NO_SHEET' }
    }

    const validStages = new Set(stages.map(s => s.label))
    const validLanes = new Set(swimLanes.map(s => s.label))
    const validCategories = new Set(colorCategories.map(c => c.label))

    const auth = await getGoogleAuth()
    const sheets = getSheets(auth)

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: project.sheet_id,
      range: 'Bubbles!A2:I10000',
      valueRenderOption: 'FORMATTED_VALUE'
    })

    const rows = response.data.values || []
    const bubbles = []
    let invalidCount = 0

    rows.forEach((row, index) => {
      const [id, title, description, stage, swimLane, bubbleSizeRaw, colorCategory, connectionsRaw, notes] = row

      // Skip rows with no ID and no title
      if (!id?.trim() && !title?.trim()) return

      const warnings = []
      let valid = true

      if (!id?.trim()) { warnings.push('Missing ID'); valid = false }
      if (!title?.trim()) { warnings.push('Missing Title'); valid = false }
      if (!validStages.has(stage)) { warnings.push(`Stage "${stage}" is not configured`); valid = false }
      if (!validLanes.has(swimLane)) { warnings.push(`Swim Lane "${swimLane}" is not configured`); valid = false }
      if (!validCategories.has(colorCategory)) { warnings.push(`Color Category "${colorCategory}" is not configured`); valid = false }

      const sizeInt = parseInt(bubbleSizeRaw)
      const bubbleSize = (sizeInt >= 1 && sizeInt <= 5) ? sizeInt : 2

      const connections = connectionsRaw
        ? connectionsRaw.split(',').map(c => c.trim()).filter(Boolean)
        : []

      if (!valid) invalidCount++

      const bubble = {
        id: id?.trim() || `row_${index + 2}`,
        title: title?.trim() || '',
        description: description?.trim() || '',
        stage: stage?.trim() || '',
        swimLane: swimLane?.trim() || '',
        bubbleSize,
        colorCategory: colorCategory?.trim() || '',
        connections,
        rowIndex: index + 2,
        valid,
        warnings
      }

      // Never expose notes to clients
      if (!isClient) bubble.notes = notes?.trim() || ''

      bubbles.push(bubble)
    })

    return res.status(200).json({
      success: true,
      data: {
        bubbles,
        totalRows: bubbles.length,
        validRows: bubbles.length - invalidCount,
        invalidRows: invalidCount,
        syncedAt: new Date().toISOString()
      }
    })

  } catch (err) {
    return handleError(res, err)
  }
}
