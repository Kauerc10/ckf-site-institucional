# Como contribuir

## Fluxo de trabalho

A `main` recebe mudanças somente por pull request. Crie uma branch curta e descritiva antes de alterar arquivos:

```text
docs/atualiza-instalacao
fix/link-whatsapp
feat/nova-secao-servicos
```

Faça commits focados, com títulos naturais e sem assinaturas automáticas. Antes de abrir a pull request, explique o objetivo, o impacto visual ou operacional e como a alteração foi validada.

## Ambiente local

Este projeto usa Node.js 24.x, React 19 e Vite 6.

```bash
npm install
npm run dev
```

## Validação obrigatória

Use o comando abaixo antes de enviar mudanças que afetem o site, deploy ou configuração:

```bash
npm run check:deploy
```

Ele executa o build, os testes do worker e a validação da configuração da Vercel. Para alterações visuais, confira também a página em navegadores de desktop e mobile.

## Direção visual e assets

O site segue o sistema industrial preto, branco e amarelo da CKF. A identidade visual oficial está em [CKF Design](https://github.com/Kauerc10/ckf-design). Não modifique logos, cores institucionais ou assets oficiais diretamente neste repositório sem uma entrega aprovada no repositório de design.

## Segurança e dados

Não envie variáveis de ambiente, credenciais, chaves, dados de clientes ou URLs internas. Problemas sensíveis devem seguir a [política de segurança](SECURITY.md).
