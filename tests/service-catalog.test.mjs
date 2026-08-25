import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { SERVICE_PAGES } from '../service-pages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')

const allowedCategories = new Set([
  'trucks',
  'concrete_plants',
  'chassis',
  'metal_structures',
  'heavy_machinery',
  'industrial_maintenance',
  'industrial_welding',
  'heavy_hydraulics',
  'preventive_maintenance',
  'corrective_maintenance',
])

test('serviços atuais expõem contrato canônico para navegação e tickets', () => {
  assert.equal(SERVICE_PAGES.length, 10)
  assert.equal(SERVICE_PAGES.filter((service) => service.featured).length, 4)

  for (const service of SERVICE_PAGES) {
    assert.equal(service.href, `/servicos/${service.slug}`)
    assert.equal(typeof service.cardTitle, 'string')
    assert.equal(service.cardTitle.length > 3, true)
    assert.equal(typeof service.featured, 'boolean')
    assert.equal(allowedCategories.has(service.ticketCategory), true)
    assert.equal(Array.isArray(service.relatedSlugs), true)
  }
})

test('slugs, hrefs e categorias são únicos e coerentes', () => {
  assert.equal(new Set(SERVICE_PAGES.map((item) => item.slug)).size, SERVICE_PAGES.length)
  assert.equal(new Set(SERVICE_PAGES.map((item) => item.href)).size, SERVICE_PAGES.length)
  assert.equal(new Set(SERVICE_PAGES.map((item) => item.ticketCategory)).size, SERVICE_PAGES.length)
})

test('home consome SERVICE_PAGES em vez de duplicar o catálogo', () => {
  assert.match(app, /SERVICE_PAGES/)
  assert.match(app, /service\.href/)
  assert.match(app, /data-service-slug=/)
  assert.doesNotMatch(app, /const serviceHighlights = \[/)
})
