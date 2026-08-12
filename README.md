# CKF — Site Institucional

Landing page institucional da **CKF Manutenção**, criada para apresentar as
soluções de manutenção pesada e transformar interesse em pedidos de orçamento
via WhatsApp.

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
npm run build
npm run test:sites
```

O relatório de comparação visual está em [`design-qa.md`](design-qa.md).

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
