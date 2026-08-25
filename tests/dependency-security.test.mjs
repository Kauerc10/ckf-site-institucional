import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'))
const npmrc = readFileSync(path.join(root, '.npmrc'), 'utf8')
const ci = readFileSync(path.join(root, '.github', 'workflows', 'ci.yml'), 'utf8')

test('auditoria de vulnerabilidades altas faz parte do CI', () => {
  assert.equal(packageJson.scripts?.['security:audit'], 'npm audit --audit-level=high')
  assert.match(ci, /npm run security:audit/)
})

test('scripts de instalação não revisados são bloqueados', () => {
  assert.match(npmrc, /^strict-allow-scripts=true$/m)
  assert.deepEqual(packageJson.allowScripts, {
    fsevents: false,
  })
})
