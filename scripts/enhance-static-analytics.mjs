import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const distClient = path.join(root, 'dist', 'client')
const marker = '<!-- ckf:web-analytics -->'
const snippet = `${marker}
<script src="/analytics-init.js"></script>
<script defer src="/_vercel/insights/script.js"></script>`

function htmlFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name)
    if (entry.isDirectory()) return htmlFiles(fullPath)
    return entry.isFile() && entry.name.endsWith('.html') ? [fullPath] : []
  })
}

let enhanced = 0
for (const file of htmlFiles(distClient)) {
  const html = readFileSync(file, 'utf8')
  if (html.includes(marker)) continue
  if (!html.includes('</head>')) throw new Error(`Missing </head> in ${file}`)

  writeFileSync(file, html.replace('</head>', `${snippet}\n</head>`))
  enhanced += 1
}

console.log(`Enhanced Web Analytics for ${enhanced} HTML pages`)
