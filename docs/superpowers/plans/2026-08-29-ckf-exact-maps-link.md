# CKF Exact Maps Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir a busca textual e ambígua do Google Maps por um link exato da ficha da CKF, com tracking de clique e comportamento funcional em Android, iPhone e desktop.

**Architecture:** A home continuará com uma única constante de destino em `src/App.jsx`, mas ela passará a usar o link universal compartilhado da ficha oficial da CKF (`maps.app.goo.gl`). O CTA continuará abrindo em nova aba e registrará um evento pelo analytics já existente, sem detecção de plataforma, Place ID separado, novas dependências ou deep links proprietários.

**Tech Stack:** React 19, Vite 6, Node.js 24.x, Node test runner, analytics próprio da CKF, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-29-ckf-exact-maps-link-design.md`

## Global Constraints

- Usar como fonte de verdade exatamente `https://maps.app.goo.gl/WTSkh222vowLHtQi7`.
- Remover o uso da busca legada `google.com/maps/search/?api=1&query=` para o CTA da unidade.
- Não usar `geo:`, `comgooglemaps://`, `maps://`, user-agent sniffing ou detecção de app instalado.
- Não adicionar Apple Maps, Waze, Place ID separado, coordenadas manuais ou dependências novas nesta entrega.
- Manter o endereço textual atual da unidade sem alteração.
- Manter `target="_blank"` e `rel="noreferrer"` no link externo.
- Registrar `maps_directions_click` com `page` e `ctaSource:'location'` usando o analytics existente.
- Toda mudança de comportamento deve seguir RED → GREEN.
- Antes do merge, executar `npm run check:deploy` e validar o preview em desktop e mobile.

---

### Task 1: Proteger o destino exato e o CTA com regressão

**Files:**
- Modify: `tests/conversion-ux.test.mjs`

**Interfaces:**
- Consumes: conteúdo estático de `src/App.jsx` já carregado pela suíte como `app`.
- Produces: contrato de regressão que exige o link oficial da ficha, remove a busca textual e protege copy, atributos externos e tracking do CTA.

- [ ] **Step 1: Write the failing tests**

Adicionar ao final de `tests/conversion-ux.test.mjs`:

```js
test('localização usa a ficha exata da CKF em vez de busca textual por endereço', () => {
  assert.match(app, /const MAPS = 'https:\/\/maps\.app\.goo\.gl\/WTSkh222vowLHtQi7'/)
  assert.doesNotMatch(app, /google\.com\/maps\/search\/\?api=1&query=/)
})

test('CTA de localização abre a CKF em nova aba e registra o clique', () => {
  const locationLink = app.match(/<a className="button" href=\{MAPS\}[\s\S]*?<\/a>/)?.[0] ?? ''

  assert.notEqual(locationLink, '')
  assert.match(locationLink, /target="_blank"/)
  assert.match(locationLink, /rel="noreferrer"/)
  assert.match(locationLink, /onClick=\{trackMapsDirections\}/)
  assert.match(locationLink, /Como chegar à CKF/)

  assert.match(app, /const trackMapsDirections = \(\) => trackEvent\('maps_directions_click', \{ page: pagePath\(\), ctaSource:'location' \}\)/)
})
```

- [ ] **Step 2: Run the focused test to confirm RED**

Run:

```bash
npm run build && node --test tests/conversion-ux.test.mjs
```

Expected: FAIL apenas nos novos contratos porque `MAPS` ainda usa `/maps/search/?api=1&query=...`, não existe `trackMapsDirections` e o CTA ainda diz `Abrir rota no Maps`.

- [ ] **Step 3: Confirm failures are behavior-specific**

Verificar no output que a suíte existente permanece verde e que as falhas novas mencionam o link exato, o handler ou a copy do CTA. Se houver falha anterior não relacionada, parar e investigar antes de tocar na implementação.

- [ ] **Step 4: Commit RED**

```bash
git add tests/conversion-ux.test.mjs
git commit -m "test: protege destino exato da CKF no Maps"
```

---

### Task 2: Trocar o destino e integrar analytics sem bloquear a navegação

**Files:**
- Modify: `src/App.jsx`
- Test: `tests/conversion-ux.test.mjs`

**Interfaces:**
- Consumes: `trackEvent`, `pagePath()` e a constante `MAPS` já existentes na home.
- Produces: `MAPS` apontando para a ficha oficial e `trackMapsDirections()` registrando `maps_directions_click` com `ctaSource:'location'`.

- [ ] **Step 1: Replace the ambiguous Maps URL**

Em `src/App.jsx`, substituir:

```js
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Rodovia%20BR-101%2C%206780%2C%20Galp%C3%A3o%2001%20Sala%2001%2C%20Espinheiros%2C%20Itaja%C3%AD%20-%20SC%2C%2088317-000'
```

por:

```js
const MAPS = 'https://maps.app.goo.gl/WTSkh222vowLHtQi7'
```

- [ ] **Step 2: Add the location analytics handler**

Logo após `trackWhatsApp`, adicionar:

```js
const trackMapsDirections = () => trackEvent('maps_directions_click', {
  page: pagePath(),
  ctaSource: 'location',
})
```

Não usar `trackEventAndWait`: o link abre com `target="_blank"`, então o evento pode ser emitido sem atrasar ou interceptar a navegação.

- [ ] **Step 3: Update the CTA**

