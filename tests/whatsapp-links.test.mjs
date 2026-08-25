import assert from 'node:assert/strict'
import test from 'node:test'

import { CONTACTS, buildWhatsAppUrl } from '../src/whatsapp.js'

test('usa o número principal e uma mensagem genérica para orçamento', () => {
  const url = new URL(buildWhatsAppUrl())

  assert.equal(url.origin, 'https://wa.me')
  assert.equal(url.pathname, `/${CONTACTS.primary.phone}`)
  assert.equal(
    url.searchParams.get('text'),
    'Olá! Vim pelo site da CKF Manutenção e gostaria de solicitar um orçamento.',
  )
})

test('inclui o serviço na mensagem para qualificar o contato', () => {
  const url = new URL(buildWhatsAppUrl({ service: 'Reforma de chassis' }))

  assert.equal(
    url.searchParams.get('text'),
    'Olá! Vim pelo site da CKF Manutenção e gostaria de solicitar um orçamento para Reforma de chassis.',
  )
})

test('gera link para o segundo contato sem reutilizar o número principal', () => {
  const url = new URL(buildWhatsAppUrl({ contact: 'secondary' }))

  assert.equal(CONTACTS.secondary.phone, '5547999130409')
  assert.equal(url.pathname, '/5547999130409')
  assert.notEqual(url.pathname, `/${CONTACTS.primary.phone}`)
})

test('rejeita uma chave de contato desconhecida', () => {
  assert.throws(
    () => buildWhatsAppUrl({ contact: 'inexistente' }),
    /Contato do WhatsApp desconhecido/,
  )
})
