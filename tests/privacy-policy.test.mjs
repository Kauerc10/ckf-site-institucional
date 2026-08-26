import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dialog = readFileSync(path.join(root, 'src', 'TicketRequestDialog.jsx'), 'utf8')
const privacyHtml = readFileSync(path.join(root, 'dist', 'client', 'privacidade', 'index.html'), 'utf8')

test('formulário informa ciência e concordância com a Política de Privacidade antes do envio', () => {
  assert.match(dialog, /Ao prosseguir/i)
  assert.match(dialog, /Política de Privacidade/)
  assert.match(dialog, /lido/i)
  assert.match(dialog, /(ciente|de acordo|concorda)/i)
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
})
