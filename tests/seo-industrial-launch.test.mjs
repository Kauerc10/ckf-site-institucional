import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { SERVICE_PAGES } from '../service-pages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const client = path.join(root, 'dist', 'client')
const indexSource = readFileSync(path.join(root, 'index.html'), 'utf8')
const serviceStyles = readFileSync(path.join(root, 'public', 'service-pages.css'), 'utf8')

const requiredSlugs = [
  'manutencao-caminhoes',
  'central-concreto',
  'reforma-chassis',
  'estruturas-metalicas',
  'manutencao-maquinas-pesadas',
  'manutencao-industrial',
  'solda-industrial',
  'hidraulica-maquinas-pesadas',
  'manutencao-preventiva',
  'manutencao-corretiva',
]

test('catálogo cobre dez intenções comerciais distintas sem páginas-cidade duplicadas', () => {
  assert.deepEqual(SERVICE_PAGES.map((page) => page.slug), requiredSlugs)
  assert.equal(new Set(SERVICE_PAGES.map((page) => page.heading)).size, SERVICE_PAGES.length)
  assert.equal(new Set(SERVICE_PAGES.map((page) => page.description)).size, SERVICE_PAGES.length)
  assert.equal(new Set(SERVICE_PAGES.map((page) => page.intro)).size, SERVICE_PAGES.length)
  for (const page of SERVICE_PAGES) {
    assert.equal(page.services.length >= 4, true)
    assert.equal(page.relatedSlugs.length >= 2, true)
  }
})

test('home usa LocalBusiness e Organization para representar a operação mista', () => {
  assert.match(indexSource, /"@type":\["LocalBusiness","Organization"\]/)
  assert.doesNotMatch(indexSource, /"@type":"AutoRepair"/)
})

test('build publica hub de serviços e política de privacidade indexáveis', () => {
  for (const route of ['servicos/index.html', 'privacidade/index.html']) {
    assert.equal(existsSync(path.join(client, route)), true, `faltou ${route}`)
  }
  const hub = readFileSync(path.join(client, 'servicos/index.html'), 'utf8')
  const privacy = readFileSync(path.join(client, 'privacidade/index.html'), 'utf8')
  assert.match(hub, /Todos os serviços/)
  assert.match(hub, /BreadcrumbList/)
  assert.match(privacy, /Política de Privacidade/)
  assert.match(privacy, /Solicitação/)
  assert.match(privacy, /WhatsApp/)
})

test('páginas estáticas carregam o design system do Vite sem duplicar acessibilidade', () => {
  const routes = [
    path.join(client, 'servicos', 'index.html'),
    path.join(client, 'privacidade', 'index.html'),
    ...SERVICE_PAGES.map((page) => path.join(client, 'servicos', page.slug, 'index.html')),
  ]

  for (const route of routes) {
    const html = readFileSync(route, 'utf8')
    assert.match(html, /href="\/assets\/[^"]+\.css"/, `faltou bundle CSS do Vite em ${route}`)
    assert.match(html, /href="\/service-pages\.css"/, `faltou CSS específico em ${route}`)
    assert.equal(
      (html.match(/href="\/mobile-a11y\.css"/g) ?? []).length,
      1,
      `mobile-a11y.css deve aparecer uma vez em ${route}`,
    )
  }
})

test('hub e privacidade preservam o shell institucional também no mobile', () => {
  for (const route of ['servicos/index.html', 'privacidade/index.html']) {
    const html = readFileSync(path.join(client, route), 'utf8')
    assert.match(html, /aria-label="Navegação principal"/, `faltou navegação principal em ${route}`)
    assert.match(html, /class="mobile-menu"/, `faltou menu móvel em ${route}`)
    assert.match(html, /<footer>/, `faltou footer institucional em ${route}`)
  }
})

test('tipografia e geometria das páginas estáticas seguem a linguagem industrial da home', () => {
  for (const selector of [
    '.service-page__related h2',
    '.service-page__hub>h1',
    '.service-page__hub-card h2',
    '.service-page__legal h1',
    '.service-page__legal h2',
  ]) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    assert.match(
      serviceStyles,
      new RegExp(`${escaped}\\s*\\{[^}]*Barlow Condensed`, 's'),
      `faltou tipografia display em ${selector}`,
    )
  }
  assert.doesNotMatch(serviceStyles, /border-radius:999px/, 'pills arredondadas fogem da geometria industrial da CKF')
})

test('landing pages registram Solicitação antes do CTA principal de WhatsApp', () => {
  for (const page of SERVICE_PAGES) {
    const html = readFileSync(path.join(client, 'servicos', page.slug, 'index.html'), 'utf8')
    assert.match(html, new RegExp(`/\\?orcamento=${page.slug}&amp;cta=service-page`))
    assert.match(html, /BreadcrumbList/)
    assert.match(html, /"@type":"Service"/)
    assert.match(html, /Serviços relacionados/)
  }
})

test('sitemap inclui home, hub, privacidade e todo o cluster comercial', () => {
  const sitemap = readFileSync(path.join(client, 'sitemap.xml'), 'utf8')
  assert.match(sitemap, /<loc>https:\/\/ckf-home\.vercel\.app\/servicos<\/loc>/)
  assert.match(sitemap, /<loc>https:\/\/ckf-home\.vercel\.app\/privacidade<\/loc>/)
  for (const slug of requiredSlugs) {
    assert.match(sitemap, new RegExp(`<loc>https:\\/\\/ckf-home\\.vercel\\.app\\/servicos\\/${slug}<\\/loc>`))
  }
  assert.doesNotMatch(sitemap, /<changefreq>/)
})
