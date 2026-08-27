import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const analytics = readFileSync(path.join(root, 'src', 'analytics.js'), 'utf8')
const init = readFileSync(path.join(root, 'public', 'analytics-init.js'), 'utf8')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')

test('ticket_success aguarda o GA4 antes de navegar para o WhatsApp', () => {
  assert.match(analytics, /export async function trackEventAndWait/)
  assert.match(init, /trackAndWait/)
  assert.match(init, /event_callback/)
  assert.match(init, /event_timeout/)
  assert.match(dialog, /await trackEventAndWait\('ticket_success'/)
  assert.match(dialog, /await trackEventAndWait\('ticket_success'[\s\S]*globalThis\.location\.assign\(whatsappUrl\)/)
})

test('espera do GA4 não bloqueia a jornada sem consentimento', () => {
  assert.match(init, /if \(consentChoice !== GRANTED[\s\S]*resolve\(/)
})
