import { google } from 'googleapis'

export function getGoogleAuth() {
  const clientId = process.env.GOOGLE_CLIENT_ID
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN

  if (!clientId) throw new Error('Missing env var: GOOGLE_CLIENT_ID')
  if (!clientSecret) throw new Error('Missing env var: GOOGLE_CLIENT_SECRET')
  if (!refreshToken) throw new Error('Missing env var: GOOGLE_REFRESH_TOKEN')

  const auth = new google.auth.OAuth2(clientId, clientSecret)
  auth.setCredentials({ refresh_token: refreshToken })

  return auth
}

export const getSheets = (auth) => google.sheets({ version: 'v4', auth })
export const getDrive = (auth) => google.drive({ version: 'v3', auth })
