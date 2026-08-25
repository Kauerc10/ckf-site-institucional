# CKF Ticket Engine + SEO Industrial

Data: 2026-08-25
Status: aprovado para planejamento

## 1. Objetivo

Transformar o site institucional da CKF em uma plataforma de aquisição orgânica e comercial que:

1. seja altamente indexável para buscas de intenção comercial relacionadas a manutenção pesada, centrais de concreto, estruturas metálicas, solda, hidráulica, reformas e serviços correlatos realmente prestados pela CKF;
2. capture uma solicitação estruturada antes de encaminhar o visitante ao WhatsApp;
3. preserve contexto comercial e de aquisição para futura integração com o CKF Orçamentos;
4. mantenha o site rápido, estático sempre que possível, seguro e simples para o cliente;
5. evite linguagem de CRM na experiência pública.

## 2. Terminologia oficial

A palavra `lead` não deve aparecer na interface, nos eventos, nas APIs próprias nem no banco desse fluxo.

Nomenclatura:

- público: **Solicitação**;
- identificador público: **Solicitação CKF #XXXXXX**;
- operação interna: **Ticket**;
- entidade técnica: `site_ticket` / `site_tickets`;
- endpoint/função: `capture-site-ticket`;
- eventos: prefixo `ticket_`;
- integração futura no CKF Orçamentos: módulo **Tickets**.

## 3. Arquitetura geral

Fluxo principal:

`Google / campanha / acesso direto -> página de serviço -> CTA -> formulário curto -> capture-site-ticket -> persistência -> retorno do ticket público -> abertura do WhatsApp com contexto -> futura conversão em cliente/orçamento`

Princípios:

- captura acontece antes da saída para WhatsApp;
- nenhuma chave privilegiada fica no frontend;
- o site não recebe acesso direto às tabelas internas do CKF Orçamentos;
- tickets são uma entidade separada de clientes e orçamentos;
- transformar um ticket em cliente/orçamento será uma ação posterior e explícita;
- SEO e captura compartilham a mesma taxonomia pública de serviços;
- o banco e a Edge Function pertencem ao repositório que já é fonte de verdade do Supabase operacional.

## 4. Experiência de solicitação

### 4.1 Entrada

CTAs de maior intenção, como `Solicitar orçamento`, abrem o fluxo de solicitação.

Atalhos secundários de WhatsApp podem continuar existindo em pontos específicos para não adicionar fricção desnecessária a quem já decidiu falar diretamente.

### 4.2 Etapas

O formulário deve ser curto, mobile-first e dividido em até três etapas.

#### Etapa 1: necessidade

- serviço, pré-preenchido quando o visitante veio de uma página específica;
- tipo de equipamento;
- marca/modelo opcionais;
- problema ou necessidade;
- urgência.

#### Etapa 2: contato

- nome;
- WhatsApp;
- empresa opcional;
- e-mail opcional;
- cidade;
- UF.

#### Etapa 3: confirmação

- resumo curto;
- explicação sobre uso dos dados para atendimento e orçamento;
- botão principal `Enviar solicitação e abrir WhatsApp`.

Não solicitar CPF, CNPJ, endereço completo, CEP ou outros dados cadastrais que não sejam necessários neste estágio.

### 4.3 Sucesso

Após persistir o ticket:

1. backend devolve `public_id`;
2. interface exibe `Solicitação CKF #<public_id>`;
3. WhatsApp abre com uma mensagem contextual contendo identificador, serviço, equipamento, problema e urgência;
4. o identificador permite localizar rapidamente o registro no futuro módulo Tickets.

O `public_id` deve ser aleatório, curto, não sequencial e separado do UUID interno. Exemplo visual: `CKF-7K4M2Q`.

## 5. Modelo de dados

Tabela proposta: `public.site_tickets`.

Campos principais:

