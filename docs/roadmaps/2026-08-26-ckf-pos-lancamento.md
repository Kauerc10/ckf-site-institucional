# CKF Manutenção — Roadmap pós-lançamento

**Data:** 26/08/2026  
**Status:** aguardando domínio definitivo para iniciar a etapa externa de aquisição  
**Site atual:** `https://ckf-home.vercel.app`

Este documento registra o plano operacional para transformar o site institucional da CKF em uma operação mensurável de aquisição, atendimento e conversão. O domínio próprio foi deliberadamente adiado; até sua contratação, o canonical permanece no domínio canônico da Vercel e não deve ser alterado.

## Princípios

- Não enviar tráfego pago relevante antes de termos mensuração e operação interna de Solicitações.
- Não alterar canonical, sitemap ou schemas para um domínio próprio antes de ele estar registrado, conectado e com HTTPS válido.
- Manter **Solicitação** como linguagem pública; `Ticket` permanece vocabulário interno.
- Nunca enviar PII para analytics. Nome, telefone, e-mail e descrição do problema pertencem ao fluxo operacional, não aos eventos de marketing.
- Preservar Core Web Vitals e acessibilidade ao adicionar trackers, animações ou novas integrações.

## Fase 1 — Domínio definitivo

> **Aguardando decisão/registro do domínio.**

1. Registrar o domínio definitivo, preferencialmente em ASCII, por exemplo `ckfmanutencao.com.br`.
2. Adicionar o domínio ao projeto `ckf-home` na Vercel.
3. Configurar os registros DNS indicados pela Vercel.
4. Confirmar HTTPS/SSL válido e resolução de `www` conforme estratégia escolhida.
5. Definir uma única origem canônica e redirecionar variantes para ela.
6. Atualizar `SITE_URL` no site somente depois do domínio estar operacional.
7. Rebuildar e confirmar que canonical, Open Graph, JSON-LD, robots e sitemap apontam para o domínio definitivo.
8. Preservar o alias `ckf-home.vercel.app` apenas como origem técnica/redirecionamento, sem competição de canonical.

### Gate de conclusão

- domínio resolve por HTTPS;
- canonical da home e das 10 páginas de serviço aponta para o domínio definitivo;
- sitemap contém somente URLs canônicas;
- aliases antigos redirecionam corretamente;
- Solicitação continua funcionando na nova origem e a allowlist CORS é atualizada explicitamente.

## Fase 2 — Operação interna de Solicitações

Construir no sistema CKF Orçamentos o módulo interno **Tickets**, consumindo `site_tickets` com acesso autenticado e sem expor a tabela ao site público.

### Visões

- Novos
- Contatados
- Qualificados
- Orçamento criado
- Convertidos
- Perdidos
- Spam, quando necessário

### Informações por Ticket

- `Solicitação CKF #XXXXXX`
- serviço e categoria
- equipamento, marca e modelo
- urgência
- nome e contato
- cidade/UF
- empresa/e-mail quando informados
- descrição do cenário
- landing page e CTA de origem
- referrer
- UTMs
- data/hora
- vínculo com cliente e orçamento quando houver conversão

### Ações

- abrir WhatsApp;
- marcar como contatado;
- qualificar;
- criar/vincular cliente;
- criar/vincular orçamento;
- marcar convertido/perdido;
- manter trilha mínima de status e timestamps.

### Funil operacional alvo

`Visitante → Solicitação → Ticket interno → Cliente → Orçamento → Conversão`

## Fase 3 — Analytics e observabilidade

O adapter do site já deve continuar como camada central para não acoplar o produto a um único fornecedor.

### Eventos públicos aprovados

- `service_view`
- `ticket_form_open`
- `ticket_step_complete`
- `ticket_submit`
- `ticket_success`
- `ticket_error`
- `ticket_close`
- `whatsapp_click`

### Propriedades permitidas

Somente contexto sem PII, como:

- página;
- `serviceSlug`;
- `ctaSource`;
- etapa;
- status.

### Métricas principais

- visitantes;
- visualização de serviços;
- abertura da Solicitação;
- conclusão por etapa;
- submit;
- sucesso;
- fechamento/abandono;
- clique no WhatsApp;
- taxa de conclusão do formulário;
- taxa de conversão do site.

### Observabilidade

