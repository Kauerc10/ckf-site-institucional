# CKF — Site Institucional

Landing page institucional da **CKF Manutenção**, criada para apresentar as
soluções de manutenção pesada e transformar interesse em pedidos de orçamento
via WhatsApp.

## Ecossistema CKF

Este projeto faz parte de um conjunto de repositórios com responsabilidades separadas:

| Repositório | Responsabilidade |
| --- | --- |
| [CKF Design](https://github.com/Kauerc10/ckf-design) | Fonte oficial da marca, dos assets e das entregas de design |
| **[Site Institucional](https://github.com/Kauerc10/ckf-site-institucional)** | Presença pública, apresentação dos serviços e captação de contatos |
| [Sistema de Orçamentos](https://github.com/Kauerc10/ckf-manutencao-orcamentos) | Operação interna, clientes, orçamentos e documentos comerciais |

As imagens e variações da identidade visual utilizadas aqui devem vir de uma entrega aprovada no repositório de design. Alterações na marca são versionadas primeiro na fonte oficial e depois aplicadas ao site por pull request.

## O que está incluído

- Hero comercial com CTA de orçamento
- Seção de públicos atendidos: **Quem confia, não para**
- Serviços para caminhões e máquinas pesadas, centrais de concreto, reforma de
  equipamentos e chassis, e estruturas metálicas
- Narrativa sobre o custo de equipamentos parados
- Jornada de atendimento da primeira conversa à entrega
- Bloco de confiança com equipe e uniforme CKF
- Rodapé comercial e CTAs de WhatsApp

## Tecnologias

- React 19
- Vite 6
- React Icons
- CSS responsivo sem framework visual

## Como executar localmente

```bash
npm install
npm run dev
```

O Vite exibirá a URL local de visualização.

## Qualidade

```bash
npm run check:deploy
```

O relatório de comparação visual está em [`design-qa.md`](design-qa.md).

## Deploy na Vercel

O projeto está pronto para importação direta na Vercel. O arquivo
[`vercel.json`](vercel.json) fixa o build de produção, publica somente
`dist/client`, preserva a navegação da SPA e aplica cabeçalhos de segurança.
A versão do Node usada no build também está fixada no `package.json` para evitar
diferenças entre os ambientes local e remoto.

Depois de conectar o repositório, a Vercel detecta o Vite e executa
automaticamente `npm run build`; não é necessário cadastrar comandos ou pasta
de saída manualmente no painel.

## Estrutura

```text
public/assets/  Imagens e logo da CKF
src/            Componentes e estilos da landing page
tests/          Testes do empacotamento para hospedagem
worker/         Worker de entrega do site
```

## Antes de publicar em produção

Confirme os telefones e o link final de WhatsApp em `src/App.jsx`. As imagens
mostram a identidade de uniforme CKF para representar a equipe e podem ser
substituídas por fotografia real quando disponível.