Na seção `#localizacao`, substituir o link atual por:

```jsx
<a
  className="button"
  href={MAPS}
  target="_blank"
  rel="noreferrer"
  onClick={trackMapsDirections}
>
  <FaMapLocationDot aria-hidden="true" />
  Como chegar à CKF
</a>
```

Preservar o restante da seção, inclusive foto, endereço textual e layout.

- [ ] **Step 4: Run focused GREEN verification**

Run:

```bash
npm run build && node --test tests/conversion-ux.test.mjs
```

Expected: PASS, incluindo os dois contratos adicionados na Task 1.

- [ ] **Step 5: Run the mandatory project gate**

Run:

```bash
npm run check:deploy
```

Expected: PASS no build, testes do worker e validações da Vercel.

- [ ] **Step 6: Run security validation**

Se o script existir no `package.json`, run:

```bash
npm run security:audit
```

Expected: PASS. Se o script não existir, registrar explicitamente no PR que `npm run check:deploy` foi o gate de segurança/configuração disponível para esta mudança.

- [ ] **Step 7: Commit GREEN**

```bash
git add src/App.jsx tests/conversion-ux.test.mjs
git commit -m "fix: abre localização exata da CKF no Maps"
```

---

### Task 3: Validar o comportamento cross-platform no preview

**Files:**
- No production file unless QA proves a defect.
- Update only if QA discovers a regression: `src/App.jsx` and/or `tests/conversion-ux.test.mjs`.

**Interfaces:**
- Consumes: Vercel preview da branch de implementação.
- Produces: evidência de que o CTA resolve a ficha correta da CKF sem depender de busca textual e continua utilizável nas plataformas alvo.

- [ ] **Step 1: Open the location section in the preview**

Navegar até `#localizacao` e confirmar visualmente:

```text
Como chegar à CKF
```

O endereço exibido deve continuar:

```text
Rodovia BR-101, 6780
Galpão 01, Sala 01 · Espinheiros
Itajaí · SC · 88317-000
```

- [ ] **Step 2: Desktop validation**

Em Chrome ou navegador equivalente no desktop:

1. clicar em `Como chegar à CKF`;
2. confirmar abertura em nova aba;
3. confirmar que o destino resolvido é **CKF Manutenção**;
4. confirmar que a experiência não cai em uma página de `Resultados parciais` baseada apenas em `BR-101, 6780`.

- [ ] **Step 3: Android validation**

Em Android:

1. abrir o preview no Chrome;
2. tocar em `Como chegar à CKF`;
3. aceitar o handoff para Google Maps se o sistema oferecer;
4. confirmar que o destino exibido é **CKF Manutenção**;
5. se o handoff não acontecer, confirmar que o Maps Web continua resolvendo a ficha correta.

O critério é o destino correto; não forçar o app nativo.

- [ ] **Step 4: iPhone / iOS validation**

Em Safari no iPhone:

1. tocar em `Como chegar à CKF`;
2. confirmar que o link resolve a ficha **CKF Manutenção**;
3. se o Google Maps estiver instalado e o iOS abrir o app, confirmar o mesmo destino;
4. se permanecer no navegador, confirmar que o Google Maps Web continua funcional.

Não considerar falha o iOS optar pelo navegador. Falha é cair em busca genérica ou em outro estabelecimento.

- [ ] **Step 5: Verify analytics dispatch**

No preview desktop, abrir DevTools e registrar temporariamente um listener no console:

```js
window.addEventListener('ckf:analytics', (event) => console.log(event.detail))
```

Clicar em `Como chegar à CKF` e confirmar uma emissão equivalente a:

```js
{
  name: 'maps_directions_click',
  properties: {
    page: '/',
    ctaSource: 'location',
  },
}
```

- [ ] **Step 6: Final regression gate**

Run novamente na HEAD que será enviada para revisão:

```bash
npm run check:deploy
```

Expected: PASS.

- [ ] **Step 7: Open the implementation PR**

Título sugerido:

```text
fix: abre localização exata da CKF no Maps
```

Descrição sugerida:

```md
## Objetivo

Fazer o CTA de localização abrir a ficha correta da CKF no Google Maps, evitando a busca genérica pelo endereço da BR-101 que podia retornar resultados parciais.

## Alterações

- Troquei a busca textual pelo link oficial compartilhado da ficha CKF Manutenção.
- Mantive um único link universal para Android, iPhone e desktop, sem detecção específica de plataforma.
- Ajustei o CTA para “Como chegar à CKF”.
- Adicionei tracking de `maps_directions_click` e testes de regressão para proteger o destino correto.

## Validação

- [x] Executei `npm run check:deploy`
- [x] Validei o destino no preview em desktop e mobile
- [x] Confirmei que o link resolve “CKF Manutenção” e não uma busca parcial pelo endereço
- [x] Não incluí credenciais, dados pessoais ou dependências novas

## Impacto visual ou operacional

O impacto visual é mínimo, limitado ao texto do CTA de localização. Operacionalmente, o clique passa a abrir a ficha correta da CKF no Google Maps, reduzindo o risco de o cliente navegar para um resultado ambíguo.
```

- [ ] **Step 8: Merge gate**

Fazer merge apenas quando:

- CI estiver verde;
- verificações de segurança/configuração estiverem verdes;
- preview estiver publicado;
- desktop, Android e iPhone/iOS tiverem sido conferidos conforme os critérios acima.
