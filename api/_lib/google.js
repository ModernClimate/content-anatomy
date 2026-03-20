import { google } from 'googleapis'

export async function getGoogleAuth() {
  const client_email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const private_key = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!client_email) throw new Error('Missing env var: GOOGLE_SERVICE_ACCOUNT_EMAIL')
  if (!private_key) throw new Error('Missing env var: GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY')

  const auth = new google.auth.GoogleAuth({
    credentials: { client_email, private_key },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  })

  return auth
}

export const getSheets = (auth) => google.sheets({ version: 'v4', auth })
export const getDrive = (auth) => google.drive({ version: 'v3', auth })
