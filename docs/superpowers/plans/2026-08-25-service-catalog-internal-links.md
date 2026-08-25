# Catálogo de Serviços e Links Internos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Consolidar um catálogo canônico de serviços e fazer a home distribuir navegação rastreável para as páginas de serviço sem remover os atalhos diretos de WhatsApp.

**Architecture:** O arquivo `service-pages.mjs` evolui para a fonte de verdade compartilhada entre o React e o gerador estático. A home importa apenas os serviços marcados como `featured`, usa `href` interno nos cards e preserva os CTAs diretos de alta intenção fora desses cards.

**Tech Stack:** React 19, Vite 8, Node 24 test runner, HTML estático gerado no build.

**Spec:** `docs/superpowers/specs/2026-08-25-ticket-engine-seo-design.md`

## Global Constraints

- Público usa **Solicitação**; operação interna usa **Ticket**.
- Nenhuma linguagem `lead` entra na interface, API própria, eventos ou banco desse fluxo.
- Novas URLs somente para serviços realmente prestados pela CKF.
- Links rastreáveis precisam ser `<a href>` reais.
- WhatsApp direto continua disponível em pontos de alta intenção.
- Todos os commits funcionais seguem RED -> GREEN.

---

### Task 1: Tornar o catálogo atual consumível pela home e pelo build

**Files:**
- Modify: `service-pages.mjs`
- Create: `tests/service-catalog.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `SERVICE_PAGES: readonly ServicePage[]` com `href`, `featured`, `cardTitle`, `ticketCategory` e `relatedSlugs`.
- Consumes: nenhum contrato novo.

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
    assert.equal(typeof service.cardTitle, 'string')
    assert.equal(service.cardTitle.length > 3, true)
    assert.equal(typeof service.featured, 'boolean')
    assert.equal(allowedCategories.has(service.ticketCategory), true)
    assert.equal(Array.isArray(service.relatedSlugs), true)
  }
})

test('slugs e hrefs são únicos', () => {
  assert.equal(new Set(SERVICE_PAGES.map((item) => item.slug)).size, SERVICE_PAGES.length)
  assert.equal(new Set(SERVICE_PAGES.map((item) => item.href)).size, SERVICE_PAGES.length)
})
```

Adicionar `tests/service-catalog.test.mjs` ao script `test:unit`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit
```

Expected: FAIL porque os objetos atuais não possuem `href`, `featured`, `cardTitle`, `ticketCategory` e `relatedSlugs`.

- [ ] **Step 3: Write minimal implementation**

Adicionar aos quatro objetos existentes em `service-pages.mjs`:

```js
{
  slug: 'manutencao-caminhoes',
  href: '/servicos/manutencao-caminhoes',
  featured: true,
  cardTitle: 'Caminhões e máquinas pesadas',
  ticketCategory: 'trucks',
  relatedSlugs: ['reforma-chassis', 'estruturas-metalicas'],
  // manter os campos existentes
}
```

Usar, respectivamente:

```js
// central-concreto
href: '/servicos/central-concreto'
featured: true
cardTitle: 'Centrais de concreto'
ticketCategory: 'concrete_plants'
relatedSlugs: ['estruturas-metalicas', 'reforma-chassis']

// reforma-chassis
href: '/servicos/reforma-chassis'
featured: true
cardTitle: 'Reforma de equipamentos e chassis'
ticketCategory: 'chassis'
relatedSlugs: ['manutencao-caminhoes', 'estruturas-metalicas']

// estruturas-metalicas
href: '/servicos/estruturas-metalicas'
featured: true
cardTitle: 'Estruturas metálicas'
ticketCategory: 'metal_structures'
relatedSlugs: ['central-concreto', 'reforma-chassis']
```

- [ ] **Step 4: Run test to verify it passes**

Run:

```bash
npm run test:unit
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add service-pages.mjs tests/service-catalog.test.mjs package.json
git commit -m "feat: consolida catálogo canônico de serviços"
```

---

### Task 2: Fazer os cards da home apontarem para páginas internas

**Files:**
- Modify: `src/App.jsx`
- Create: `tests/internal-service-links.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `SERVICE_PAGES` da Task 1.
- Produces: cards de destaque com `href` interno e `data-service-slug`.

- [ ] **Step 1: Write the failing test**

Criar `tests/internal-service-links.test.mjs`:

```js
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const app = await readFile(new URL('../src/App.jsx', import.meta.url), 'utf8')

test('home usa o catálogo e links internos nos cards principais', () => {
  assert.match(app, /SERVICE_PAGES/)
  assert.match(app, /service\.href/)
  assert.match(app, /data-service-slug=/)
  assert.doesNotMatch(app, /service-card[^\n]+buildWhatsAppUrl/)
})
```

Adicionar o arquivo ao `test:unit`.

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test:unit
```

Expected: FAIL porque `serviceHighlights` ainda é hardcoded e os cards abrem WhatsApp.

- [ ] **Step 3: Write minimal implementation**

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

Alterar o card:

```jsx
<a
  className="service-card"
  key={service.slug}
  href={service.href}
  data-service-slug={service.slug}
>
  <img src={service.image} alt="" loading="lazy" />
  <span className="service-card__number">0{index + 1}</span>
  <h3>{service.title}</h3>
</a>
```

Não alterar os links de WhatsApp da hero, tabela, header, contato e rodapé nesta task.

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run check:deploy
```

Expected: todos os testes, build e configurações verdes.

- [ ] **Step 5: Commit**

```bash
git add src/App.jsx tests/internal-service-links.test.mjs package.json
git commit -m "feat: conecta home às páginas de serviço"
```

---

### Task 3: Verificar navegação real em preview

**Files:**
- No code changes unless verification finds a defect.

**Interfaces:**
- Consumes: deploy Vercel da branch.
- Produces: evidência de que cada card resolve em uma página estática 200.

- [ ] **Step 1: Run full CI**

```bash
npm ci
npm run security:audit
npm run check:deploy
```

Expected: PASS e `found 0 vulnerabilities`.

- [ ] **Step 2: Verify preview routes**

Verificar no preview Vercel:

```text
/
/servicos/manutencao-caminhoes
/servicos/central-concreto
/servicos/reforma-chassis
/servicos/estruturas-metalicas
```

Expected: HTTP 200 e cada rota de serviço entrega o HTML específico, não a home SPA.

- [ ] **Step 3: Final commit only if verification required a fix**

Se nenhum ajuste for necessário, não criar commit vazio.
