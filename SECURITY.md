# Política de segurança

## Reporte responsável

Não abra issue pública para relatar credenciais expostas, vulnerabilidades, dados pessoais, links administrativos ou falhas de configuração de hospedagem.

Envie os detalhes para [kaue.ruon@gmail.com](mailto:kaue.ruon@gmail.com), incluindo impacto, arquivos ou URLs afetados e passos seguros para reproduzir o problema. Não inclua tokens, senhas ou dados de terceiros.

## Escopo atual

O site é uma aplicação React/Vite publicada na Vercel. A configuração de deploy inclui cabeçalhos de segurança, navegação SPA e regras para assets estáticos. Os principais cuidados são:

- não versionar `.env` ou segredos;
- manter links de WhatsApp e contato sob revisão;
- preservar os cabeçalhos definidos em `vercel.json`;
- validar o deploy com `npm run check:deploy` antes de publicar.

## Fora de escopo

Solicitações comerciais, conteúdo do site e ajustes de marca devem ser tratados como contribuição normal ou suporte. Para a marca, use o repositório [CKF Design](https://github.com/Kauerc10/ckf-design).
