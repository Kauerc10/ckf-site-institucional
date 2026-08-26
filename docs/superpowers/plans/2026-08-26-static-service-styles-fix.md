# Static Service Styles Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restaurar o design system completo da CKF em todas as páginas estáticas de serviços, hub e privacidade, eliminando a regressão que publica essas rotas sem o bundle CSS principal.

**Architecture:** O build Vite continua sendo a fonte do CSS global. `prepare-sites-build.mjs` deve selecionar explicitamente o stylesheet gerado em `/assets/*.css`, nunca o primeiro stylesheet do documento. `service-pages.css` permanece como camada de especialização das páginas estáticas e `mobile-a11y.css` permanece como camada de acessibilidade, sem duplicação.

**Tech Stack:** Vite 8, React 19, Node test runner, HTML estático gerado em `dist/client`, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-25-ticket-engine-seo-design.md`

## Global Constraints

- Preservar o design atual da home como fonte visual, sem iniciar a V2.
- Não remover SEO, schemas, sitemap, breadcrumbs, Ticket CTA ou acessibilidade.
- Não alterar o domínio canônico nesta correção.
- Toda mudança de comportamento deve seguir RED → GREEN.
- Validar desktop e mobile em preview real antes do merge.

---

### Task 1: Regressão do bundle CSS estático

**Files:**
- Modify: `tests/seo-industrial-launch.test.mjs`

**Interfaces:**
- Consumes: saída já gerada em `dist/client`.
- Produces: contrato que exige o bundle Vite, `service-pages.css` e apenas uma ocorrência de `mobile-a11y.css` nas rotas estáticas.

- [ ] **Step 1: Write the failing test**

Adicionar um teste que percorra `/servicos`, `/privacidade` e as 10 páginas de serviço e valide:

```js
assert.match(html, /href="\/assets\/[^\"]+\.css"/)
assert.match(html, /href="\/service-pages\.css"/)
assert.equal((html.match(/href="\/mobile-a11y\.css"/g) ?? []).length, 1)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run build && node --test tests/seo-industrial-launch.test.mjs`
Expected: FAIL porque as páginas estáticas atuais usam `/mobile-a11y.css` como stylesheet principal e as páginas de serviço o recebem duas vezes.

- [ ] **Step 3: Commit RED**

Commit: `test: protege estilos das páginas estáticas`

---

### Task 2: Seleção correta do CSS do Vite

**Files:**
- Modify: `scripts/prepare-sites-build.mjs`
- Modify only if needed after verification: `scripts/enhance-static-accessibility.mjs`

**Interfaces:**
- Consumes: HTML final produzido pelo Vite em `dist/client/index.html`.
- Produces: `stylesheetHref` apontando para `/assets/<hash>.css` e HTML estático sem duplicação da folha de acessibilidade.

- [ ] **Step 1: Implement the minimal fix**

Extrair todos os `<link rel="stylesheet">` do HTML do Vite e selecionar o que tiver `href` iniciado por `/assets/` e terminado em `.css`. Falhar o build com mensagem explícita se esse bundle não existir.

- [ ] **Step 2: Prevent duplicate accessibility CSS**

No enhancer, inserir `/mobile-a11y.css` somente quando a página ainda não possuir esse href.

- [ ] **Step 3: Run GREEN verification**

Run: `npm run build && node --test tests/seo-industrial-launch.test.mjs`
Expected: PASS.

- [ ] **Step 4: Run full gates**

Run: `npm run check:deploy && npm run security:audit`
Expected: PASS, sem regressões.

- [ ] **Step 5: Commit GREEN**

Commit: `fix: restaura design das páginas estáticas`

---

### Task 3: QA visual e responsivo

**Files:**
- No production file unless a visual mismatch is proven after the CSS restoration.

**Interfaces:**
- Consumes: Vercel preview da branch.
- Produces: evidência de que serviço, hub e privacidade usam o mesmo sistema visual da home.

- [ ] **Step 1: Open representative routes**

Validate:
- `/servicos/reforma-chassis`
- `/servicos/manutencao-maquinas-pesadas`
- `/servicos`
- `/privacidade`

- [ ] **Step 2: Desktop checks**

Verify: background escuro, Barlow/Barlow Condensed, header correto, hero sem overlap, tabela legível, relacionados, contato e footer alinhados.

- [ ] **Step 3: Mobile checks**

Verify at approximately 390×844: sem overflow horizontal global, menu móvel acessível, hero legível, tabela com scroll apenas no próprio container e CTAs utilizáveis.

- [ ] **Step 4: Regression interaction**

Open the primary service CTA and verify it routes to `/?orcamento=<slug>&cta=service-page` so the Solicitação flow remains connected.

- [ ] **Step 5: Merge gate**

Merge only after CI, Security and visual QA are green.
