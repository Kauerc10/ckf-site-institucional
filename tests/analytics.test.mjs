import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { SERVICE_PAGES } from '../service-pages.mjs'
import { sanitizeAnalyticsProperties, trackEvent } from '../src/analytics.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')
const analyticsSource = readFileSync(path.join(root, 'src', 'analytics.js'), 'utf8')
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const distClient = path.join(root, 'dist', 'client')

const allowedEvents = new Set([
  'service_view',
  'ticket_form_open',
  'ticket_step_complete',
  'ticket_submit',
  'ticket_success',
  'ticket_error',
  'ticket_close',
  'whatsapp_click',
  'maps_directions_click',
])

test('analytics remove PII e aceita apenas contexto operacional', () => {
  const clean = sanitizeAnalyticsProperties({
    page: '/servicos/manutencao-caminhoes',
    serviceSlug: 'manutencao-caminhoes',
    ctaSource: 'hero',
    step: 2,
    status: 'success',
    name: 'Cliente',
    phone: '47999999999',
    email: 'cliente@example.com',
    description: 'falha hidráulica',
  })
  assert.deepEqual(clean, {
    page: '/servicos/manutencao-caminhoes',
    serviceSlug: 'manutencao-caminhoes',
    ctaSource: 'hero',
    step: 2,
    status: 'success',
  })
})

