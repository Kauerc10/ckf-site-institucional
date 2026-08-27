import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { SITE_URL } from '../site.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')
const home = readFileSync(path.join(root, 'index.html'), 'utf8')
const legalFooterCss = readFileSync(path.join(root, 'src', 'legal-footer.css'), 'utf8')
const staticLegalEnhancer = readFileSync(path.join(root, 'scripts', 'enhance-static-legal-shell.mjs'), 'utf8')
const privacyHtml = readFileSync(path.join(root, 'dist', 'client', 'privacidade', 'index.html'), 'utf8')
const marketingPath = path.join(root, 'dist', 'client', 'marketing', 'index.html')
const serviceHtml = readFileSync(path.join(root, 'dist', 'client', 'servicos', 'reforma-chassis', 'index.html'), 'utf8')
const sitemap = readFileSync(path.join(root, 'dist', 'client', 'sitemap.xml'), 'utf8')

test('formulário informa ciência das duas políticas antes do envio', () => {
  assert.match(dialog, /Ao prosseguir, você declara ter lido e estar ciente da nossa/i)
  assert.match(dialog, /href="\/privacidade"[^>]*>Política de Privacidade<\/a>/)
  assert.match(dialog, /href="\/marketing"[^>]*>Política de Comunicações e Marketing<\/a>/)
})

test('rodapé público identifica a CKF e oferece acesso permanente às políticas', () => {
  for (const source of [app, staticLegalEnhancer]) {
    assert.match(source, /\/privacidade/)
    assert.match(source, /\/marketing/)
    assert.match(source, /CKF MANUTENCAO LTDA/)
    assert.match(source, /57\.461\.028\/0001-43/)
    assert.match(source, /Idealizado e desenvolvido por[\s\S]*K-Hub/i)
  }
})

test('divisor jurídico ocupa toda a largura do rodapé', () => {
  assert.match(legalFooterCss, /\.footer__legal::before[\s\S]*left:\s*50%;[\s\S]*width:\s*100vw;[\s\S]*transform:\s*translateX\(-50%\)/)
})

test('botão principal usa apenas WhatsApp, sem o sufixo rápido', () => {
  assert.match(app, />\s*WhatsApp\s*<\/a>/)
  assert.doesNotMatch(app, /WhatsApp rápido<\/a>/)

  for (const html of [privacyHtml, readFileSync(marketingPath, 'utf8'), serviceHtml]) {
    assert.match(html, />WhatsApp<\/a>/)
    assert.doesNotMatch(html, />WhatsApp rápido<\/a>/)
  }
})

test('páginas de políticas usam a mesma navegação superior da home', () => {
  for (const html of [privacyHtml, readFileSync(marketingPath, 'utf8')]) {
    for (const label of ['Serviços', 'Estrutura', 'Quem somos', 'Como trabalhamos', 'Localização', 'Contato']) {
      assert.match(html, new RegExp(`>${label}<`, 'i'))
    }
    assert.match(html, />WhatsApp<\/a>/i)
    assert.doesNotMatch(html, />Solicitar orçamento<\/a>/i)
  }
})

test('schema da home preserva razão social e CNPJ oficiais', () => {
  assert.match(home, /"legalName":"CKF MANUTENCAO LTDA"/)
  assert.match(home, /"taxID":"57\.461\.028\/0001-43"/)
})

test('Política de Privacidade cobre os pontos essenciais da jornada de Solicitação', () => {
  for (const heading of [
    'Controlador e escopo',
    'Dados tratados',
    'Finalidades e bases legais',
    'Compartilhamento e operadores',
    'Retenção',
    'Segurança',
    'Direitos do titular',
    'Cookies e tecnologias',
    'Contato',
  ]) {
    assert.match(privacyHtml, new RegExp(heading, 'i'), `faltou a seção ${heading}`)
  }

  assert.match(privacyHtml, /execução de procedimentos preliminares/i)
  assert.match(privacyHtml, /legítimo interesse/i)
  assert.match(privacyHtml, /WhatsApp/i)
  assert.match(privacyHtml, /parâmetros de campanha/i)
  assert.match(privacyHtml, /não vendemos/i)
  assert.match(privacyHtml, /\/marketing/)
  assert.match(privacyHtml, /CKF MANUTENCAO LTDA/)
  assert.match(privacyHtml, /57\.461\.028\/0001-43/)
  assert.match(privacyHtml, /Rodovia BR-101, 6780/i)
})

test('Política de Comunicações e Marketing é publicada com escopo e saída claros', () => {
  assert.ok(existsSync(marketingPath), 'faltou gerar /marketing/index.html')
  const marketingHtml = readFileSync(marketingPath, 'utf8')

  for (const heading of [
    'Política de Comunicações e Marketing',
    'Quais comunicações podemos realizar',
    'Canais utilizados',
    'Bases legais e contexto',
    'Segmentação e dados utilizados',
    'Como parar de receber',
    'Compartilhamento e operadores',
    'Seus direitos',
    'Contato',
  ]) {
    assert.match(marketingHtml, new RegExp(heading, 'i'), `faltou a seção ${heading}`)
  }

  assert.match(marketingHtml, /WhatsApp/i)
  assert.match(marketingHtml, /e-mail/i)
  assert.match(marketingHtml, /(ofertas|condições comerciais|campanhas)/i)
  assert.match(marketingHtml, /legítimo interesse/i)
  assert.match(marketingHtml, /consentimento/i)
  assert.match(marketingHtml, /SAIR/i)
  assert.match(marketingHtml, /não vendemos/i)
  assert.match(marketingHtml, /CKF MANUTENCAO LTDA/)
  assert.match(marketingHtml, /57\.461\.028\/0001-43/)
})

test('sitemap publica a política de marketing junto das páginas legais', () => {
  assert.match(sitemap, new RegExp(`<loc>${SITE_URL}/marketing</loc>`))
})
