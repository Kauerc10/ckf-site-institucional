import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { SERVICE_PAGES } from '../service-pages.mjs'
import { SITE_URL } from '../site.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distClient = path.join(root, 'dist', 'client')

for (const page of SERVICE_PAGES) {
  test(`gera página estática e indexável para ${page.slug}`, () => {
    const pagePath = path.join(distClient, 'servicos', page.slug, 'index.html')
    assert.equal(existsSync(pagePath), true, `${page.slug} deve existir no artefato final`)
    const html = readFileSync(pagePath, 'utf8')
    const canonical = `${SITE_URL}/servicos/${page.slug}`
    assert.ok(html.includes(`<link rel="canonical" href="${canonical}"`))
    assert.match(html, new RegExp(`<h1>${page.heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</h1>`))
    assert.match(html, /Solicitar orçamento/)
    assert.match(html, /https:\/\/wa\.me\/5547991214232\?text=/)
    assert.doesNotMatch(html, /<div id="root"><\/div>/)
  })
}

test('inclui todas as páginas de serviço no sitemap', () => {
  const sitemap = readFileSync(path.join(distClient, 'sitemap.xml'), 'utf8')
  for (const page of SERVICE_PAGES) {
    assert.ok(sitemap.includes(`<loc>${SITE_URL}/servicos/${page.slug}</loc>`))
  }
})
