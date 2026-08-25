# Analytics, Privacidade e Lançamento Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Preparar o site para lançamento com atribuição comercial sem PII, política de privacidade, domínio canônico e checklist de indexação.

**Architecture:** Um adaptador próprio de analytics recebe eventos tipados e descarta PII antes de repassar ao provedor. A página de privacidade é estática. Domínio, canonical, sitemap e Search Console só viram definitivos quando o domínio real estiver conectado.

**Tech Stack:** Vite 8, Node 24, Vercel, Web Analytics/analytics adapter, HTML estático.

**Spec:** `docs/superpowers/specs/2026-08-25-ticket-engine-seo-design.md`

## Global Constraints

- Analytics nunca recebe nome, telefone, e-mail ou descrição livre.
- Falha de analytics nunca bloqueia Solicitação ou WhatsApp.
- Não apontar canonical para domínio não registrado/conectado.
- Privacidade deve explicar finalidade de atendimento/orçamento em linguagem simples.
- Search Console e sitemap definitivo entram só depois do domínio final.

---

### Task 1: Criar adaptador de eventos sem PII

**Files:**
- Create: `src/analytics.js`
- Create: `tests/analytics.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `trackEvent(name, context)` e `sanitizeAnalyticsContext(context)`.
- Eventos aceitos: `service_view`, `ticket_form_open`, `ticket_step_complete`, `ticket_submit`, `ticket_success`, `ticket_error`, `whatsapp_click`.

- [ ] **Step 1: Write failing tests**

Exigir remoção de `name`, `contact_name`, `phone`, `email`, `description` e campos desconhecidos sensíveis.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement provider-neutral adapter**

Sem provider ativo, `trackEvent` é no-op seguro. Provedor é injetado/configurado depois.

- [ ] **Step 4: Run GREEN**

`npm run test:unit`

- [ ] **Step 5: Commit**

`git commit -m "feat: cria analytics sem dados pessoais"`

---

### Task 2: Instrumentar funil de Solicitação

**Files:**
- Modify: `src/App.jsx`
- Modify: `src/tickets/TicketRequestForm.jsx`
- Modify: `src/whatsapp.js`
- Create: `tests/analytics-funnel.test.mjs`

- [ ] **Step 1: Write failing tests**

Exigir eventos nos pontos previstos e nenhum payload com PII.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement instrumentation**

Eventos carregam `service_slug`, `landing_path`, `cta_source`, UTM e `ticket_public_id` somente após sucesso.

- [ ] **Step 4: Run GREEN**

`npm run check:deploy`

- [ ] **Step 5: Commit**

`git commit -m "feat: mede funil de solicitações"`

---

### Task 3: Publicar página de privacidade

**Files:**
- Modify: `scripts/prepare-sites-build.mjs`
- Create: `public/privacy.css`
- Create: `tests/privacy-page.test.mjs`

- [ ] **Step 1: Write failing test**

Exigir `/privacidade/index.html`, canonical, H1, finalidade de atendimento/orçamento, categorias de dados, contato e explicação de retenção.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Generate static page**

Texto sem consentimento genérico de marketing; explicar uso dos dados somente para responder e preparar atendimento/orçamento, salvo nova base/finalidade explícita futura.

- [ ] **Step 4: Run GREEN**

`npm run check:deploy`

- [ ] **Step 5: Commit**

`git commit -m "feat: publica privacidade das solicitações"`

---

### Task 4: Ativar provedor de analytics somente quando disponível

**Files:**
- Modify: `src/analytics.js`
- Modify: `index.html` ou dependência, conforme provedor confirmado.
- Test: `tests/analytics-provider.test.mjs`

- [ ] **Step 1: Confirm provider status**

Verificar se Vercel Web Analytics está ativado no projeto. Não injetar script quebrado.

- [ ] **Step 2: Write failing provider test**

Somente se o recurso estiver ativo.

- [ ] **Step 3: Implement adapter binding**

Manter API interna estável.

- [ ] **Step 4: Verify network behavior**

Evento não pode carregar PII nem bloquear UX.

---

### Task 5: Migrar para domínio definitivo

**Files:**
- Modify: `site.config.mjs`
- Modify: `tests/seo-output.test.mjs`
- Modify: `vercel.json` somente se redirects forem necessários.

- [ ] **Step 1: Confirm ownership and DNS**

Domínio alvo recomendado: `ckfmanutencao.com.br`. Não executar esta task antes do registro.

- [ ] **Step 2: Write failing canonical test**

Exigir `https://ckfmanutencao.com.br` somente depois de o domínio estar conectado.

- [ ] **Step 3: Update SITE_URL and redirects**

Aliases devem redirecionar para uma única origem canônica HTTPS.

- [ ] **Step 4: Run GREEN**

`npm run security:audit && npm run check:deploy`

- [ ] **Step 5: Production checks**

Validar `/`, `/servicos`, todas as landings, `/privacidade`, `robots.txt`, `sitemap.xml`, canonical e headers.

---

### Task 6: Checklist de indexação

**Files:**
- Create: `docs/launch/seo-launch-checklist.md`

- [ ] **Step 1: Document exact launch sequence**

Registrar: domínio/HTTPS, Search Console, sitemap, inspeção das páginas principais, Google Business Profile/NAP, monitoramento de cobertura e Core Web Vitals.

- [ ] **Step 2: Commit**

`git commit -m "docs: adiciona checklist de lançamento SEO"`
