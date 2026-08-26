import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { readTicketAttribution } from '../src/ticket-request.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')
const mobileCss = readFileSync(path.join(root, 'public', 'mobile-a11y.css'), 'utf8')
const vercel = JSON.parse(readFileSync(path.join(root, 'vercel.json'), 'utf8'))

const SUPABASE_ORIGIN = 'https://xsvvdhznrdkygmvganwb.supabase.co'

test('CSP permite registrar a Solicitação na Edge Function', () => {
  const csp = vercel.headers
    .flatMap((rule) => rule.headers)
    .find(({ key }) => key === 'Content-Security-Policy')?.value ?? ''

  assert.match(csp, new RegExp(`connect-src[^;]*${SUPABASE_ORIGIN.replaceAll('.', '\\.')}`))
})

test('CTAs sem serviço pré-selecionado também conseguem abrir a Solicitação', async () => {
  const ticketModule = await import('../src/ticket-request.js')
  assert.equal(typeof ticketModule.readTicketLaunchIntent, 'function')

  const hub = ticketModule.readTicketLaunchIntent({
    search: '?cta=services-hub',
    knownServiceSlugs: ['reforma-chassis'],
  })
  assert.deepEqual(hub, { shouldOpen: true, source: 'services-hub', serviceSlug: '' })

  const servicePage = ticketModule.readTicketLaunchIntent({
    search: '?orcamento=reforma-chassis&cta=service-page',
    knownServiceSlugs: ['reforma-chassis'],
  })
  assert.deepEqual(servicePage, { shouldOpen: true, source: 'service-page', serviceSlug: 'reforma-chassis' })
})

test('atribuição recupera UTMs da landing SEO antes de ir para a home', () => {
  const attribution = readTicketAttribution({
    location: {
      origin: 'https://ckf-home.vercel.app',
      pathname: '/',
      search: '?orcamento=reforma-chassis&cta=service-page',
    },
    document: {
      referrer: 'https://ckf-home.vercel.app/servicos/reforma-chassis?utm_source=google&utm_medium=cpc&utm_campaign=chassis',
    },
    ctaSource: 'service-page',
  })

  assert.equal(attribution.utmSource, 'google')
  assert.equal(attribution.utmMedium, 'cpc')
  assert.equal(attribution.utmCampaign, 'chassis')
})

test('consultar privacidade não destrói o formulário em andamento', () => {
  assert.match(dialog, /href="\/privacidade"[^>]*target="_blank"[^>]*rel="noreferrer"/)
})

test('autocomplete não tenta preencher cargo profissional como marca do equipamento', () => {
  assert.doesNotMatch(dialog, /equipmentBrand[^>]*autoComplete="organization-title"/)
})

test('header muda para menu compacto antes de entrar na faixa apertada de tablet', () => {
  assert.match(mobileCss, /@media \(max-width:1024px\)/)
  assert.match(mobileCss, /@media \(max-width:1024px\)[\s\S]*?\.topbar\s*>\s*nav[\s\S]*?display:none/)
  assert.match(mobileCss, /@media \(max-width:1024px\)[\s\S]*?\.mobile-menu[\s\S]*?display:block/)
})

test('atalhos de serviço respeitam alvo mínimo de toque no mobile', () => {
  assert.match(mobileCss, /@media \(max-width:800px\)[\s\S]*?td a\s*\{[^}]*width:44px;[^}]*height:44px;/)
})

test('WhatsApp direto é nomeado como atalho, não como formulário de orçamento', () => {
  assert.match(app, /data-cta-source="header"[^>]*>[\s\S]*?WhatsApp rápido<\/a>/)
  assert.match(app, /data-cta-source="mobile-menu"[^>]*>[\s\S]*?WhatsApp rápido<\/a>/)
})
