import { google } from 'googleapis'

export function getGoogleAuth() {
  return new google.auth.JWT(
    process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    null,
    process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY.replace(/\\n/g, '\n'),
    [
      'https://www.googleapis.com/auth/spreadsheets',
      'https://www.googleapis.com/auth/drive'
    ]
  )
}

export const getSheets = (auth) => google.sheets({ version: 'v4', auth })
export const getDrive = (auth) => google.drive({ version: 'v3', auth })
