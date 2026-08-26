#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SERVICE_PAGES } from '../service-pages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const client = path.join(root, 'dist', 'client')

const staticFiles = [
  ...SERVICE_PAGES.map((page) => ({ name: page.slug, file: path.join(client, 'servicos', page.slug, 'index.html') })),
  { name: 'servicos', file: path.join(client, 'servicos', 'index.html') },
  { name: 'privacidade', file: path.join(client, 'privacidade', 'index.html') },
]

function enhanceStaticPage({ name, file }) {
  let html = readFileSync(file, 'utf8')

  if (!html.includes('/service-pages.css') || !html.includes('<body class="service-page"><main>')) {
    throw new Error(`Missing accessibility injection marker in ${name}`)
  }

  if (!html.includes('href="/mobile-a11y.css"')) {
    html = html.replace(
      '<link rel="stylesheet" href="/service-pages.css" />',
      '<link rel="stylesheet" href="/service-pages.css" />\n    <link rel="stylesheet" href="/mobile-a11y.css" />',
    )
  }

  if (!html.includes('class="skip-link"')) {
    html = html.replace(
      '<body class="service-page"><main>',
      '<body class="service-page"><a class="skip-link" href="#service-content">Pular para o conteúdo</a><main id="service-content">',
    )
  }

  if (!html.includes('class="mobile-menu"')) {
    throw new Error(`Missing mobile navigation in ${name}`)
  }

  writeFileSync(file, html)
}

for (const page of staticFiles) enhanceStaticPage(page)
console.log(`Enhanced accessibility for ${staticFiles.length} static pages`)
