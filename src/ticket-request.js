import { CONTACTS } from './whatsapp.js'

export const TICKET_ENDPOINT = 'https://xsvvdhznrdkygmvganwb.supabase.co/functions/v1/capture-site-ticket'

function clean(value) {
  return typeof value === 'string' ? value.trim() : ''
}

export function createIdempotencyKey() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  if (typeof crypto === 'undefined' || typeof crypto.getRandomValues !== 'function') {
    throw new Error('Gerador seguro de identificadores indisponível.')
  }

  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
}

export function readTicketLaunchIntent({ search = globalThis.location?.search ?? '', knownServiceSlugs = [] } = {}) {
  const params = new URLSearchParams(search)
  const requestedSlug = clean(params.get('orcamento'))
  const source = clean(params.get('cta'))
  const serviceSlug = requestedSlug && knownServiceSlugs.includes(requestedSlug) ? requestedSlug : ''
  const shouldOpen = Boolean(serviceSlug || (!requestedSlug && source))

  return {
    shouldOpen,
    source: source || (serviceSlug ? 'service-page' : 'unknown'),
    serviceSlug,
  }
}

export function readTicketAttribution({ location = globalThis.location, document = globalThis.document, ctaSource = 'unknown' } = {}) {
  const params = new URLSearchParams(location?.search ?? '')
  const rawReferrer = clean(document?.referrer)
  let referrerParams = null

  if (rawReferrer) {
    try {
      const referrerUrl = new URL(rawReferrer, location?.origin || undefined)
      const currentOrigin = clean(location?.origin)
      if (!currentOrigin || referrerUrl.origin === currentOrigin) referrerParams = referrerUrl.searchParams
    } catch {
      referrerParams = null
    }
  }

  const attributionValue = (key, maxLength) => clean(params.get(key) || referrerParams?.get(key)).slice(0, maxLength)

  return {
    landingPath: `${location?.pathname ?? '/'}${location?.search ?? ''}`.slice(0, 500),
    ctaSource: clean(ctaSource).slice(0, 120),
    referrer: rawReferrer.slice(0, 1000),
    utmSource: attributionValue('utm_source', 200),
    utmMedium: attributionValue('utm_medium', 200),
    utmCampaign: attributionValue('utm_campaign', 300),
    utmTerm: attributionValue('utm_term', 300),
    utmContent: attributionValue('utm_content', 300),
  }
}

export function buildTicketPayload({ service, form, attribution, idempotencyKey }) {
  if (!service) throw new Error('Selecione um serviço.')

  return {
    serviceCategory: service.ticketCategory,
    serviceSlug: service.slug,
    serviceName: service.ctaService || service.cardTitle,
    equipmentType: clean(form.equipmentType),
    equipmentBrand: clean(form.equipmentBrand),
    equipmentModel: clean(form.equipmentModel),
    companyName: clean(form.companyName),
    contactName: clean(form.contactName),
    phone: clean(form.phone),
    email: clean(form.email).toLowerCase(),
    city: clean(form.city),
    uf: clean(form.uf).toUpperCase(),
    description: clean(form.description),
    urgency: clean(form.urgency).toLowerCase(),
    website: clean(form.website),
    landingPath: clean(attribution.landingPath),
    ctaSource: clean(attribution.ctaSource),
    referrer: clean(attribution.referrer),
    utmSource: clean(attribution.utmSource),
    utmMedium: clean(attribution.utmMedium),
    utmCampaign: clean(attribution.utmCampaign),
    utmTerm: clean(attribution.utmTerm),
    utmContent: clean(attribution.utmContent),
    idempotencyKey: clean(idempotencyKey),
  }
}

export async function submitTicket(payload, { fetchImpl = globalThis.fetch, timeoutMs = 12000 } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetchImpl(TICKET_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: controller.signal,
    })

    const body = await response.json().catch(() => ({}))
    if (!response.ok || !body?.ok || !body?.public_id) {
      const error = new Error(body?.error || 'Não foi possível registrar a Solicitação. Tente novamente.')
      error.status = response.status
      error.fields = Array.isArray(body?.fields) ? body.fields : []
      throw error
    }

    return { publicId: body.public_id }
  } finally {
    clearTimeout(timeout)
  }
}

export function buildTicketWhatsAppUrl({ publicId, serviceName, equipmentType, description, urgency }) {
  const lines = [
    `Olá! Acabei de registrar a Solicitação CKF #${clean(publicId)} pelo site.`,
    '',
    `Serviço: ${clean(serviceName) || 'Não informado'}`,
    `Equipamento: ${clean(equipmentType) || 'Não informado'}`,
    `Urgência: ${clean(urgency) || 'Não informada'}`,
    `Problema: ${clean(description) || 'Não informado'}`,
    '',
    'Podemos continuar por aqui?',
  ]

  return `https://wa.me/${CONTACTS.primary.phone}?text=${encodeURIComponent(lines.join('\n'))}`
}
