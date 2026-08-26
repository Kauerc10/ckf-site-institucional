import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')
const privacyHtml = readFileSync(path.join(root, 'dist', 'client', 'privacidade', 'index.html'), 'utf8')
const marketingPath = path.join(root, 'dist', 'client', 'marketing', 'index.html')
const sitemap = readFileSync(path.join(root, 'dist', 'client', 'sitemap.xml'), 'utf8')

test('formulário informa ciência das duas políticas antes do envio', () => {
  assert.match(dialog, /Ao prosseguir, você declara ter lido e estar ciente da nossa/i)
  assert.match(dialog, /href="\/privacidade"[^>]*>Política de Privacidade<\/a>/)
  assert.match(dialog, /href="\/marketing"[^>]*>Política de Comunicações e Marketing<\/a>/)
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
})

test('sitemap publica a política de marketing junto das páginas legais', () => {
  assert.match(sitemap, /<loc>https:\/\/ckf-home\.vercel\.app\/marketing<\/loc>/)
})
