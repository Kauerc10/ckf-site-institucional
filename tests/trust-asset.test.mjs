import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const app = readFileSync(path.join(root, 'src', 'App.jsx'), 'utf8')

test('seção de confiança usa fotografia real da equipe', () => {
  const trustSection = app.match(/<section className="trust">([\s\S]*?)<\/section>/)?.[0]

  assert.ok(trustSection, 'seção trust deve existir')
  assert.match(trustSection, /\/assets\/real\/equipe-central-real\.webp/)
  assert.doesNotMatch(trustSection, /ai-enhanced/)
})