- `id uuid primary key`;
- `public_id text unique not null`;
- `status text not null`;
- `service_category text not null`;
- `service_slug text not null`;
- `service_name text not null`;
- `equipment_type text not null default ''`;
- `equipment_brand text not null default ''`;
- `equipment_model text not null default ''`;
- `company_name text not null default ''`;
- `contact_name text not null`;
- `phone text not null`;
- `email text not null default ''`;
- `city text not null default ''`;
- `uf text not null default ''`;
- `description text not null`;
- `urgency text not null`;
- `landing_path text not null default ''`;
- `cta_source text not null default ''`;
- `referrer text not null default ''`;
- `utm_source text not null default ''`;
- `utm_medium text not null default ''`;
- `utm_campaign text not null default ''`;
- `utm_term text not null default ''`;
- `utm_content text not null default ''`;
- `idempotency_key text unique`;
- `converted_cliente_id uuid null`;
- `converted_orcamento_id uuid null`;
- `created_at timestamptz not null default now()`;
- `updated_at timestamptz not null default now()`.

Categorias estáveis iniciais:

- `heavy_machinery`;
- `trucks`;
- `concrete_plant`;
- `industrial_maintenance`;
- `metal_structures`;
- `industrial_welding`;
- `hydraulics`;
- `chassis`;
- `preventive`;
- `corrective`;
- `other`.

A categoria é o contrato estável validado pelo backend. `service_slug` e `service_name` preservam a intenção específica da landing page sem obrigar uma atualização da Edge Function a cada nova página SEO.

Status iniciais:

- `new`;
- `contacted`;
- `qualified`;
- `budget_created`;
- `converted`;
- `lost`;
- `spam`.

O site público não controla os status operacionais após a criação.

## 6. Segurança do Ticket Engine

### 6.1 Escrita

O navegador não poderá inserir diretamente em `site_tickets`.

A escrita pública passa exclusivamente pela Edge Function `capture-site-ticket` hospedada no mesmo projeto Supabase operacional do CKF Orçamentos.

### 6.2 Validação server-side

A função deve:

- aceitar apenas origens CKF autorizadas;
- validar comprimento e formato de todos os campos;
- normalizar telefone;
- validar `service_category` contra enum estável;
- normalizar e limitar `service_slug` e `service_name`;
- rejeitar campos inesperados sensíveis;
- aplicar idempotência;
- validar honeypot;
- aplicar rate limit sem persistir IP bruto como dado operacional;
- limitar tamanho do payload;
- registrar apenas contexto necessário;
- nunca devolver o UUID interno.

### 6.3 RLS e grants

- `anon`: sem SELECT/INSERT/UPDATE/DELETE na tabela;
- `authenticated`: acesso definido pelas políticas do sistema interno;
- `service_role`: somente dentro de ambiente servidor controlado;
- nenhuma credencial secreta será exposta por `VITE_*`.

## 7. Contrato de integração com CKF Orçamentos

A infraestrutura de dados do Ticket Engine nasce no repositório `ckf-manutencao-orcamentos`, porque esse repositório já versiona as migrações e Edge Functions do Supabase operacional.

A primeira etapa de backend cria somente:

- migração de `site_tickets`;
- índices e constraints;
- políticas/grants;
- Edge Function `capture-site-ticket`;
- testes do contrato público.

Ela **não** cria ainda a interface interna de Tickets e não altera automaticamente `clientes` ou `orcamentos`.

Integração operacional futura:

`Ticket -> revisar -> localizar cliente existente ou criar cliente -> criar orçamento -> vincular converted_cliente_id e converted_orcamento_id`

O módulo futuro deve oferecer:

- fila de tickets;
- filtros por status, serviço, cidade, origem e data;
- detalhes completos;
- botão `Transformar em cliente`;
- botão `Criar orçamento`;
- preservação do contexto de origem;
- histórico de mudança de status;
- vínculo com cliente/orçamento sem duplicar dados desnecessariamente.

A tabela `clientes` atual continua sendo cadastro operacional. Ticket não é cliente.

## 8. Catálogo canônico de serviços

O site deve ter uma fonte de verdade única para:

- slug;
- nome comercial;
- categoria estável;
- descrição;
- CTA;
- termos relacionados;
- tipos de equipamento;
- serviços relacionados;
- imagem principal;
- schema estruturado;
- dados usados no ticket.

Esse catálogo alimentará home, hub `/servicos`, páginas estáticas, sitemap, links internos e formulário.

O backend confia apenas na categoria estável e trata `service_slug`/`service_name` como dados normalizados do contexto público, não como autorização.

## 9. Arquitetura SEO

### 9.1 Hub

