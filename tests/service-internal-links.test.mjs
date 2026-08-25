import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { SERVICE_PAGES } from '../service-pages.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')

const servicePaths = [
  '/servicos/manutencao-caminhoes',
  '/servicos/central-concreto',
  '/servicos/reforma-chassis',
  '/servicos/estruturas-metalicas',
]

test('catálogo referencia todas as landing pages de serviço usadas pela home', () => {
  assert.deepEqual(SERVICE_PAGES.filter((service) => service.featured).map((service) => service.href), servicePaths)
  assert.match(app, /SERVICE_PAGES\.filter/)
})

test('cards principais navegam pela URL do serviço, não direto ao WhatsApp', () => {
  assert.match(app, /className="service-card"[\s\S]*?href=\{service\.href\}/)
})
