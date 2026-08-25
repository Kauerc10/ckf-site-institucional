import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { sanitizeAnalyticsProperties } from '../src/analytics.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')

const allowedEvents = new Set([
  'service_view',
  'ticket_form_open',
  'ticket_step_complete',
  'ticket_submit',
  'ticket_success',
  'ticket_error',
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
  assert.match(app, /whatsapp_click/)
})

test('analytics nunca envia campos pessoais conhecidos', () => {
  const source = `${readFileSync(path.join(root, 'src', 'analytics.js'), 'utf8')}\n${dialog}`
  assert.doesNotMatch(source, /trackEvent\([^\n]+(?:phone|email|contactName|description)/)
})
