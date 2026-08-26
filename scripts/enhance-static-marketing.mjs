#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SITE_URL } from '../site.config.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const client = path.join(root, 'dist', 'client')
const privacyFile = path.join(client, 'privacidade', 'index.html')
const marketingDirectory = path.join(client, 'marketing')
const marketingFile = path.join(marketingDirectory, 'index.html')
const sitemapFile = path.join(client, 'sitemap.xml')
const siteUrl = SITE_URL.replace(/\/+$/, '')
const privacyCanonical = `${siteUrl}/privacidade`
const marketingCanonical = `${siteUrl}/marketing`
const description = 'Entenda como a CKF Manutenção pode realizar comunicações comerciais, ofertas, campanhas e contatos de relacionamento, além de como interromper essas comunicações.'

const article = `<article class="section-shell service-page__legal">
  <p class="eyebrow">Relacionamento comercial</p>
  <h1>Política de Comunicações e Marketing</h1>
  <p>Esta Política de Comunicações e Marketing explica como a CKF Manutenção pode utilizar dados de relacionamento para realizar contatos comerciais de forma compatível com o contexto em que as informações foram obtidas, respeitando a legislação aplicável, as expectativas do titular e as opções de oposição ou descadastro.</p>
  <p>Para os tratamentos descritos nesta política, a controladora é <strong>CKF MANUTENCAO LTDA</strong>, inscrita no CNPJ sob nº <strong>57.461.028/0001-43</strong>, com sede na Rodovia BR-101, 6780, Galpão 01, Sala 01, Espinheiros, Itajaí/SC, CEP 88317-000.</p>

  <h2>Quais comunicações podemos realizar</h2>
  <p>Podemos entrar em contato para acompanhar Solicitações e orçamentos, retomar conversas comerciais, apresentar serviços relacionados ao equipamento ou à necessidade informada, lembrar sobre manutenção preventiva, comunicar novidades da CKF, divulgar condições comerciais, ofertas e campanhas pertinentes aos serviços prestados, além de realizar pesquisas de satisfação e comunicações institucionais relacionadas ao relacionamento com a empresa.</p>
  <p>As comunicações devem guardar relação razoável com a atividade da CKF, com o histórico de contato ou com interesses comerciais identificados de forma legítima. Não utilizamos esta política como autorização irrestrita para envio de mensagens sem relação com nossos serviços.</p>

  <h2>Canais utilizados</h2>
  <p>As comunicações podem ocorrer pelos canais informados pelo próprio titular, como WhatsApp, telefone e e-mail, além de outros canais oficiais que venham a ser adotados pela CKF. O canal escolhido pode depender do contexto da Solicitação, do relacionamento existente e da natureza da mensagem.</p>

  <h2>Bases legais e contexto</h2>
  <p>Contatos diretamente ligados a uma Solicitação, atendimento, orçamento ou contratação podem ser necessários para executar procedimentos preliminares ou o próprio relacionamento contratual. Em determinadas situações, comunicações comerciais compatíveis com a expectativa razoável do titular podem se apoiar em legítimo interesse, após avaliação de finalidade, necessidade, proporcionalidade e impacto sobre os direitos do titular.</p>
  <p>Quando uma finalidade específica depender de consentimento, a CKF deverá utilizar mecanismo adequado para obtê-lo e permitir sua revogação. A simples ciência desta política não substitui consentimento quando o consentimento for juridicamente necessário para uma finalidade específica.</p>

  <h2>Segmentação e dados utilizados</h2>
  <p>Para tornar as comunicações mais relevantes, podemos considerar dados como serviço procurado, tipo de equipamento, empresa informada, cidade e UF, histórico de Solicitações ou orçamentos, interações anteriores com a CKF e informações de origem da visita, como página acessada e parâmetros de campanha. Essa segmentação busca evitar comunicações aleatórias e priorizar conteúdos relacionados ao contexto comercial.</p>
  <p>Não utilizamos dados pessoais sensíveis para segmentação de marketing e não adotamos decisões exclusivamente automatizadas com efeitos jurídicos relevantes sobre o titular a partir desse tipo de segmentação.</p>

  <h2>Como parar de receber</h2>
  <p>Você pode se opor a comunicações promocionais ou solicitar o descadastro a qualquer momento, de forma simples e gratuita. No WhatsApp, poderá responder <strong>SAIR</strong> ou informar claramente que não deseja mais receber comunicações comerciais. Também é possível utilizar os canais oficiais da CKF indicados no site.</p>
  <p>O pedido de descadastro será aplicado às comunicações promocionais cabíveis. Mensagens necessárias para concluir um atendimento em andamento, responder a uma Solicitação, tratar um orçamento já solicitado, cumprir obrigação aplicável ou atender outro pedido do próprio titular podem continuar quando houver fundamento adequado.</p>

  <h2>Compartilhamento e operadores</h2>
  <p>Para viabilizar comunicação, hospedagem, registro de relacionamento e segurança, dados podem ser processados por fornecedores que atuam como operadores ou plataformas utilizadas pela CKF, incluindo serviços de hospedagem e banco de dados e, quando aplicável, plataformas como WhatsApp/Meta, provedores de e-mail, CRM ou ferramentas de comunicação.</p>
  <p>O compartilhamento é limitado ao necessário para executar essas funções. Não vendemos dados pessoais e não compartilhamos a base de contatos para que terceiros realizem publicidade própria independente em nome deles sem fundamento legal específico.</p>

  <h2>Retenção</h2>
  <p>Dados utilizados para relacionamento comercial podem ser mantidos enquanto houver finalidade legítima relacionada à Solicitação, orçamento, cliente, histórico de atendimento ou relacionamento comercial, respeitando critérios de necessidade, obrigações aplicáveis e pedidos de oposição ou eliminação quando cabíveis.</p>

  <h2>Seus direitos</h2>
  <p>Além do direito de se opor ou interromper comunicações promocionais, você pode exercer os direitos previstos na legislação aplicável sobre seus dados pessoais, incluindo pedidos de acesso, correção, informação sobre compartilhamento e eliminação quando cabíveis. Consulte também nossa <a href="/privacidade">Política de Privacidade</a> para informações gerais sobre tratamento de dados.</p>

  <h2>Atualizações desta política</h2>
  <p>Esta política poderá ser atualizada conforme os canais, ferramentas ou práticas de relacionamento comercial da CKF evoluam. A versão publicada nesta página é a referência vigente.</p>

  <h2>Contato</h2>
  <p>Para dúvidas, oposição a comunicações, descadastro ou exercício de direitos relacionados a esta política, entre em contato com a CKF Manutenção pelos canais oficiais informados neste site.</p>
  <p><small>Última atualização: 26 de agosto de 2026.</small></p>
</article>`

