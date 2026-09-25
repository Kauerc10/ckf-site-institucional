import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const client = path.join(root, 'dist', 'client')
const homePath = path.join(client, 'index.html')
const requiredStyles = new Set(['/mobile-a11y.css', '/analytics-consent.css'])
const inlined = new Set()

let html = readFileSync(homePath, 'utf8')
html = html.replace(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+\.css)"[^>]*\/?\s*>/g, (tag, href) => {
  if (!requiredStyles.has(href) && !/^\/assets\/index-[\w-]+\.css$/.test(href)) return tag

  const css = readFileSync(path.join(client, href.slice(1)), 'utf8')
  if (css.includes('</style>')) throw new Error(`Unsafe closing style tag in ${href}`)
  inlined.add(href)
  return `<style data-ckf-inline-css="${href}">${css}</style>`
})

if (![...requiredStyles].every((href) => inlined.has(href)) || ![...inlined].some((href) => href.startsWith('/assets/index-'))) {
  throw new Error('Missing home stylesheet during critical CSS inlining')
}

writeFileSync(homePath, html)
console.log(`Inlined ${inlined.size} home stylesheets to remove render-blocking requests`)
