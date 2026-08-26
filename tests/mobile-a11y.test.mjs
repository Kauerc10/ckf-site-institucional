import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8')
}

test('home oferece navegação móvel sem remover a navegação do teclado', () => {
  const app = read('src/App.jsx')

  assert.match(app, /className="skip-link"/)
  assert.match(app, /<details className="mobile-menu"[^>]*>/)
  assert.match(app, /<summary[^>]*>Menu<\/summary>/)
})

test('estilos incluem foco visível e preferência por movimento reduzido', () => {
  const cssPath = path.join(root, 'public', 'mobile-a11y.css')

  assert.equal(existsSync(cssPath), true, 'mobile-a11y.css deve existir')
  const css = read('public/mobile-a11y.css')
  assert.match(css, /:focus-visible/)
  assert.match(css, /prefers-reduced-motion:\s*reduce/)
})

test('landing pages estáticas recebem skip link e menu móvel', () => {
  const html = read('dist/client/servicos/manutencao-caminhoes/index.html')

  assert.match(html, /class="skip-link"/)
  assert.match(html, /<details class="mobile-menu">/)
  assert.match(html, /\/mobile-a11y\.css/)
})
