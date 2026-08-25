import assert from 'node:assert/strict'
import { readdirSync, statSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const assetsRoot = path.join(root, 'public', 'assets')
const MAX_ASSET_BYTES = 1_000_000

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const absolutePath = path.join(directory, entry.name)
    return entry.isDirectory() ? listFiles(absolutePath) : [absolutePath]
  })
}

test('nenhum asset público individual ultrapassa 1 MB', () => {
  const oversized = listFiles(assetsRoot)
    .map((file) => ({
      file: path.relative(root, file).replaceAll('\\', '/'),
      bytes: statSync(file).size,
    }))
    .filter(({ bytes }) => bytes > MAX_ASSET_BYTES)

  assert.deepEqual(
    oversized,
    [],
    `Assets acima de 1 MB devem ser otimizados ou removidos: ${oversized
      .map(({ file, bytes }) => `${file} (${(bytes / 1024 / 1024).toFixed(2)} MB)`)
      .join(', ')}`,
  )
})
