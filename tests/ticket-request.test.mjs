import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import {
  TICKET_ENDPOINT,
  buildTicketPayload,
  buildTicketWhatsAppUrl,
  createIdempotencyKey,
} from '../src/ticket-request.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')

const service = {
  slug: 'manutencao-caminhoes',
  ticketCategory: 'trucks',
  cardTitle: 'Caminhões e máquinas pesadas',
  ctaService: 'manutenção de caminhões e máquinas pesadas',
}

test('cliente aponta para a Edge Function pública de Solicitações', () => {
  assert.equal(TICKET_ENDPOINT, 'https://xsvvdhznrdkygmvganwb.supabase.co/functions/v1/capture-site-ticket')
})

test('gera idempotency key opaca e suficiente para replay seguro', () => {
  const first = createIdempotencyKey()
  const second = createIdempotencyKey()
  assert.equal(first.length >= 16, true)
  assert.equal(second.length >= 16, true)
  assert.notEqual(first, second)
})

test('payload deriva serviço e atribuição sem vocabulário de lead', () => {
  const payload = buildTicketPayload({
    service,
    form: {
      equipmentType: 'Caminhão',
      equipmentBrand: 'Volvo',
      equipmentModel: 'FH',
      companyName: 'Transportadora Teste',
      contactName: 'Cliente Teste',
      phone: '(47) 99999-1111',
      email: 'CLIENTE@EXAMPLE.COM',
      city: 'Itajaí',
      uf: 'SC',
      description: 'Falha no sistema hidráulico durante a operação.',
      urgency: 'parado',
      website: '',
    },
    attribution: {
      landingPath: '/servicos/manutencao-caminhoes',
      ctaSource: 'service-page',
      referrer: 'https://www.google.com/',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'manutencao-pesada',
      utmTerm: 'manutencao caminhão',
      utmContent: 'cta-principal',
    },
    idempotencyKey: 'aaaaaaaaaaaaaaaa',
  })

  assert.equal(payload.serviceCategory, 'trucks')
  assert.equal(payload.serviceSlug, 'manutencao-caminhoes')
  assert.equal(payload.serviceName, 'manutenção de caminhões e máquinas pesadas')
  assert.equal(payload.utmSource, 'google')
  assert.equal(payload.idempotencyKey, 'aaaaaaaaaaaaaaaa')
  assert.doesNotMatch(JSON.stringify(payload), /lead/i)
})

test('WhatsApp recebe a Solicitação pública e resumo útil depois da persistência', () => {
  const url = buildTicketWhatsAppUrl({
    publicId: 'ABC234',
    serviceName: 'Manutenção de caminhões',
    equipmentType: 'Caminhão',
    description: 'Veículo parado com falha hidráulica',
    urgency: 'parado',
  })
  const decoded = decodeURIComponent(url)
  assert.match(decoded, /Solicitação CKF #ABC234/)
  assert.match(decoded, /Manutenção de caminhões/)
  assert.match(decoded, /Veículo parado/)
  assert.match(url, /^https:\/\/wa\.me\/5547991214232\?text=/)
})

test('home abre o formulário pelos CTAs principais', () => {
  assert.match(app, /TicketRequestDialog/)
  assert.match(app, /data-ticket-trigger="hero"/)
  assert.match(app, /data-ticket-trigger="contact"/)
})

test('formulário é progressivo, persiste antes do WhatsApp e informa privacidade', () => {
  assert.match(dialog, /step === 1/)
  assert.match(dialog, /step === 2/)
  assert.match(dialog, /step === 3/)
  assert.match(dialog, /website/)
  assert.match(dialog, /await submitTicket/)
  assert.match(dialog, /buildTicketWhatsAppUrl/)
  assert.match(dialog, /\/privacidade/)
})
