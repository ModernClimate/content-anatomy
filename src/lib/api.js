import { supabase } from './supabase'

async function apiFetch(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) throw new Error('Not authenticated')

  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...options.headers
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  })

  const json = await response.json()
  if (!json.success) throw new Error(json.error || 'API request failed')
  return json.data
}

export const api = {
  sheets: {
    create: (body) => apiFetch('/sheets/create', { method: 'POST', body }),
    sync: (projectId) => apiFetch(`/sheets/sync?projectId=${projectId}`),
    updateConfig: (body) => apiFetch('/sheets/update-config', { method: 'POST', body })
  },
  invite: {
    send: (body) => apiFetch('/invite', { method: 'POST', body })
  }
}
