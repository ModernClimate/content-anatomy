import { google } from 'googleapis'
import { readFileSync } from 'fs'

// Manually load .env
const env = readFileSync('.env', 'utf8')
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)
auth.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN })

const sheets = google.sheets({ version: 'v4', auth })

try {
  const result = await sheets.spreadsheets.create({
    requestBody: {
      properties: { title: 'Test Sheet' }
    }
  })
  console.log('SUCCESS! Sheet created:', result.data.spreadsheetUrl)
} catch (err) {
  console.error('FAILED:', err.message)
  console.error('Details:', JSON.stringify(err.response?.data, null, 2))
}