test('instrumentação usa somente eventos do funil aprovado', () => {
  const source = `${dialog}\n${app}`
  const matches = [...source.matchAll(/trackEvent\('([^']+)'/g)].map((match) => match[1])
  assert.equal(matches.length > 0, true)
  for (const event of matches) assert.equal(allowedEvents.has(event), true, `evento não aprovado: ${event}`)
  assert.match(dialog, /ticket_form_open/)
  assert.match(dialog, /ticket_step_complete/)
  assert.match(dialog, /ticket_submit/)
  assert.match(dialog, /ticket_success/)
  assert.match(dialog, /ticket_error/)
  assert.match(dialog, /ticket_close/)
  assert.match(app, /whatsapp_click/)
  assert.match(app, /maps_directions_click/)
})

test('analytics nunca envia campos pessoais conhecidos', () => {
  const source = `${analyticsSource}\n${dialog}`
  assert.doesNotMatch(source, /trackEvent\([^\n]+(?:phone|email|contactName|description)/)
})

test('custom events usam o contrato oficial da fila window.va', () => {
  assert.match(analyticsSource, /target\.va\('event',\s*\{\s*name,\s*data\s*\}\)/)
  assert.doesNotMatch(analyticsSource, /target\.va\('event',\s*name,\s*data\)/)
})

test('inicializador do Web Analytics é externo e compatível com a CSP', () => {
  const initSource = readFileSync(path.join(root, 'public', 'analytics-init.js'), 'utf8')
  assert.match(initSource, /window\.va\s*=\s*window\.va\s*\|\|/)
  assert.match(initSource, /window\.vaq\s*=\s*window\.vaq\s*\|\|\s*\[\]/)
  assert.doesNotMatch(initSource, /phone|email|contactName|description/)
})

test('Web Analytics é injetado uma vez em toda página pública gerada', () => {
  assert.match(packageJson.scripts.build, /enhance-static-analytics\.mjs/)

  const htmlPaths = [
    path.join(distClient, 'index.html'),
    path.join(distClient, 'servicos', 'index.html'),
    path.join(distClient, 'privacidade', 'index.html'),
    path.join(distClient, 'marketing', 'index.html'),
    ...SERVICE_PAGES.map((page) => path.join(distClient, 'servicos', page.slug, 'index.html')),
  ]

  for (const htmlPath of htmlPaths) {
    const html = readFileSync(htmlPath, 'utf8')
    assert.equal((html.match(/\/analytics-init\.js/g) ?? []).length, 1, `inicializador ausente ou duplicado em ${htmlPath}`)
    assert.equal((html.match(/\/_vercel\/insights\/script\.js/g) ?? []).length, 1, `script do Web Analytics ausente ou duplicado em ${htmlPath}`)
    assert.doesNotMatch(html, /<script>\s*window\.va/, `fila inline viola a CSP em ${htmlPath}`)
  }
})

test('Google Analytics usa o fluxo aprovado e não recebe eventos fora do adapter de consentimento', () => {
  const calls = []
  const previousWindow = globalThis.window
  globalThis.window = {
    va() {},
    ckfGoogleAnalytics: {
      track(name, data) { calls.push({ name, data }) },
    },
  }

  try {
    trackEvent('ticket_success', {
      page: '/',
      ctaSource: 'ticket-dialog',
      phone: '47999999999',
    })
  } finally {
    if (previousWindow === undefined) delete globalThis.window
    else globalThis.window = previousWindow
  }

  assert.deepEqual(calls, [{
    name: 'ticket_success',
    data: { page: '/', ctaSource: 'ticket-dialog' },
  }])
})

test('Google Analytics 4 exige consentimento explícito antes de carregar a tag', () => {
  const initSource = readFileSync(path.join(root, 'public', 'analytics-init.js'), 'utf8')

  assert.match(initSource, /G-46ZTK5JDFX/)
  assert.match(initSource, /window\.dataLayer\s*=\s*window\.dataLayer\s*\|\|\s*\[\]/)
  assert.match(initSource, /gtag\('consent',\s*'default'/)
  assert.match(initSource, /analytics_storage:\s*'denied'/)
  assert.match(initSource, /ad_storage:\s*'denied'/)
  assert.match(initSource, /ad_user_data:\s*'denied'/)
  assert.match(initSource, /ad_personalization:\s*'denied'/)
  assert.match(initSource, /analytics_storage:\s*'granted'/)
  assert.match(initSource, /https:\/\/www\.googletagmanager\.com\/gtag\/js\?id=/)
  assert.match(initSource, /ckf:analytics-consent:v1/)
  assert.match(initSource, /Aceitar todos/)
  assert.match(initSource, /Rejeitar opcionais/)
  assert.match(initSource, /Preferências de cookies/)
  assert.doesNotMatch(initSource, /phone|email|contactName|description/)
})

test('revogar medição encerra a tag ativa na navegação atual', () => {
  const initSource = readFileSync(path.join(root, 'public', 'analytics-init.js'), 'utf8')
  assert.match(initSource, /if \(googleTagLoaded\)[\s\S]*window\.location\.reload\(\)/)
})

test('primeira exibição do diálogo move foco para uma ação', () => {
  const initSource = readFileSync(path.join(root, 'public', 'analytics-init.js'), 'utf8')
  assert.match(initSource, /if \(consentChoice === null\) showPreferences\(\{ focusAction: true \}\)/)
})

test('bundle de consentimento é publicado uma vez em todas as páginas', () => {
  const consentCssPath = path.join(root, 'public', 'analytics-consent.css')
  assert.ok(existsSync(consentCssPath), 'faltou o CSS do controle de consentimento')
  const consentCss = readFileSync(consentCssPath, 'utf8')
  assert.match(consentCss, /\.analytics-consent/)

  const htmlPaths = [
    path.join(distClient, 'index.html'),
    path.join(distClient, 'servicos', 'index.html'),
    path.join(distClient, 'privacidade', 'index.html'),
    path.join(distClient, 'marketing', 'index.html'),
    ...SERVICE_PAGES.map((page) => path.join(distClient, 'servicos', page.slug, 'index.html')),
  ]

  for (const htmlPath of htmlPaths) {
    const html = readFileSync(htmlPath, 'utf8')
    assert.equal((html.match(/\/analytics-consent\.css/g) ?? []).length, 1, `CSS de consentimento ausente ou duplicado em ${htmlPath}`)
  }
})

test('CSP libera somente os endpoints necessários do GA4 sem inline script', () => {
  const vercelConfig = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'))
  const csp = vercelConfig.headers
    .flatMap((rule) => rule.headers ?? [])
    .find((header) => header.key === 'Content-Security-Policy')?.value ?? ''

  assert.match(csp, /script-src[^;]*https:\/\/www\.googletagmanager\.com/)
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.google-analytics\.com/)
  assert.match(csp, /connect-src[^;]*https:\/\/\*\.analytics\.google\.com/)
  assert.match(csp, /img-src[^;]*https:\/\/\*\.google-analytics\.com/)
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/)
})