Criar `/servicos` como página de navegação temática e distribuição de autoridade interna.

### 9.2 Páginas principais

Primeiro cluster recomendado, condicionado a serviços realmente prestados pela CKF:

- `/servicos/manutencao-maquinas-pesadas`;
- `/servicos/manutencao-caminhoes`;
- `/servicos/central-concreto`;
- `/servicos/manutencao-industrial`;
- `/servicos/estruturas-metalicas`;
- `/servicos/solda-industrial`;
- `/servicos/hidraulica-maquinas-pesadas`;
- `/servicos/reforma-chassis`;
- `/servicos/manutencao-preventiva`;
- `/servicos/manutencao-corretiva`.

Novas páginas somente entram se houver serviço real, intenção de busca distinta e conteúdo próprio suficiente.

### 9.3 Conteúdo mínimo por página

Cada página deve incluir, de forma específica:

- título/H1 orientado à intenção;
- explicação direta do problema;
- equipamentos atendidos quando aplicável;
- frentes de serviço;
- sinais/falhas comuns quando úteis;
- processo de atendimento;
- área atendida sem criar páginas duplicadas por município;
- fotos reais relevantes;
- CTA contextual;
- serviços relacionados;
- FAQ somente quando houver perguntas úteis e respostas reais;
- breadcrumbs.

Não criar páginas doorway ou conteúdo em escala que apenas troque cidade/palavra-chave.

## 10. SEO técnico

O build deve preservar e ampliar:

- HTML estático/indexável;
- canonical absoluto;
- `robots.txt`;
- `sitemap.xml`;
- Open Graph/Twitter;
- breadcrumbs;
- dados estruturados consistentes;
- links internos rastreáveis em HTML;
- páginas 404 corretas;
- manifest/favicons;
- headings semânticos;
- alt text útil;
- largura/altura quando possível para reduzir CLS.

### 10.1 Structured data

Home:

- `Organization` e/ou tipo local adequado;
- NAP consistente;
- catálogo de serviços.

Serviços:

- `Service`;
- `BreadcrumbList`;
- provider apontando para CKF.

Não adicionar markup que não corresponda a conteúdo visível ou fatos verificáveis.

## 11. Domínio e indexação

O domínio recomendado é `ckfmanutencao.com.br`.

Antes da indexação deliberada das novas páginas:

1. registrar e conectar o domínio;
2. alterar `SITE_URL` para o domínio definitivo;
3. redirecionar aliases para a URL canônica;
4. validar HTTPS;
5. publicar sitemap definitivo;
6. configurar Search Console;
7. cadastrar sitemap;
8. validar Google Business Profile/NAP.

Não iniciar uma campanha de indexação usando a URL temporária `ckf-home.vercel.app` como destino definitivo.

## 12. Analytics e atribuição

A aplicação deve expor uma interface própria de eventos, desacoplada do provedor.

Eventos mínimos:

- `service_view`;
- `ticket_form_open`;
- `ticket_step_complete`;
- `ticket_submit`;
- `ticket_success`;
- `ticket_error`;
- `whatsapp_click`.

Contexto quando aplicável:

- `service_category`;
- `service_slug`;
- `landing_path`;
- `cta_source`;
- origem/UTM;
- `ticket_public_id` apenas após sucesso.

Não registrar descrição livre, telefone, e-mail ou nome em analytics.

## 13. Privacidade e retenção

Criar página `/privacidade` antes do lançamento do formulário público.

A interface deve explicar, em linguagem simples, que os dados informados serão usados para responder à solicitação e preparar atendimento/orçamento.

Evitar consentimentos genéricos de marketing quando a finalidade é somente responder ao pedido do usuário.

Política técnica inicial de retenção:

- tickets marcados como `spam`: exclusão automática após 30 dias;
- tickets `lost` sem vínculo comercial: exclusão após 180 dias;
- tickets `converted`: permanecem vinculados ao registro comercial correspondente e seguem a política operacional do sistema interno.

Nenhum IP bruto deve fazer parte do registro permanente do ticket.

## 14. UX e conversão

Princípios:

