# CKF Exact Maps Link Design

## Contexto

A home hoje usa uma URL de pesquisa do Google Maps baseada no endereço textual da unidade:

```text
https://www.google.com/maps/search/?api=1&query=Rodovia%20BR-101%2C%206780%2C%20Galp%C3%A3o%2001%20Sala%2001%2C%20Espinheiros%2C%20Itaja%C3%AD%20-%20SC%2C%2088317-000
```

Esse formato deixa o Google resolver o destino por texto. Como o número `6780` concentra vários galpões e empresas, o Maps pode mostrar resultados parciais ou selecionar um ponto diferente da ficha oficial da CKF.

O link de compartilhamento da ficha correta, fornecido a partir do perfil da CKF no Google Maps, será a fonte de verdade desta implementação:

```text
https://maps.app.goo.gl/WTSkh222vowLHtQi7
```

## Objetivo

Fazer o CTA de localização da home levar o visitante à ficha exata da **CKF Manutenção**, sem depender de busca textual por endereço, mantendo comportamento útil em Android, iPhone e desktop.

## Decisão de arquitetura

Usar diretamente o link universal de compartilhamento `maps.app.goo.gl` da ficha da CKF.

Não haverá detecção de sistema operacional, user-agent, app instalado ou esquema proprietário como `geo:`, `comgooglemaps://` ou `maps://`. O navegador continua responsável por entregar o link ao Google Maps nativo quando a plataforma suportar esse handoff ou ao Google Maps Web quando não suportar.

Essa abordagem é intencionalmente simples: o destino fica vinculado à ficha correta sem introduzir código específico por plataforma, dependências novas ou uma cadeia de fallbacks difícil de testar.

## Experiência do usuário

### CTA

Trocar o texto atual:

```text
Abrir rota no Maps
```

por:

```text
Como chegar à CKF
```

O CTA continua abrindo em nova aba/janela com `target="_blank"` e `rel="noreferrer"`.

### Android

Critério de sucesso: o clique resolve a ficha **CKF Manutenção** no Google Maps, preferencialmente no app quando o sistema fizer o handoff; caso contrário, no Maps Web. Não pode cair em pesquisa genérica por `BR-101, 6780` nem mostrar `Resultados parciais` como destino principal.

### iPhone / iOS

Critério de sucesso: o mesmo link resolve a ficha **CKF Manutenção**. Se o Google Maps estiver disponível e o iOS decidir abrir o Universal Link no app, o usuário segue no aplicativo. Caso contrário, o navegador continua funcional e mostra o destino no Google Maps Web.

Não é requisito forçar abertura no Google Maps nativo, porque esse comportamento depende das preferências e do estado do dispositivo.

### Desktop

O link deve abrir a ficha exata da CKF no Google Maps Web em uma nova aba.

## Analytics

Registrar o clique com o evento:

```text
maps_directions_click
```

Propriedades:

```js
{
  page: pagePath(),
  ctaSource: 'location',
}
```

Essas propriedades já pertencem à allowlist de `src/analytics.js`, portanto a mudança não exige ampliar o schema de analytics.

O tracking não deve bloquear a navegação. Como o link abre com `target="_blank"`, `trackEvent` é suficiente; não é necessário introduzir espera artificial antes do redirecionamento.

## Acessibilidade

- Manter texto de CTA descritivo e visível.
- O ícone de mapa continua decorativo e deve permanecer oculto da árvore acessível com `aria-hidden="true"` se houver ajuste no JSX.
- Não adicionar detecção de toque, hover obrigatório ou comportamento diferente para teclado.

## Testes

Adicionar regressão em `tests/conversion-ux.test.mjs` para exigir:

1. A constante `MAPS` apontando exatamente para `https://maps.app.goo.gl/WTSkh222vowLHtQi7`.
2. Ausência do padrão legado `google.com/maps/search/?api=1&query=` na home.
3. CTA com `href={MAPS}`, `target="_blank"`, `rel="noreferrer"` e texto `Como chegar à CKF`.
4. Handler de clique registrando `maps_directions_click` com `ctaSource:'location'`.

A validação final continua sendo `npm run check:deploy`, seguida de QA manual no preview em desktop e mobile.

## Não objetivos

- Não adicionar Apple Maps ou Waze nesta entrega.
- Não extrair ou persistir coordenadas manualmente.
- Não buscar ou manter um Place ID separado.
- Não alterar o endereço textual exibido no site.
- Não mudar a seção visual de localização além do texto do CTA.
- Não adicionar dependências.

## Critérios de aceite

- O botão de localização não usa mais pesquisa textual por endereço.
- O destino configurado é o link exato da ficha CKF fornecido pelo perfil do Google Maps.
- Android, iOS e desktop continuam com caminho funcional sem código específico por plataforma.
- O clique é rastreado sem interromper a navegação.
- A suíte de regressão e `npm run check:deploy` ficam verdes.
- QA do preview confirma que o destino exibido é **CKF Manutenção**, sem resultado parcial pelo endereço.