let html = readFileSync(privacyFile, 'utf8')
const articlePattern = /<article class="section-shell service-page__legal">[\s\S]*?<\/article>/

if (!articlePattern.test(html)) {
  throw new Error('Missing legal article marker in privacy page template')
}

html = html
  .replaceAll(privacyCanonical, marketingCanonical)
  .replaceAll('Política de Privacidade | CKF Manutenção', 'Política de Comunicações e Marketing | CKF Manutenção')
  .replaceAll('Política de Privacidade', 'Política de Comunicações e Marketing')
  .replaceAll('/?cta=privacy', '/?cta=marketing')
  .replace(/<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${description}" />`)
  .replace(/<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${description}" />`)
  .replace(/<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${description}" />`)
  .replace(articlePattern, article)

mkdirSync(marketingDirectory, { recursive: true })
writeFileSync(marketingFile, html)

let sitemap = readFileSync(sitemapFile, 'utf8')
if (!sitemap.includes(marketingCanonical)) {
  if (!sitemap.includes('</urlset>')) throw new Error('Missing sitemap closing marker')
  sitemap = sitemap.replace('</urlset>', `<url><loc>${marketingCanonical}</loc></url></urlset>`)
  writeFileSync(sitemapFile, sitemap)
}

console.log('Generated CKF marketing communications policy')
