import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const initSource = readFileSync(path.join(root, 'public', 'analytics-init.js'), 'utf8')
const consentCss = readFileSync(path.join(root, 'public', 'analytics-consent.css'), 'utf8')
const ticketDialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')

test('banner apresenta cookies em linguagem familiar e ações explícitas', () => {
  assert.match(initSource, /Cookies e privacidade/)
  assert.match(initSource, /cookies opcionais/i)
  assert.match(initSource, /Aceitar todos/)
  assert.match(initSource, /Rejeitar opcionais/)
  assert.match(initSource, /Preferências de cookies/)
})

test('aceite continua opt-in e nunca é concedido automaticamente', () => {
  assert.match(initSource, /analytics_storage:\s*'denied'/)
  assert.match(initSource, /if \(consentChoice === null\) showPreferences\(\{ focusAction: true \}\)/)
  assert.doesNotMatch(initSource, /if \(consentChoice === null\)[^\n]*applyChoice\(GRANTED/)
})

test('Solicitação continua funcional sem depender do consentimento do Google', () => {
  assert.match(ticketDialog, /await submitTicket\(payload\)/)
  assert.doesNotMatch(ticketDialog, /ckfGoogleAnalytics|getConsent|analytics-consent/)
})

test('aceitar todos permanece visualmente primário sem esconder a rejeição', () => {
  assert.match(consentCss, /\.analytics-consent__action--primary\s*\{[^}]*background:\s*#f6b900/s)
  assert.match(consentCss, /\.analytics-consent__action--primary\s*\{[^}]*box-shadow:/s)
  assert.match(consentCss, /\.analytics-consent__action--secondary\s*\{[^}]*border:/s)
})
