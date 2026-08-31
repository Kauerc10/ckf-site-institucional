import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distClient = path.join(root, 'dist', 'client')
const siteUrl = 'https://ckfmanutencao.com.br'
const mapsUrl = 'https://maps.app.goo.gl/WTSkh222vowLHtQi7'

test('publica canonical, Open Graph e dados estruturados com URL absoluta', () => {
  const html = readFileSync(path.join(distClient, 'index.html'), 'utf8')
  assert.ok(html.includes(`<link rel="canonical" href="${siteUrl}"`))
  assert.ok(html.includes(`<meta property="og:url" content="${siteUrl}"`))
  assert.ok(html.includes(`${siteUrl}/assets/solda-ckf.webp`))
  assert.match(html, /"@type":\["LocalBusiness","Organization"\]/)
  assert.match(html, /"addressLocality":"Itajaí"/)
  assert.ok(html.includes(`"hasMap":"${mapsUrl}"`))
  assert.match(html, /<h1>Sua operação<br \/>precisa continuar\.<\/h1>/)
  assert.doesNotMatch(html, /<div id="root"><\/div>/)
})

test('snapshot estático mantém a narrativa atual da CKF e a jornada de cinco etapas', () => {
  const html = readFileSync(path.join(distClient, 'index.html'), 'utf8')

  assert.match(html, /Trabalho de verdade\. Parceria que mantém[\s\S]*?sua operação em movimento\./)
  assert.match(html, /A CKF trabalha lado a lado com quem depende da operação funcionando\./)
  assert.match(html, /Do primeiro contato à operação de volta\./)
  assert.match(html, /Você sabe o que está acontecendo em cada etapa\./)

  for (const step of [
    'Solicitação do atendimento',
    'Análise e diagnóstico',
    'Orçamento e alinhamento',
    'Execução acompanhada',
    'Teste e entrega',
  ]) {
    assert.ok(html.includes(step), `snapshot deve incluir a etapa: ${step}`)
  }
})

test('snapshot e dados estruturados apontam apenas para a ficha oficial da CKF no Maps', () => {
  const html = readFileSync(path.join(distClient, 'index.html'), 'utf8')

  assert.ok(html.includes(mapsUrl))
  assert.doesNotMatch(html, /google\.com\/maps\/search\/\?api=1(?:&|&amp;)query=/)
  assert.match(html, /Como chegar à CKF/)
})

test('publica robots.txt apontando para o sitemap', () => {
  const robots = readFileSync(path.join(distClient, 'robots.txt'), 'utf8')
  assert.match(robots, /User-agent: \*/)
  assert.match(robots, /Allow: \//)
  assert.ok(robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`))
})

test('gera sitemap.xml com a home canônica', () => {
  const sitemapPath = path.join(distClient, 'sitemap.xml')
  assert.equal(existsSync(sitemapPath), true, 'sitemap.xml deve ser gerado no build')
  const sitemap = readFileSync(sitemapPath, 'utf8')
  assert.ok(sitemap.includes(`<loc>${siteUrl}</loc>`))
})

test('publica um resumo legível por agentes sem inventar preços', () => {
  const llmsPath = path.join(distClient, 'llms.txt')
  assert.equal(existsSync(llmsPath), true, 'llms.txt deve existir no artefato final')
  const llms = readFileSync(llmsPath, 'utf8')
  assert.match(llms, /# CKF Manutenção/)
  assert.match(llms, /\[Serviços\]\(https:\/\/ckfmanutencao\.com\.br\/servicos\)/)
  assert.doesNotMatch(llms, /Preço:/)
})
