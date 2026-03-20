import { google } from 'googleapis'
import http from 'http'
import { readFileSync } from 'fs'

// Load .env
const env = readFileSync('.env', 'utf8')
for (const line of env.split('\n')) {
  const [key, ...rest] = line.split('=')
  if (key && rest.length) process.env[key.trim()] = rest.join('=').trim()
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3000/callback'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ]
})

console.log('\nOpen this URL in your browser:\n')
console.log(authUrl)
console.log('\nWaiting for callback...\n')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3000')
  const code = url.searchParams.get('code')

  if (!code) {
    res.end('No code found')
    return
  }

  const { tokens } = await oauth2Client.getToken(code)
  res.end('Done! Check your terminal.')
  server.close()

  console.log('\n=== Add these to Vercel env vars ===\n')
  console.log('GOOGLE_CLIENT_ID=' + CLIENT_ID)
  console.log('GOOGLE_CLIENT_SECRET=' + CLIENT_SECRET)
  console.log('GOOGLE_REFRESH_TOKEN=' + tokens.refresh_token)
  console.log('\n====================================\n')
})

server.listen(3000)
