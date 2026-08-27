#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const file = path.join(root, 'dist', 'client', 'privacidade', 'index.html')

const article = `<article class="section-shell service-page__legal">
  <p class="eyebrow">Privacidade</p>
  <h1>Política de Privacidade</h1>
  <p>Esta Política de Privacidade explica de forma transparente como a CKF Manutenção trata dados pessoais recebidos pelo site, pelas Solicitações de atendimento e pelos canais de contato vinculados à operação.</p>

  <h2>Controlador e escopo</h2>
  <p>A controladora dos dados pessoais tratados no contexto deste site e dos canais vinculados ao atendimento é <strong>CKF MANUTENCAO LTDA</strong>, inscrita no CNPJ sob nº <strong>57.461.028/0001-43</strong>, com sede na Rodovia BR-101, 6780, Galpão 01, Sala 01, Espinheiros, Itajaí/SC, CEP 88317-000. A CKF Manutenção é responsável pelas decisões sobre o tratamento dos dados pessoais coletados para atendimento comercial e operacional. Esta política se aplica ao formulário de Solicitação, à navegação nas páginas institucionais e à continuidade voluntária do atendimento por WhatsApp.</p>

  <h2>Dados tratados</h2>
  <p>Podemos tratar nome, telefone, e-mail opcional, empresa opcional, cidade e UF, tipo de equipamento, marca e modelo opcionais, descrição do problema e urgência. Também podemos registrar informações técnicas relacionadas à origem da visita, como página acessada, CTA utilizado, referrer e parâmetros de campanha, incluindo UTMs.</p>
  <p>As ferramentas de medição recebem apenas contexto de navegação e dos eventos aprovados do funil. Os campos pessoais da Solicitação não são enviados como parâmetros dos eventos de analytics.</p>
  <p>Para proteção contra abuso, a infraestrutura pode utilizar informações de rede de forma transitória. Quando um identificador técnico de rede é necessário para limitar abuso no formulário, ele é transformado em digest criptográfico antes de ser persistido, sem armazenamento intencional do endereço IP bruto nesse registro.</p>

  <h2>Finalidades e bases legais</h2>
  <p>Os dados enviados em uma Solicitação são tratados para compreender a necessidade apresentada, responder ao contato, organizar atendimento, avaliar o serviço e preparar eventual orçamento. Esse tratamento pode se apoiar na execução de procedimentos preliminares relacionados a contrato, adotados a pedido do próprio titular.</p>
  <p>Também podemos tratar informações estritamente necessárias para segurança, prevenção de abuso, melhoria do funcionamento do site e organização do relacionamento comercial com fundamento em legítimo interesse, sempre observando necessidade, proporcionalidade e os direitos do titular. Quando houver obrigação legal ou regulatória aplicável, os dados poderão ser mantidos ou tratados para seu cumprimento. Quando uma finalidade específica depender de consentimento, essa base deverá ser obtida de forma adequada e poderá ser revogada nos termos aplicáveis.</p>

  <h2>Comunicações e marketing</h2>
  <p>O relacionamento comercial pode envolver acompanhamento de Solicitações e orçamentos, apresentação de serviços relacionados, reativação de contatos e outras comunicações compatíveis com o contexto do relacionamento, sempre mediante base legal adequada. As regras específicas sobre ofertas, campanhas, canais utilizados, segmentação e formas de oposição estão descritas na <a href="/marketing">Política de Comunicações e Marketing</a>.</p>
  <p>A simples ciência desta Política de Privacidade não substitui consentimento quando o consentimento for a base legal necessária para uma finalidade específica.</p>

  <h2>Compartilhamento e operadores</h2>
  <p>Os dados podem ser processados por fornecedores necessários para hospedagem, banco de dados, segurança, medição e comunicação do site. No fluxo atual, isso pode incluir a Vercel para hospedagem e Web Analytics, o Google Analytics para medição opcional quando autorizada, o Supabase para infraestrutura de dados e o WhatsApp, operado pela Meta, quando você decide continuar a conversa por esse canal.</p>
  <p>Esses fornecedores possuem termos e práticas próprias e podem operar infraestrutura fora do Brasil. O compartilhamento é limitado ao necessário para executar as respectivas funções. Não vendemos seus dados pessoais e não disponibilizamos o conteúdo da Solicitação publicamente.</p>

  <h2>Retenção</h2>
  <p>Os dados são mantidos pelo tempo necessário para atender a Solicitação, elaborar ou acompanhar orçamento, administrar o relacionamento comercial, prevenir abuso e cumprir obrigações aplicáveis. Depois de encerradas essas finalidades, os registros podem ser eliminados, anonimizados ou mantidos apenas quando houver fundamento legítimo ou obrigação que justifique sua conservação.</p>

  <h2>Segurança</h2>
  <p>Adotamos medidas técnicas e organizacionais compatíveis com o contexto do site, incluindo restrição de acesso às estruturas internas, minimização de dados, validação de entradas, controles contra abuso e transporte por HTTPS. Nenhum sistema conectado à internet é absolutamente imune a incidentes, por isso os controles são revisados conforme a operação evolui.</p>

  <h2>Direitos do titular</h2>
  <p>Nos termos da legislação aplicável, você pode solicitar confirmação da existência de tratamento, acesso, correção, informação sobre compartilhamento, anonimização, bloqueio ou eliminação quando cabíveis, além de exercer outros direitos previstos na legislação. Solicitações serão analisadas considerando a identidade do requerente, a natureza do pedido e eventuais obrigações de retenção.</p>

  <h2>Cookies e tecnologias</h2>
  <p>O registro de uma Solicitação não depende de cookies publicitários. O site utiliza o Vercel Web Analytics para métricas operacionais e eventos customizados limitados ao contexto aprovado, sem enviar os campos pessoais da Solicitação como parâmetros desses eventos.</p>
  <p>O Google Analytics utiliza cookies de medição opcionais. Por padrão, a medição do Google e os sinais de publicidade permanecem desativados, e a tag do Google só é carregada depois que você aceita os cookies opcionais. A escolha é guardada localmente no navegador para não perguntar a cada acesso e pode ser alterada a qualquer momento em <strong>Preferências de cookies</strong> no rodapé. Recusar os cookies opcionais não impede o uso do site nem o envio de uma Solicitação.</p>
  <p>O site também pode ler parâmetros de campanha presentes na própria URL para identificar a origem de uma Solicitação. Caso publicidade, remarketing ou tecnologias equivalentes sejam ativadas no futuro, os controles e esta política serão revistos antes do uso correspondente.</p>

  <h2>WhatsApp e serviços de terceiros</h2>
  <p>Ao escolher continuar o atendimento pelo WhatsApp, sua interação passa também a estar sujeita aos termos e políticas da plataforma. O site envia ao WhatsApp apenas o resumo necessário para identificar a Solicitação e facilitar a continuidade do contato, incluindo o identificador público da Solicitação e informações operacionais informadas por você.</p>

  <h2>Atualizações desta política</h2>
  <p>Esta política pode ser atualizada quando o site, os fornecedores ou as formas de tratamento de dados mudarem. A versão publicada nesta página é a referência vigente, acompanhada da data de atualização.</p>

  <h2>Contato</h2>
  <p>Para dúvidas sobre privacidade, exercício de direitos ou informações sobre uma Solicitação, entre em contato com a CKF Manutenção pelos canais oficiais informados neste site.</p>
  <p><small>Última atualização: 27 de agosto de 2026.</small></p>
</article>`

let html = readFileSync(file, 'utf8')
const articlePattern = /<article class="section-shell service-page__legal">[\s\S]*?<\/article>/

if (!articlePattern.test(html)) {
  throw new Error('Missing privacy article marker in generated page')
}

html = html.replace(articlePattern, article)
writeFileSync(file, html)
console.log('Enhanced CKF privacy policy')
