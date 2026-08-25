import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')

const servicePaths = [
  '/servicos/manutencao-caminhoes',
  '/servicos/central-concreto',
  '/servicos/reforma-chassis',
  '/servicos/estruturas-metalicas',
]

test('home referencia todas as landing pages de serviço', () => {
  for (const servicePath of servicePaths) {
    assert.match(app, new RegExp(servicePath.replaceAll('/', '\\/')))
  }
})

test('cards principais navegam pela URL do serviço, não direto ao WhatsApp', () => {
  assert.match(app, /className="service-card"[\s\S]*?href=\{service\.href\}/)
})
