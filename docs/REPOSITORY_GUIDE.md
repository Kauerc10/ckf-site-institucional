# Guia técnico do site institucional

## Visão geral

O site institucional da CKF é uma landing page React 19 construída com Vite 6. Seu objetivo é apresentar os serviços e encaminhar contatos para orçamento via WhatsApp.

## Estrutura atual

| Caminho | Responsabilidade |
| --- | --- |
| `src/App.jsx` | Conteúdo e composição principal da landing page |
| `src/styles.css` | Estilos responsivos e sistema visual |
| `public/assets` | Imagens, ícones e logo usados pelo site |
| `worker/index.js` | Fallback de navegação SPA para o ambiente de Sites |
| `scripts/prepare-sites-build.mjs` | Prepara arquivos extras após o build do Vite |
| `tests` | Verificações do worker e da configuração de deploy |
| `vercel.json` | Configuração de build, rewrites e cabeçalhos da Vercel |

## Executar e validar

```bash
npm install
npm run dev
npm run check:deploy
```

O `check:deploy` executa o build e valida o worker e `vercel.json`. O build final publica `dist/client`; o script pós-build também prepara `dist/server/index.js` e `dist/.openai/hosting.json` para o fluxo de Sites.

## Deploy

O deploy de produção é feito pela Vercel usando `npm run build` e `dist/client`. As rotas são reescritas para `index.html`, exceto assets e `robots.txt`, preservando navegação de SPA.

## Automação

O workflow `CI` usa Node.js 24 e executa `npm ci` seguido de `npm run check:deploy`. O workflow `Segurança` procura segredos no histórico do repositório. O Dependabot mantém dependências npm sob revisão mensal, agrupadas por tipo.

## Conteúdo e marca

Telefones e links de WhatsApp ficam no conteúdo do site e devem ser conferidos antes de produção. Logos e assets institucionais são originados no [repositório de design](https://github.com/Kauerc10/ckf-design); não use versões não aprovadas.
