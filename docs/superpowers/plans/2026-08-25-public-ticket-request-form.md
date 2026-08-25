# Formulário Público de Solicitações Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar um fluxo mobile-first de Solicitação CKF que persiste um Ticket via contrato HTTP antes de abrir o WhatsApp.

**Architecture:** O frontend terá um módulo puro para normalização/serialização, um cliente HTTP isolado e um componente de formulário em até três etapas. A UI nunca acessa Supabase diretamente; recebe somente `public_id` do backend e monta a mensagem de WhatsApp após sucesso.

**Tech Stack:** React 19, Vite 8, Node 24 test runner, Fetch API.

**Spec:** `docs/superpowers/specs/2026-08-25-ticket-engine-seo-design.md`

## Global Constraints

- Público usa **Solicitação**; operação interna usa **Ticket**.
- Nenhuma linguagem `lead` na interface, eventos ou contratos próprios.
- Persistir antes de abrir WhatsApp.
- Não enviar CPF, CNPJ, endereço completo ou PII para analytics.
- Nenhum segredo ou service-role no frontend.
- WhatsApp direto permanece como alternativa secundária.
- Fluxo precisa funcionar por teclado e em mobile.

---

### Task 1: Definir contrato e normalização do ticket no site

**Files:**
- Create: `src/tickets/ticket-contract.js`
- Create: `tests/ticket-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Produces: `normalizeTicketDraft(input)` e `buildTicketPayload(input, context)`.
- Payload inclui `service_category`, `service_slug`, `equipment_type`, `equipment_brand`, `equipment_model`, `company_name`, `contact_name`, `phone`, `email`, `city`, `uf`, `description`, `urgency`, `landing_path`, `cta_source`, `referrer`, UTM e `idempotency_key`.

- [ ] **Step 1: Write failing tests**

Cobrir telefone brasileiro normalizado, espaços colapsados, UF maiúscula, limites de comprimento, UTM preservada e rejeição de nome/telefone/descrição vazios.

```js
const normalized = normalizeTicketDraft({
  contactName: '  João   Silva ',
  phone: '(47) 99999-0000',
  uf: 'sc',
  description: '  Vazamento   hidráulico ',
})
assert.equal(normalized.contactName, 'João Silva')
assert.equal(normalized.phone, '5547999990000')
assert.equal(normalized.uf, 'SC')
assert.equal(normalized.description, 'Vazamento hidráulico')
```

- [ ] **Step 2: Run RED**

Run: `npm run test:unit`
Expected: FAIL com módulo inexistente.

- [ ] **Step 3: Implement minimal pure helpers**

Usar funções puras, sem DOM e sem acesso a `window`. `buildTicketPayload` recebe contexto explicitamente para ser testável.

- [ ] **Step 4: Run GREEN**

Run: `npm run test:unit`
Expected: PASS.

- [ ] **Step 5: Commit**

`git commit -m "feat: define contrato público de solicitações"`

---

### Task 2: Criar cliente HTTP isolado

**Files:**
- Create: `src/tickets/ticket-api.js`
- Create: `tests/ticket-api.test.mjs`

**Interfaces:**
- Consumes: payload da Task 1.
- Produces: `submitTicket(payload, { endpoint, fetchImpl }) -> Promise<{ publicId: string }>`.

- [ ] **Step 1: Write failing tests**

Testar POST JSON, timeout/AbortSignal, resposta 201, erro 400 com mensagem pública e 5xx convertido em mensagem recuperável.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement minimal client**

Endpoint vem de `VITE_CKF_TICKET_ENDPOINT`; se ausente, a UI deve manter formulário desabilitado em produção e WhatsApp direto disponível.

- [ ] **Step 4: Run GREEN**

`npm run test:unit`

- [ ] **Step 5: Commit**

`git commit -m "feat: adiciona cliente seguro de tickets"`

---

### Task 3: Construir formulário de Solicitação

**Files:**
- Create: `src/tickets/TicketRequestForm.jsx`
- Create: `src/tickets/ticket-form.css`
- Modify: `src/App.jsx`
- Create: `tests/ticket-form-source.test.mjs`

**Interfaces:**
- Props: `initialService`, `ctaSource`, `onClose`.
- Produces sucesso `{ publicId, whatsappUrl }`.

- [ ] **Step 1: Write failing source/accessibility tests**

Exigir `aria-live`, labels explícitos, botão Voltar, progresso textual `Etapa X de 3`, honeypot `website`, CTA `Enviar solicitação e abrir WhatsApp` e ausência da palavra proibida na UI.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement three-step form**

Etapa 1: serviço/equipamento/problema/urgência.
Etapa 2: nome/WhatsApp/empresa/e-mail/cidade/UF.
Etapa 3: resumo, aviso de finalidade e envio.

Não usar modal que aprisiona scroll sem foco; se for dialog, gerenciar foco e Escape. Preferir painel/dialog nativo acessível.

- [ ] **Step 4: Run GREEN**

`npm run check:deploy`

- [ ] **Step 5: Commit**

`git commit -m "feat: cria fluxo de solicitação CKF"`

---

### Task 4: Abrir WhatsApp somente depois de persistir

**Files:**
- Modify: `src/whatsapp.js`
- Modify: `src/tickets/TicketRequestForm.jsx`
- Modify: `tests/whatsapp-links.test.mjs`
- Create: `tests/ticket-success.test.mjs`

**Interfaces:**
- Produces: `buildTicketWhatsAppMessage({ publicId, service, equipment, description, urgency })`.

- [ ] **Step 1: Write failing tests**

A mensagem deve conter `Solicitação CKF #<publicId>` e contexto sem e-mail ou dados desnecessários.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement message + success flow**

Após HTTP 201, exibir publicId e então abrir WhatsApp. Se popup for bloqueado, renderizar botão explícito `Continuar no WhatsApp` sem perder o ticket.

- [ ] **Step 4: Run GREEN**

`npm run check:deploy`

- [ ] **Step 5: Commit**

`git commit -m "feat: conecta solicitação persistida ao WhatsApp"`

---

### Task 5: Integrar CTAs sem remover rota rápida

**Files:**
- Modify: `src/App.jsx`
- Modify: `scripts/prepare-sites-build.mjs`
- Test: `tests/ticket-cta-integration.test.mjs`

**Interfaces:**
- CTAs principais abrem Solicitação com `service_slug` e `cta_source`.
- WhatsApp direto permanece em links secundários identificados.

- [ ] **Step 1: Write failing tests**

Exigir CTA de solicitação na hero, contato e páginas de serviço, mantendo pelo menos um `WhatsApp direto` acessível.

- [ ] **Step 2: Run RED**

`npm run test:unit`

- [ ] **Step 3: Implement integration**

Páginas estáticas recebem link/trigger para o fluxo sem depender de conteúdo invisível para SEO.

- [ ] **Step 4: Verify production build**

`npm run security:audit && npm run check:deploy`

- [ ] **Step 5: Preview verification**

Validar desktop/mobile, erro de rede, reenvio e popup bloqueado antes do merge.
