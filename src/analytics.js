const ALLOWED_PROPERTY_KEYS = Object.freeze(['page', 'serviceSlug', 'ctaSource', 'step', 'status'])

export function sanitizeAnalyticsProperties(properties = {}) {
  const clean = {}
  for (const key of ALLOWED_PROPERTY_KEYS) {
    const value = properties[key]
    if (value === undefined || value === null || value === '') continue
    if (typeof value === 'string') clean[key] = value.slice(0, 160)
    else if (typeof value === 'number' && Number.isFinite(value)) clean[key] = value
  }
  return clean
}

function publishLocalAndVercel(target, name, data) {
  try {
    target.dispatchEvent?.(new CustomEvent('ckf:analytics', { detail: { name, properties: data } }))
  } catch {
    // Analytics nunca deve interromper a jornada do visitante.
  }

  try {
    if (typeof target.va === 'function') target.va('event', { name, data })
  } catch {
    // Provider opcional.
  }
}

export function trackEvent(name, properties = {}) {
  if (typeof name !== 'string' || !name.trim()) return
  const data = sanitizeAnalyticsProperties(properties)
  const target = globalThis.window ?? globalThis

  publishLocalAndVercel(target, name, data)

  try {
    if (typeof target.ckfGoogleAnalytics?.track === 'function') {
      target.ckfGoogleAnalytics.track(name, data)
    }
  } catch {
    // Provider opcional e condicionado à preferência do visitante.
  }
}

export async function trackEventAndWait(name, properties = {}) {
  if (typeof name !== 'string' || !name.trim()) return
  const data = sanitizeAnalyticsProperties(properties)
  const target = globalThis.window ?? globalThis

  publishLocalAndVercel(target, name, data)

  try {
    if (typeof target.ckfGoogleAnalytics?.trackAndWait === 'function') {
      await target.ckfGoogleAnalytics.trackAndWait(name, data)
      return
    }

    if (typeof target.ckfGoogleAnalytics?.track === 'function') {
      target.ckfGoogleAnalytics.track(name, data)
    }
  } catch {
    // Analytics nunca bloqueia a continuação da jornada.
  }
}