Ativar medição de Core Web Vitals e acompanhar principalmente LCP, INP e CLS antes e depois de alterações de UI, mídia ou trackers.

## Fase 4 — Google Search Console

Executar somente depois do domínio definitivo estar conectado.

1. Criar propriedade do domínio no Search Console.
2. Validar por DNS.
3. Enviar `/sitemap.xml`.
4. Inspecionar e solicitar indexação inicial de:
   - home;
   - `/servicos`;
   - manutenção de caminhões;
   - central de concreto;
   - reforma de chassis;
   - manutenção de máquinas pesadas;
   - manutenção industrial;
   - demais páginas comerciais.
5. Monitorar cobertura/indexação, consultas, impressões, posição e CTR.
6. Criar novas páginas somente com base em intenção comercial real e dados de busca, evitando conteúdo artificial.

## Fase 5 — Google Business Profile

Alinhar nome, endereço e telefone com o site.

### NAP de referência atual

**CKF Manutenção**  
Rodovia BR-101, 6780  
Galpão 01, Sala 01 — Espinheiros  
Itajaí/SC — 88317-000

Adicionar:

- telefone principal consistente;
- domínio definitivo;
- categorias adequadas;
- descrição comercial;
- serviços;
- horário correto;
- fotos reais da unidade, equipe e trabalhos;
- estratégia contínua de avaliações legítimas.

## Fase 6 — Modelo de UTMs

Padronizar antes da primeira campanha.

### Google Ads

```text
utm_source=google
utm_medium=cpc
utm_campaign=manutencao_pesada_itajai
utm_content=<criativo-ou-grupo>
```

### Meta Ads

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=manutencao_pesada_itajai
utm_content=<criativo>
```

Evitar nomes improvisados. Campanhas devem usar convenção estável para possibilitar comparação entre Solicitação, orçamento e venda.

## Fase 7 — Conversões e economia do funil

Distinguir eventos:

- `ticket_success` = Solicitação registrada;
- orçamento criado = oportunidade comercial;
- convertido = cliente/venda.

### Indicadores

- custo por Solicitação;
- custo por orçamento;
- taxa Solicitação → orçamento;
- taxa orçamento → cliente;
- CAC;
- receita atribuída quando houver dado confiável.

Não otimizar campanha apenas para clique ou WhatsApp se a qualidade comercial puder ser medida mais abaixo no funil.

## Fase 8 — Mídia paga

Começar com orçamento pequeno somente após as fases de mensuração e operação estarem prontas.

Prioridades iniciais:

1. Google Search para intenção direta de manutenção em Itajaí e região;
2. páginas específicas como destino, não apenas a home;
3. Meta para prova visual/cases e remarketing somente quando privacidade e consentimento aplicáveis estiverem configurados;
4. acompanhar qualidade dos Tickets, não apenas quantidade.

## Fase 9 — CRO e testes

Coletar baseline antes de testar mudanças.

Possíveis experimentos futuros:

- texto do hero;
- CTA `Solicitar orçamento` vs alternativas orientadas ao problema;
- ordem dos campos;
- 3 etapas vs fluxo reduzido;
- prova social/cases;
- CTA contextual por serviço;
- sticky CTA mobile.

Critério de sucesso deve priorizar `ticket_success` e conversões posteriores, não preferência estética.

## Fase 10 — Conteúdo e SEO contínuo

Usar Search Console, Tickets e perguntas reais dos clientes para priorizar:

- novas páginas de serviço;
- FAQs contextuais;
- cases antes/depois;
- páginas por equipamento/problema quando houver volume e relevância;
- melhorias nas páginas que já recebem impressões mas apresentam CTR ou posição fracos.

## Ordem resumida de retomada

1. Registrar domínio.
2. Conectar domínio à Vercel.
3. Atualizar canonical/sitemap/schemas e CORS da nova origem.
4. Fechar módulo interno Tickets.
5. Ativar analytics e Core Web Vitals.
6. Search Console.
7. Google Business Profile.
8. Padronizar UTMs.
9. Rodar campanha piloto.
10. Coletar dados e iniciar CRO/SEO baseado em evidência.

## Fora de escopo por enquanto

- compra imediata do domínio;
- troca antecipada de canonical;
- pixels de remarketing sem análise de privacidade;
- A/B tests sem volume suficiente;
- expansão de CORS para URLs aleatórias de preview da Vercel.
