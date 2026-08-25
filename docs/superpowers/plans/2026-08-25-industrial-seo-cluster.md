# Cluster SEO Industrial Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expandir a presença orgânica da CKF com um hub de serviços e páginas estáticas para intenções comerciais distintas, sem doorway pages ou conteúdo duplicado.

**Architecture:** Um catálogo canônico descreve serviços, categorias, termos relacionados, equipamentos, relações internas e conteúdo específico. O build gera `/servicos` e páginas individuais em HTML estático com canonical, Service + BreadcrumbList, links internos e sitemap coerente.

**Tech Stack:** Vite 8, React 19, Node 24, HTML/CSS estático, Schema.org JSON-LD.

**Spec:** `docs/superpowers/specs/2026-08-25-ticket-engine-seo-design.md`

## Global Constraints

- Nova página só entra para serviço real, intenção distinta e conteúdo próprio.
- Não gerar páginas por cidade em massa.
- Não usar keyword stuffing.
- NAP deve permanecer consistente.
- Conteúdo crítico precisa existir no HTML, não depender de JS para indexação.
- `priority` e `changefreq` não serão usados como sinais artificiais no sitemap.

---

### Task 1: Consolidar catálogo SEO canônico

**Files:**
- Modify: `service-pages.mjs`
- Create: `tests/service-catalog.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Cada serviço: `slug`, `href`, `category`, `ticketCategory`, `title`, `heading`, `description`, `intro`, `image`, `imageAlt`, `services`, `equipmentTypes`, `relatedSlugs`, `featured`, `searchTerms`.

- [ ] **Step 1: Write failing tests**

Validar unicidade de slug/href, categorias estáveis, `relatedSlugs` existentes, descrições únicas e ausência de páginas com conteúdo idêntico.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement current four services first**

Migrar os quatro serviços existentes sem mudar suas URLs.

- [ ] **Step 4: Run GREEN**

`npm run test:unit`

- [ ] **Step 5: Commit**

`git commit -m "feat: consolida catálogo SEO de serviços"`

---

### Task 2: Criar hub `/servicos`

**Files:**
- Modify: `scripts/prepare-sites-build.mjs`
- Create: `public/service-hub.css`
- Create: `tests/service-hub.test.mjs`

**Interfaces:**
- Produces: `dist/client/servicos/index.html`.

- [ ] **Step 1: Write failing test**

Exigir HTML estático, H1 único, links para todas as páginas, grupos por família e CTA de Solicitação/WhatsApp.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Generate semantic hub**

Hub deve explicar diferenças entre famílias e orientar escolha, não apenas listar cards.

- [ ] **Step 4: Run GREEN**

`npm run check:deploy`

- [ ] **Step 5: Commit**

`git commit -m "feat: cria hub estático de serviços"`

---

### Task 3: Adicionar BreadcrumbList e relações internas

**Files:**
- Modify: `scripts/prepare-sites-build.mjs`
- Modify: `public/service-pages.css`
- Modify: `tests/service-pages.test.mjs`

**Interfaces:**
- Cada landing contém breadcrumb visível `Início > Serviços > Serviço` e JSON-LD `BreadcrumbList`.

- [ ] **Step 1: Write failing tests**

Exigir breadcrumb HTML, schema e 2–4 links relacionados válidos.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement**

Relacionamentos vêm exclusivamente de `relatedSlugs` do catálogo.

- [ ] **Step 4: Run GREEN**

`npm run check:deploy`

- [ ] **Step 5: Commit**

`git commit -m "feat: conecta serviços com breadcrumbs e relações"`

---

### Task 4: Expandir primeiro cluster comercial

**Files:**
- Modify: `service-pages.mjs`
- Modify: `tests/service-catalog.test.mjs`
- Modify: `tests/service-pages.test.mjs`

**Interfaces:**
- Adicionar somente páginas aprovadas e verificadas como serviço real: máquinas pesadas, manutenção industrial, solda industrial, hidráulica de máquinas pesadas, manutenção preventiva e manutenção corretiva.

- [ ] **Step 1: Write failing inventory test**

Exigir os slugs aprovados e conteúdo único para cada um.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Add pages with unique intent**

Cada página deve ter exemplos de equipamentos/frentes coerentes, sem prometer marcas, certificações ou capacidades não verificadas.

- [ ] **Step 4: Run GREEN**

`npm run check:deploy`

- [ ] **Step 5: Manual content review**

Comparar títulos, H1, descriptions e parágrafos para evitar canibalização.

- [ ] **Step 6: Commit**

`git commit -m "feat: amplia cluster de manutenção industrial"`

---

### Task 5: Corrigir sitemap e metadados técnicos

**Files:**
- Modify: `scripts/prepare-sites-build.mjs`
- Modify: `tests/seo-output.test.mjs`

**Interfaces:**
- Sitemap inclui home, hub e serviços; usa `<lastmod>` somente quando existir data verificável de atualização.

- [ ] **Step 1: Write failing tests**

Exigir ausência de `<priority>` e `<changefreq>`, presença das URLs e canonical único.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement clean sitemap**

Não inventar datas de modificação.

- [ ] **Step 4: Run GREEN**

`npm run security:audit && npm run check:deploy`

- [ ] **Step 5: Preview crawl verification**

Validar home, hub e todas as páginas por HTTP 200 e conferir canonical/schema no HTML retornado.
