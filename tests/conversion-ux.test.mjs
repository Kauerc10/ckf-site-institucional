import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { readTicketAttribution } from '../src/ticket-request.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')
const ticketCss = readFileSync(path.join(root, 'src', 'ticket-request.css'), 'utf8')
const styles = readFileSync(path.join(root, 'src', 'styles.css'), 'utf8')
const polishCss = readFileSync(path.join(root, 'src', 'experience-polish.css'), 'utf8')
const homeCss = `${styles}\n${polishCss}`
const mobileCss = readFileSync(path.join(root, 'public', 'mobile-a11y.css'), 'utf8')
const serviceHtml = readFileSync(path.join(root, 'dist', 'client', 'servicos', 'reforma-chassis', 'index.html'), 'utf8')
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

test('aviso de políticas fica centralizado no modal', () => {
  assert.match(ticketCss, /\.ticket-form__privacy\s*\{[^}]*text-align:\s*center;/s)
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
  assert.match(app, /data-cta-source="header"[^>]*>[\s\S]*?WhatsApp<\/a>/)
  assert.match(app, /data-cta-source="mobile-menu"[^>]*>[\s\S]*?WhatsApp<\/a>/)
  assert.doesNotMatch(app, /data-cta-source="(?:header|mobile-menu)"[^>]*>[\s\S]*?WhatsApp rápido<\/a>/)
})

test('CTAs que abrem formulário não prometem abrir WhatsApp imediatamente', () => {
  const heroButton = app.match(/<button[^>]*data-ticket-trigger="hero"[\s\S]*?<\/button>/)?.[0] ?? ''
  const contactButton = app.match(/<button[^>]*data-ticket-trigger="contact"[\s\S]*?<\/button>/)?.[0] ?? ''

  assert.notEqual(heroButton, '')
  assert.notEqual(contactButton, '')
  assert.doesNotMatch(heroButton, /FaWhatsapp/)
  assert.doesNotMatch(contactButton, /FaWhatsapp/)
  assert.match(heroButton, /FaArrowRight/)
  assert.match(contactButton, /FaArrowRight/)
})

test('menu móvel fecha depois de navegar para uma seção', () => {
  assert.match(app, /const detailsRef = useRef\(null\)/)
  assert.match(app, /onClick=\{closeMenu\}/)
})

test('progresso do formulário continua compreensível no celular', () => {
  assert.doesNotMatch(ticketCss, /\.ticket-progress li\s*\{\s*font-size:\s*0;/)
})

test('formulário usa viewport dinâmica e geometria industrial da CKF', () => {
  assert.match(ticketCss, /max-height:\s*min\(860px,\s*calc\(100dvh - 32px\)\)/)
  assert.match(ticketCss, /\.ticket-dialog\s*\{[^}]*border-radius:\s*2px;/s)
  assert.match(ticketCss, /\.ticket-form input,[\s\S]*?border-radius:\s*2px;/)
  assert.match(ticketCss, /\.ticket-progress li\.is-active span\s*\{[^}]*var\(--yellow/s)
})

test('página pública não expõe o jargão interno Ticket', () => {
  assert.doesNotMatch(serviceHtml, /\bTicket\b/i)
  assert.match(serviceHtml, /Solicitação/)
})

test('fundadores são identificados junto aos respectivos retratos', () => {
  assert.match(app, /about__portrait--left[\s\S]*?Cleber/)
  assert.match(app, /about__portrait--right[\s\S]*?Roberto/)
})

test('processo apresenta a jornada completa em cinco etapas', () => {
  for (const label of ['Solicitação do atendimento', 'Análise e diagnóstico', 'Orçamento e alinhamento', 'Execução acompanhada', 'Teste e entrega']) {
    assert.match(app, new RegExp(label))
  }
  assert.match(app, /'05'/)
})

test('primeiro passo do processo abre a Solicitação integrada', () => {
  assert.match(app, /data-ticket-trigger="process"/)
  assert.match(app, /openTicket\('process'\)/)
})

test('faixa da equipe volta ao retângulo full-width sem perder a imagem inteira', () => {
  assert.match(app, /import '\.\/experience-polish\.css'/)
  assert.match(polishCss, /\.trust\s*\{[^}]*padding:\s*0;/s)
  assert.match(polishCss, /\.trust__layout\s*\{[^}]*width:\s*100%;[^}]*max-width:\s*none;[^}]*border:\s*0;/s)
  assert.match(homeCss, /\.trust__media img\s*\{[^}]*object-fit:\s*contain;/s)
})

test('card do Roberto usa leitura à esquerda e margem segura em desktop e mobile', () => {
  assert.match(polishCss, /\.about__founder--right figcaption\s*\{[^}]*left:\s*45%;[^}]*right:\s*auto;[^}]*text-align:\s*left;/s)
  assert.match(polishCss, /@media \(max-width:800px\)[\s\S]*?\.about__founder--right figcaption\s*\{[^}]*left:\s*32%;[^}]*right:\s*auto;/s)
  assert.match(polishCss, /@media \(max-width:520px\)[\s\S]*?\.about__founder--right figcaption\s*\{[^}]*left:\s*30%;[^}]*right:\s*auto;/s)
})
