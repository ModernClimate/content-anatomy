import { requireAuth, requireStrategist } from '../_lib/auth.js'
import { getGoogleAuth, getSheets, getDrive } from '../_lib/google.js'
import { handleError } from '../_lib/errors.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  try {
    const { user, supabase } = await requireAuth(req)
    const { projectId, projectName, clientName, stages, swimLanes, colorCategories, userEmail } = req.body

    await requireStrategist(supabase, user.id, projectId)

    console.log('[DEBUG] service account:', process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL)
    console.log('[DEBUG] key set:', !!process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY)
    const auth = await getGoogleAuth()
    const sheets = getSheets(auth)
    const drive = getDrive(auth)

    // 1. Create spreadsheet with two sheets: Bubbles and Reference
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title: `${clientName} — Content Anatomy` },
        sheets: [
          { properties: { title: 'Bubbles', sheetId: 0 } },
          { properties: { title: 'Reference', sheetId: 1, hidden: true } }
        ]
      }
    })

    const spreadsheetId = spreadsheet.data.spreadsheetId

    // 2. Write header row
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Bubbles!A1:I1',
      valueInputOption: 'RAW',
      requestBody: {
        values: [['ID', 'Title', 'Description', 'Stage', 'Swim Lane', 'Bubble Size', 'Color Category', 'Connections', 'Notes']]
      }
    })

    // 3. Write reference data for validation dropdowns
    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
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
          },
          {
            range: 'Reference!D1:D6',
            values: [['Bubble Size'], ['1'], ['2'], ['3'], ['4'], ['5']]
          }
        ]
      }
    })

    // 4. Format and validate
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          // Freeze header row
          {
            updateSheetProperties: {
              properties: { sheetId: 0, gridProperties: { frozenRowCount: 1 } },
              fields: 'gridProperties.frozenRowCount'
            }
          },
          // Bold + dark header background
          {
            repeatCell: {
              range: { sheetId: 0, startRowIndex: 0, endRowIndex: 1 },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.122, green: 0.161, blue: 0.216 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 },
                    fontSize: 11
                  }
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat)'
            }
          },
          // Set column widths for readability
          {
            updateDimensionProperties: {
              range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 0, endIndex: 1 },
              properties: { pixelSize: 60 },
              fields: 'pixelSize'
            }
          },
          {
            updateDimensionProperties: {
              range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 1, endIndex: 2 },
              properties: { pixelSize: 200 },
              fields: 'pixelSize'
            }
          },
          {
            updateDimensionProperties: {
              range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 2, endIndex: 3 },
              properties: { pixelSize: 300 },
              fields: 'pixelSize'
            }
          },
          {
            updateDimensionProperties: {
              range: { sheetId: 0, dimension: 'COLUMNS', startIndex: 3, endIndex: 9 },
              properties: { pixelSize: 160 },
              fields: 'pixelSize'
            }
          },
          // Data validation: Stage (col D, index 3)
          buildDropdownValidation(0, 3, 4, `=Reference!$A$2:$A$${stages.length + 1}`),
          // Data validation: Swim Lane (col E, index 4)
          buildDropdownValidation(0, 4, 5, `=Reference!$B$2:$B$${swimLanes.length + 1}`),
          // Data validation: Bubble Size (col F, index 5)
          buildDropdownValidation(0, 5, 6, '=Reference!$D$2:$D$6'),
          // Data validation: Color Category (col G, index 6)
          buildDropdownValidation(0, 6, 7, `=Reference!$C$2:$C$${colorCategories.length + 1}`)
        ]
      }
    })

    // 5. Move to Drive folder if configured
    if (process.env.GOOGLE_DRIVE_FOLDER_ID) {
      await drive.files.update({
        fileId: spreadsheetId,
        addParents: process.env.GOOGLE_DRIVE_FOLDER_ID,
        fields: 'id, parents'
      })
    }

    // 6. Share with user (writer access)
    await drive.permissions.create({
      fileId: spreadsheetId,
      requestBody: { type: 'user', role: 'writer', emailAddress: userEmail }
    })

    const sheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`

    // 7. Update project record in Supabase
    await supabase
      .from('projects')
      .update({ sheet_id: spreadsheetId, sheet_url: sheetUrl, updated_at: new Date().toISOString() })
      .eq('id', projectId)

    return res.status(200).json({
      success: true,
      data: { sheetId: spreadsheetId, sheetUrl }
    })

  } catch (err) {
    return handleError(res, err)
  }
}

function buildDropdownValidation(sheetId, startCol, endCol, formula) {
  return {
    setDataValidation: {
      range: { sheetId, startRowIndex: 1, endRowIndex: 1000, startColumnIndex: startCol, endColumnIndex: endCol },
      rule: {
        condition: { type: 'ONE_OF_RANGE', values: [{ userEnteredValue: formula }] },
        showCustomUi: true,
        strict: true
      }
    }
  }
}
