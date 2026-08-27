import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { SERVICE_PAGES } from '../service-pages.mjs'
import { sanitizeAnalyticsProperties } from '../src/analytics.js'

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
