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

export function trackEvent(name, properties = {}) {
  if (typeof name !== 'string' || !name.trim()) return
  const data = sanitizeAnalyticsProperties(properties)
  const target = globalThis.window ?? globalThis

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

  try {
    if (Array.isArray(target.dataLayer)) target.dataLayer.push({ event: name, ...data })
  } catch {
    // Provider opcional.
  }
}
