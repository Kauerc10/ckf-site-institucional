# Catálogo Canônico de Serviços Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar `service-pages.mjs` como fonte única dos serviços usados pela home, build estático, SEO e futuro Ticket Engine, preservando os links internos já entregues pela PR #16.

**Architecture:** Os quatro serviços existentes ganham metadados estáveis para navegação e tickets. A home deixa de duplicar títulos, URLs e imagens em um array hardcoded e passa a derivar seus destaques de `SERVICE_PAGES`, sem alterar o comportamento comercial já validado.

**Tech Stack:** React 19, Vite 8, Node 24 test runner, HTML estático gerado no build.

**Spec:** `docs/superpowers/specs/2026-08-25-ticket-engine-seo-design.md`

## Global Constraints

- Público usa **Solicitação**; operação interna usa **Ticket**.
- Nenhuma linguagem `lead` entra na interface, API própria, eventos ou banco desse fluxo.
- Novas URLs somente para serviços realmente prestados pela CKF.
- Links rastreáveis precisam ser `<a href>` reais.
- Os links internos dos cards entregues pela PR #16 não podem regredir para WhatsApp direto.
- WhatsApp direto continua disponível em pontos de alta intenção fora dos cards principais.
- Todos os commits funcionais seguem RED -> GREEN.

---

### Task 1: Tornar o catálogo atual consumível pela home e pelo Ticket Engine

**Files:**
- Modify: `service-pages.mjs`
- Create: `tests/service-catalog.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `SERVICE_PAGES` com `href`, `featured`, `cardTitle`, `ticketCategory` e `relatedSlugs`.

- [ ] **Step 1: Write the failing test**

Criar `tests/service-catalog.test.mjs`:

```js
import assert from 'node:assert/strict'
import test from 'node:test'
import { SERVICE_PAGES } from '../service-pages.mjs'

const allowedCategories = new Set([
  'trucks',
  'concrete_plants',
  'chassis',
  'metal_structures',
])

test('serviços atuais expõem contrato canônico para navegação e tickets', () => {
  assert.equal(SERVICE_PAGES.length, 4)

  for (const service of SERVICE_PAGES) {
    assert.match(service.slug, /^[a-z0-9-]+$/)
    assert.equal(service.href, `/servicos/${service.slug}`)
    assert.equal(service.cardTitle.length > 3, true)
    assert.equal(typeof service.featured, 'boolean')
    assert.equal(allowedCategories.has(service.ticketCategory), true)
    assert.equal(Array.isArray(service.relatedSlugs), true)
  }
})

test('slugs, hrefs e categorias dos quatro serviços são coerentes', () => {
  assert.equal(new Set(SERVICE_PAGES.map((item) => item.slug)).size, SERVICE_PAGES.length)
  assert.equal(new Set(SERVICE_PAGES.map((item) => item.href)).size, SERVICE_PAGES.length)
  for (const service of SERVICE_PAGES) {
    for (const relatedSlug of service.relatedSlugs) {
      assert.ok(SERVICE_PAGES.some((item) => item.slug === relatedSlug))
      assert.notEqual(relatedSlug, service.slug)
    }
  }
})
```

Adicionar `tests/service-catalog.test.mjs` ao script `test:unit`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test:unit`

Expected: FAIL porque os objetos atuais não possuem `href`, `featured`, `cardTitle`, `ticketCategory` e `relatedSlugs`.

- [ ] **Step 3: Write minimal implementation**

Adicionar aos quatro objetos existentes:

```js
// manutencao-caminhoes
href: '/servicos/manutencao-caminhoes',
featured: true,
cardTitle: 'Caminhões e máquinas pesadas',
ticketCategory: 'trucks',
relatedSlugs: ['reforma-chassis', 'estruturas-metalicas'],

// central-concreto
href: '/servicos/central-concreto',
featured: true,
cardTitle: 'Centrais de concreto',
ticketCategory: 'concrete_plants',
relatedSlugs: ['estruturas-metalicas', 'reforma-chassis'],

// reforma-chassis
href: '/servicos/reforma-chassis',
featured: true,
cardTitle: 'Reforma de equipamentos e chassis',
ticketCategory: 'chassis',
relatedSlugs: ['manutencao-caminhoes', 'estruturas-metalicas'],

// estruturas-metalicas
href: '/servicos/estruturas-metalicas',
featured: true,
cardTitle: 'Estruturas metálicas',
ticketCategory: 'metal_structures',
relatedSlugs: ['central-concreto', 'reforma-chassis'],
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add service-pages.mjs tests/service-catalog.test.mjs package.json
git commit -m "feat: consolida catálogo canônico de serviços"
```

---

### Task 2: Remover duplicação da home sem alterar navegação

**Files:**
- Modify: `src/App.jsx`
- Modify: `tests/service-internal-links.test.mjs`
- Create: `tests/service-home-catalog.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `SERVICE_PAGES` da Task 1.
- Produces: `serviceHighlights` derivado apenas de serviços `featured`.

- [ ] **Step 1: Write the failing test**

```js
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const app = readFileSync(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('home deriva destaques do catálogo canônico', () => {
  assert.match(app, /SERVICE_PAGES/)
  assert.match(app, /\.filter\(\(service\) => service\.featured\)/)
  assert.match(app, /href=\{service\.href\}/)
  assert.match(app, /data-service-slug=\{service\.slug\}/)
})
```

Atualizar `tests/service-internal-links.test.mjs` para validar o comportamento através do catálogo, em vez de exigir quatro URLs duplicadas literalmente em `App.jsx`.

- [ ] **Step 2: Run RED**

Run: `npm run test:unit`

Expected: FAIL porque a home ainda mantém `serviceHighlights` hardcoded e não importa `SERVICE_PAGES`.

- [ ] **Step 3: Implement minimal refactor**

No topo de `src/App.jsx`:

```js
import { SERVICE_PAGES } from '../service-pages.mjs'
```

Substituir o array hardcoded por:

```js
const serviceHighlights = SERVICE_PAGES
  .filter((service) => service.featured)
  .map((service) => ({
    slug: service.slug,
    title: service.cardTitle,
    href: service.href,
    image: service.image,
  }))
```

No card manter `href={service.href}` e adicionar:

```jsx
data-service-slug={service.slug}
```

Não alterar hero, tabela, header, contato ou rodapé nesta task.

- [ ] **Step 4: Run GREEN**

Run: `npm run check:deploy`
Expected: build e todos os gates verdes.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx tests/service-internal-links.test.mjs tests/service-home-catalog.test.mjs package.json
git commit -m "refactor: usa catálogo único na home"
```

---

### Task 3: Verificar que o catálogo não alterou as rotas publicadas

**Files:**
- No code changes unless verification finds a defect.

- [ ] **Step 1: Run full gates**

```bash
npm ci
npm run security:audit
npm run check:deploy
```

Expected: PASS e `found 0 vulnerabilities`.

- [ ] **Step 2: Verify generated pages**

Validar que o build ainda contém:

```text
/servicos/manutencao-caminhoes
/servicos/central-concreto
/servicos/reforma-chassis
/servicos/estruturas-metalicas
```

Expected: cada página mantém canonical, H1, Service schema e CTA contextual.

- [ ] **Step 3: Preview/production validation**

Validar as rotas por HTTP no ambiente que não estiver bloqueado pela proteção SSO. Se o preview bloquear rotas profundas, registrar a limitação e repetir a prova no alias público após merge.
