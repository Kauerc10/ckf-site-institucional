#!/usr/bin/env node
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SERVICE_PAGES } from '../service-pages.mjs'
import { buildWhatsAppUrl } from '../src/whatsapp.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const client = path.join(root, 'dist', 'client')
const whatsapp = buildWhatsAppUrl()

const legalFooter = `<div class="footer__legal section-shell">
  <nav class="footer__policies" aria-label="Políticas e informações jurídicas"><a href="/privacidade">Política de Privacidade</a><span aria-hidden="true">·</span><a href="/marketing">Política de Comunicações e Marketing</a></nav>
  <p class="footer__company">CKF MANUTENCAO LTDA · CNPJ 57.461.028/0001-43 · Rodovia BR-101, 6780, Galpão 01, Sala 01 · Espinheiros · Itajaí/SC · 88317-000</p>
  <p class="footer__credit">Idealizado e desenvolvido por <strong>K-Hub</strong></p>
</div>`

const policyTopbar = `<header class="topbar">
  <a class="brand" href="/" aria-label="CKF Manutenção - Início"><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /></a>
  <nav class="desktop-nav" aria-label="Navegação principal"><a href="/#servicos">Serviços</a><a href="/#capacidade">Estrutura</a><a href="/#sobre">Quem somos</a><a href="/#processo">Como trabalhamos</a><a href="/#localizacao">Localização</a><a href="/#contato">Contato</a></nav>
  <a class="button button--small" href="${whatsapp}" target="_blank" rel="noreferrer">WhatsApp</a>
  <details class="mobile-menu">
    <summary aria-label="Abrir menu de navegação">Menu</summary>
    <nav aria-label="Navegação móvel"><a href="/#servicos">Serviços</a><a href="/#capacidade">Estrutura</a><a href="/#sobre">Quem somos</a><a href="/#processo">Como trabalhamos</a><a href="/#localizacao">Localização</a><a href="/#contato">Contato</a><a class="mobile-menu__cta" href="${whatsapp}" target="_blank" rel="noreferrer">WhatsApp</a></nav>
  </details>
</header>`

const files = [
  path.join(client, 'servicos', 'index.html'),
  ...SERVICE_PAGES.map((page) => path.join(client, 'servicos', page.slug, 'index.html')),
  path.join(client, 'privacidade', 'index.html'),
  path.join(client, 'marketing', 'index.html'),
]

const policyFiles = new Set([
  path.join(client, 'privacidade', 'index.html'),
  path.join(client, 'marketing', 'index.html'),
])

for (const file of files) {
  if (!existsSync(file)) throw new Error(`Missing generated static page: ${file}`)

  let html = readFileSync(file, 'utf8')

  html = html.replace(/<div class="footer__legal section-shell">[\s\S]*?<\/div>\s*(?=<\/footer>)/, '')
  if (!html.includes('</footer>')) throw new Error(`Missing footer marker in ${file}`)
  html = html.replace('</footer>', `${legalFooter}</footer>`)

  html = html.replaceAll('>WhatsApp rápido</a>', '>WhatsApp</a>')
  html = html.replaceAll(
    '"name":"CKF Manutenção","url":',
    '"name":"CKF Manutenção","legalName":"CKF MANUTENCAO LTDA","taxID":"57.461.028/0001-43","url":',
  )

  if (policyFiles.has(file)) {
    const headerPattern = /<header class="topbar">[\s\S]*?<\/header>/
    if (!headerPattern.test(html)) throw new Error(`Missing topbar marker in ${file}`)
    html = html.replace(headerPattern, policyTopbar)
  }

  writeFileSync(file, html)
}

console.log(`Enhanced legal shell for ${files.length} static pages`)
