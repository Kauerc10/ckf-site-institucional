#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SERVICE_PAGES } from '../service-pages.mjs'
import { buildWhatsAppUrl } from '../src/whatsapp.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const client = path.join(root, 'dist', 'client')

function enhanceServicePage(page) {
  const file = path.join(client, 'servicos', page.slug, 'index.html')
  const whatsapp = buildWhatsAppUrl({ service: page.ctaService })
  let html = readFileSync(file, 'utf8')

  if (!html.includes('/service-pages.css') || !html.includes('<body class="service-page"><main>')) {
    throw new Error(`Missing accessibility injection marker in ${page.slug}`)
  }

  if (!html.includes('href="/mobile-a11y.css"')) {
    html = html.replace(
      '<link rel="stylesheet" href="/service-pages.css" />',
      '<link rel="stylesheet" href="/service-pages.css" />\n    <link rel="stylesheet" href="/mobile-a11y.css" />',
    )
  }
  html = html.replace(
    '<body class="service-page"><main>',
    '<body class="service-page"><a class="skip-link" href="#service-content">Pular para o conteúdo</a><main id="service-content">',
  )

  const headerCtaMarker = `<a class="button button--small" href="${whatsapp}" target="_blank" rel="noreferrer">WhatsApp rápido</a>`
  if (!html.includes(headerCtaMarker)) throw new Error(`Missing header CTA in ${page.slug}`)

  const mobileMenu = `<details class="mobile-menu">
        <summary aria-label="Abrir menu de navegação">Menu</summary>
        <nav aria-label="Navegação móvel">
          <a href="/servicos">Serviços</a>
          <a href="/#capacidade">Estrutura</a>
          <a href="/#sobre">Quem somos</a>
          <a href="/#processo">Como trabalhamos</a>
          <a href="/#localizacao">Localização</a>
          <a href="/#contato">Contato</a>
          <a class="mobile-menu__cta" href="${whatsapp}" target="_blank" rel="noreferrer">WhatsApp rápido</a>
        </nav>
      </details>`
  html = html.replace(headerCtaMarker, `${headerCtaMarker}${mobileMenu}`)
  writeFileSync(file, html)
}

for (const page of SERVICE_PAGES) enhanceServicePage(page)
console.log(`Enhanced accessibility for ${SERVICE_PAGES.length} static service pages`)
