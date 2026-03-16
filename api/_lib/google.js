import { google } from 'googleapis'

export function getGoogleAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY

  if (!email) throw new Error('Missing env var: GOOGLE_SERVICE_ACCOUNT_EMAIL')
  if (!rawKey) throw new Error('Missing env var: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')

  const key = rawKey.replace(/\\n/g, '\n')

  return new google.auth.JWT(email, null, key, [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/drive'
  ])
}

export const getSheets = (auth) => google.sheets({ version: 'v4', auth })
export const getDrive = (auth) => google.drive({ version: 'v3', auth })
