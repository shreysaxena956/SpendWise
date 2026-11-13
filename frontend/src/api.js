export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/$/, '')
export const API_CONNECTION_HINT = import.meta.env.VITE_API_BASE_URL
  ? import.meta.env.VITE_API_BASE_URL
  : 'the local API proxy (http://127.0.0.1:5001)'

export async function apiRequest(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...options.headers,
      },
    })
  } catch (error) {
    throw new Error(`Unable to reach ${API_CONNECTION_HINT} (${error.message})`)
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error(`The API returned an invalid response (HTTP ${response.status})`)
  }

  if (!response.ok || payload.success === false) {
    throw new Error(payload.error || payload.message || `Request failed (HTTP ${response.status})`)
  }

  return payload
}
