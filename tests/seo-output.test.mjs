import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distClient = path.join(root, 'dist', 'client')
const siteUrl = 'https://ckfmanutencao.com.br'

test('publica canonical, Open Graph e dados estruturados com URL absoluta', () => {
  const html = readFileSync(path.join(distClient, 'index.html'), 'utf8')
  assert.match(html, new RegExp(`<link rel="canonical" href="${siteUrl}"`))
  assert.match(html, new RegExp(`<meta property="og:url" content="${siteUrl}"`))
  assert.match(html, new RegExp(`${siteUrl}/assets/solda-ckf\\.webp`))
  assert.match(html, /"@type":\["LocalBusiness","Organization"\]/)
  assert.match(html, /"addressLocality":"Itajaí"/)
})

test('publica robots.txt apontando para o sitemap', () => {
  const robots = readFileSync(path.join(distClient, 'robots.txt'), 'utf8')
  assert.match(robots, /User-agent: \*/)
  assert.match(robots, /Allow: \//)
  assert.match(robots, new RegExp(`Sitemap: ${siteUrl}/sitemap\\.xml`))
})

test('gera sitemap.xml com a home canônica', () => {
  const sitemapPath = path.join(distClient, 'sitemap.xml')
  assert.equal(existsSync(sitemapPath), true, 'sitemap.xml deve ser gerado no build')
  const sitemap = readFileSync(sitemapPath, 'utf8')
  assert.match(sitemap, new RegExp(`<loc>${siteUrl}</loc>`))
})