- mobile-first;
- formulário curto;
- progresso visível sem exagero;
- defaults derivados da página de origem;
- campo livre só onde agrega contexto;
- nunca bloquear WhatsApp por erro não crítico do analytics;
- mensagens de erro específicas e recuperáveis;
- acessibilidade de teclado e leitor de tela;
- estado de sucesso inequívoco;
- nenhuma linguagem `lead` visível.

## 15. Estratégia de páginas e links internos

Home:

- cards principais direcionam para páginas de serviço;
- CTAs comerciais continuam disponíveis;
- serviços relacionados formam uma malha interna.

Página de serviço:

- link para hub `/servicos`;
- links para 2 a 4 serviços semanticamente relacionados;
- CTA abre formulário já qualificado;
- WhatsApp direto continua disponível como alternativa.

Hub:

- organiza serviços por famílias;
- não deve ser uma grade sem contexto;
- apresenta diferenças entre categorias e orienta o visitante.

## 16. Performance

Metas:

- LCP abaixo de 2,5 s em condições razoáveis de mobile;
- CLS abaixo de 0,1;
- INP abaixo de 200 ms;
- evitar JavaScript para conteúdo que pode ser HTML estático;
- lazy-load fora da primeira dobra;
- preload somente de recursos críticos;
- manter budget automatizado de assets;
- não duplicar bundles por landing page se HTML/CSS estático resolver.

## 17. Testes obrigatórios

Cada PR funcional seguirá RED -> GREEN.

Cobertura mínima:

- catálogo de serviços;
- geração das páginas;
- links internos;
- sitemap;
- canonical/schema;
- serialização/validação de ticket;
- normalização de campos;
- geração e unicidade de `public_id`;
- idempotência;
- honeypot;
- falha de rede;
- sucesso + construção do WhatsApp;
- ausência de PII nos eventos analytics;
- acessibilidade básica do formulário;
- budget de assets;
- `npm audit` e gates existentes.

## 18. Divisão de responsabilidades entre repositórios

### ckf-site-institucional

Responsável por:

- páginas públicas;
- SEO;
- catálogo público;
- formulário;
- cliente HTTP de `capture-site-ticket`;
- experiência de sucesso/WhatsApp;
- analytics público;
- privacidade pública.

O site não contém migração da tabela operacional nem credencial privilegiada do Supabase.

### ckf-manutencao-orcamentos

Responsável desde a primeira etapa de backend por:

- migração `site_tickets`;
- constraints, índices, RLS e grants;
- Edge Function `capture-site-ticket`;
- testes server-side do contrato de captura;
- futuramente, fila interna de Tickets;
- qualificação;
- transformação em cliente;
- criação de orçamento;
- histórico e gestão de status.

Isso mantém uma única fonte de verdade para o banco operacional da CKF.

### ckf-design

Responsável por:

- assets de marca e materiais visuais aprovados;
- origem das imagens institucionais quando aplicável.

## 19. Sequência arquitetural recomendada

Sem detalhar tarefas de implementação, a ordem de dependência é:

1. fechar navegação e links internos atuais;
2. consolidar catálogo canônico de serviços no site;
3. criar schema e Edge Function de tickets no `ckf-manutencao-orcamentos`;
4. implementar Ticket Engine público no site usando somente o contrato HTTP;
5. ampliar cluster SEO e hub `/servicos`;
6. aplicar o fluxo de solicitação às páginas de serviço;
7. adicionar privacidade e analytics;
8. conectar domínio definitivo;
9. validar produção, Core Web Vitals e indexação;
10. implementar a interface interna do módulo Tickets no CKF Orçamentos em etapa separada.

## 20. Critérios de aceite arquitetural

A arquitetura estará pronta quando:

- nenhuma experiência pública usar o termo `lead`;
- uma solicitação puder ser persistida antes do WhatsApp;
- o visitante receber identificador público aleatório e seguro;
- nenhum segredo existir no frontend;
- o site não tiver acesso anônimo às tabelas internas;
- o backend operacional estiver versionado somente no repositório CKF Orçamentos;
- cada página de serviço tiver intenção própria e HTML indexável;
- páginas estiverem interligadas semanticamente;
- sitemap/canonical/schema forem coerentes com o domínio final;
- origem e UTM forem preservadas sem enviar PII para analytics;
- contrato de conversão ticket -> cliente/orçamento estiver definido;
- todos os gates existentes continuarem verdes.
