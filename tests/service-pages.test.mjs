import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distClient = path.join(root, 'dist', 'client')
const siteUrl = 'https://ckf-home.vercel.app'

const pages = [
  ['manutencao-caminhoes', 'Manutenção de caminhões e máquinas pesadas em Itajaí'],
  ['central-concreto', 'Manutenção de centrais de concreto em Itajaí'],
  ['reforma-chassis', 'Reforma de chassis em Itajaí'],
  ['estruturas-metalicas', 'Estruturas metálicas e solda em Itajaí'],
]

for (const [slug, heading] of pages) {
  test(`gera página estática e indexável para ${slug}`, () => {
    const pagePath = path.join(distClient, 'servicos', slug, 'index.html')

    assert.equal(existsSync(pagePath), true, `${slug} deve existir no artefato final`)

    const html = readFileSync(pagePath, 'utf8')
    const canonical = `${siteUrl}/servicos/${slug}`

    assert.match(html, new RegExp(`<link rel="canonical" href="${canonical}"`))
    assert.match(html, new RegExp(`<h1>${heading}</h1>`))
    assert.match(html, /Solicitar orçamento/)
    assert.match(html, /https:\/\/wa\.me\/5547991214232\?text=/)
    assert.doesNotMatch(html, /<div id="root"><\/div>/)
  })
}

test('inclui todas as páginas de serviço no sitemap', () => {
  const sitemap = readFileSync(path.join(distClient, 'sitemap.xml'), 'utf8')

  for (const [slug] of pages) {
    assert.match(sitemap, new RegExp(`<loc>${siteUrl}/servicos/${slug}</loc>`))
  }
})
