#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { SERVICE_PAGES } from '../service-pages.mjs'
import { SITE_URL } from '../site.config.mjs'
import { CONTACTS, buildWhatsAppUrl } from '../src/whatsapp.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const client = path.join(dist, 'client')
const index = path.join(client, 'index.html')
const worker = path.join(root, 'worker', 'index.js')
const hosting = path.join(root, '.openai', 'hosting.json')

for (const file of [index, worker, hosting]) {
  if (!existsSync(file)) throw new Error(`Missing Sites build input: ${file}`)
}

const siteUrl = SITE_URL.replace(/\/+$/, '')
if (new URL(siteUrl).protocol !== 'https:') throw new Error('SITE_URL must use HTTPS')

const builtHtml = readFileSync(index, 'utf8')
if (!builtHtml.includes('__CKF_SITE_URL__')) throw new Error('Missing CKF site URL placeholder in built index.html')
const stylesheetHrefs = [...builtHtml.matchAll(/<link rel="stylesheet"[^>]*href="([^"]+)"/g)].map((match) => match[1])
const stylesheetHref = stylesheetHrefs.find((href) => /^\/assets\/.*\.css$/.test(href))
if (!stylesheetHref) throw new Error('Missing Vite bundle stylesheet in built index.html')

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function baseHead({ title, description, canonical, image = '/assets/solda-ckf.webp', structuredData = [] }) {
  const schemas = structuredData.map((data) => `<script type="application/ld+json">${JSON.stringify(data)}</script>`).join('\n    ')
  return `<meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#090c0d" />
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="index, follow" />
    <link rel="canonical" href="${canonical}" />
    <meta property="og:type" content="website" />
    <meta property="og:locale" content="pt_BR" />
    <meta property="og:site_name" content="CKF Manutenção" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${siteUrl}${image}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${siteUrl}${image}" />
    <link rel="icon" href="/assets/favicon.ico" sizes="any" />
    <link rel="icon" type="image/svg+xml" href="/assets/favicon.svg" />
    <link rel="stylesheet" href="${stylesheetHref}" />
    <link rel="stylesheet" href="/service-pages.css" />
    <link rel="stylesheet" href="/mobile-a11y.css" />
    ${schemas}
    <title>${escapeHtml(title)}</title>`
}

const provider = {
  '@type': ['LocalBusiness', 'Organization'],
  name: 'CKF Manutenção',
  url: siteUrl,
  telephone: '+55 47 99121-4232',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Rodovia BR-101, 6780, Galpão 01, Sala 01',
    addressLocality: 'Itajaí',
    addressRegion: 'SC',
    postalCode: '88317-000',
    addressCountry: 'BR',
  },
}

function breadcrumbs(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}

function renderTopbar({ ctaHref, ctaLabel = 'Solicitar orçamento', external = false }) {
  const externalAttrs = external ? ' target="_blank" rel="noreferrer"' : ''
  return `<header class="topbar">
      <a class="brand" href="/" aria-label="CKF Manutenção - Início"><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /></a>
      <nav aria-label="Navegação principal"><a class="service-page__nav" href="/servicos">Serviços</a><a class="service-page__nav" href="/#sobre">Quem somos</a><a class="service-page__nav" href="/#localizacao">Localização</a><a class="service-page__nav" href="/#contato">Contato</a></nav>
      <a class="button button--small" href="${escapeHtml(ctaHref)}"${externalAttrs}>${escapeHtml(ctaLabel)}</a>
      <details class="mobile-menu">
        <summary aria-label="Abrir menu de navegação">Menu</summary>
        <nav aria-label="Navegação móvel">
          <a href="/servicos">Serviços</a>
          <a href="/#capacidade">Estrutura</a>
          <a href="/#sobre">Quem somos</a>
          <a href="/#processo">Como trabalhamos</a>
          <a href="/#localizacao">Localização</a>
          <a href="/#contato">Contato</a>
          <a class="mobile-menu__cta" href="${escapeHtml(ctaHref)}"${externalAttrs}>${escapeHtml(ctaLabel)}</a>
        </nav>
      </details>
    </header>`
}

function renderFooter({ whatsapp = buildWhatsAppUrl() } = {}) {
  return `<footer><div class="footer__inner section-shell"><div><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /><p>Manutenção pesada, recuperação e estruturas para operações que precisam continuar.</p></div><div><h3>WhatsApp rápido</h3><a href="${whatsapp}" target="_blank" rel="noreferrer">${CONTACTS.primary.label}</a><p>Para contato direto sem formulário.</p></div><div><h3>Unidade</h3><p>Rodovia BR-101, 6780<br />Galpão 01, Sala 01 · Espinheiros<br />Itajaí · SC · 88317-000</p></div></div></footer>`
}

function renderHomeSeoSnapshot() {
  const ticketHref = '/?cta=home-static'
  const mapsHref = 'https://maps.app.goo.gl/WTSkh222vowLHtQi7'
  const featuredServices = SERVICE_PAGES
    .filter((page) => page.featured)
    .map((page, index) => `<a class="service-card" href="${page.href}"><img src="${page.image}" alt="" loading="lazy" /><span class="service-card__number">0${index + 1}</span><h3>${escapeHtml(page.cardTitle)}</h3></a>`)
    .join('')
  const generalServices = SERVICE_PAGES
    .map((page) => `<li><a href="${page.href}">${escapeHtml(page.cardTitle)}</a></li>`)
    .join('')
  const processSteps = [
    ['01', 'Solicitação do atendimento', 'Conte o essencial em poucos passos. A solicitação é registrada e chega estruturada para nossa equipe.'],
    ['02', 'Análise e diagnóstico', 'A equipe avalia o cenário, confirma os detalhes necessários e define a melhor abordagem.'],
    ['03', 'Orçamento e alinhamento', 'Escopo, serviço e condições são apresentados com clareza. Qualquer ajuste é combinado antes de seguir.'],
    ['04', 'Execução acompanhada', 'Com tudo alinhado, a equipe executa o serviço com responsabilidade técnica e comunicação direta.'],
    ['05', 'Teste e entrega', 'O equipamento é validado antes da entrega, com foco em segurança e retorno confiável à operação.'],
  ]
    .map(([number, title, text]) => `<article class="process__step"><div class="process__icon" aria-hidden="true"></div><span class="process__number">${number}</span><h3>${title}</h3><p>${text}</p></article>`)
    .join('')

  return `<main>
    <a class="skip-link" href="#inicio">Pular para o conteúdo</a>
    ${renderTopbar({ ctaHref: buildWhatsAppUrl(), ctaLabel: 'WhatsApp', external: true })}
    <section class="hero" id="inicio"><img src="/assets/solda-ckf.webp" alt="Profissional da CKF realizando solda em chassi de caminhão" fetchpriority="high" /><span class="hero__weld-glow" aria-hidden="true"></span><div class="hero__content"><p class="eyebrow">CKF Manutenção</p><h1>Sua operação<br />precisa continuar.</h1><p>Manutenção pesada para quem mede resultado em operação, prazo e segurança.</p><a class="button" href="${ticketHref}">Solicitar orçamento</a></div></section>
    <section class="services section-shell" id="servicos"><div class="services__intro"><p class="eyebrow">Para cada desafio</p><h2>Soluções que sustentam a operação.</h2><p>Diagnóstico, execução e responsabilidade técnica para o trabalho seguir no ritmo certo.</p></div><div class="service-grid">${featuredServices}</div></section>
    <section class="service-list" aria-labelledby="home-service-list-title"><div class="section-shell service-list__layout"><div><p class="eyebrow">Manutenção geral</p><h2 id="home-service-list-title">O essencial para sua operação seguir.</h2><p>Serviços objetivos, atendimento direto e orçamento pelo WhatsApp.</p></div><div><ul class="service-page__related-list">${generalServices}</ul></div></div></section>
    <section class="capability" id="capacidade"><div class="section-shell"><p class="eyebrow">Estrutura em campo</p><h2>Capacidade para ir além do reparo.</h2><p>Do galpão à obra, a CKF entra com solução técnica, mão de obra e responsabilidade pela entrega.</p></div></section>
    <section class="about" id="sobre"><div class="section-shell about__layout"><div class="about__copy"><p class="eyebrow">Quem somos</p><h2>Trabalho de verdade. Parceria que mantém <span>sua operação em movimento.</span></h2><p>A CKF trabalha lado a lado com quem depende da operação funcionando. Da primeira conversa à entrega, nossa equipe combina experiência de campo, diagnóstico claro e execução responsável para encontrar a solução certa, sem enrolação.</p><div class="about__commitments" aria-label="Compromissos da CKF"><span>Atendimento direto</span><span>Diagnóstico transparente</span><span>Compromisso com a entrega</span></div></div><div class="about__portraits" aria-label="Sócios fundadores da CKF Manutenção"><figure class="about__founder about__founder--left"><img class="about__portrait about__portrait--left" src="/assets/fundador-ckf-capacete.webp" alt="Cleber, sócio fundador da CKF Manutenção" loading="lazy" /><figcaption><strong>Cleber</strong><span>Sócio fundador</span></figcaption></figure><figure class="about__founder about__founder--right"><img class="about__portrait about__portrait--right" src="/assets/socio-ckf-capacete.webp" alt="Roberto, sócio fundador da CKF Manutenção" loading="lazy" /><figcaption><strong>Roberto</strong><span>Sócio fundador</span></figcaption></figure></div></div></section>
    <section class="cost"><img src="/assets/real/caminhao-betoneira-editorial.webp" alt="Caminhão betoneira em manutenção dentro da oficina da CKF" loading="lazy" /><div class="section-shell cost__copy"><p class="eyebrow">O custo da parada</p><h2>Quando a operação para, <em>o custo cresce.</em></h2><p>Produção perdida, prazo pressionado e equipe parada. Manutenção bem conduzida reduz incerteza e devolve previsibilidade ao seu trabalho.</p></div></section>
    <section class="process is-visible" id="processo"><div class="section-shell"><div class="process__heading"><p class="eyebrow">Nosso processo</p><h2>Do primeiro contato à operação de volta.</h2><p>Você sabe o que está acontecendo em cada etapa. A CKF organiza o atendimento, alinha o serviço e mantém a comunicação direta até a entrega.</p></div><div class="process__track">${processSteps}</div></div></section>
    <section class="trust"><div class="trust__layout"><div class="trust__copy"><p class="eyebrow">Trabalho que sustenta</p><h2>Gente que resolve.<br />Do jeito certo.</h2><p>Equipe especializada, comunicação direta e foco total no que importa: sua operação funcionando com segurança.</p></div><figure class="trust__media"><img src="/assets/equipe-ckf-editorial.webp" alt="Equipe da CKF Manutenção reunida em frente a caminhão betoneira" loading="lazy" /></figure></div></section>
    <section class="location" id="localizacao"><div class="section-shell location__card"><img src="/assets/real/fachada-ckf-editorial.jpg" alt="Fachada da unidade da CKF Manutenção com caminhão betoneira em atendimento" loading="lazy" /><div class="location__copy"><p class="eyebrow">Nossa unidade</p><h2>Venha conversar com a equipe.</h2><address>Rodovia BR-101, 6780<br />Galpão 01, Sala 01 · Espinheiros<br />Itajaí · SC · 88317-000</address><a class="button" href="${mapsHref}" target="_blank" rel="noreferrer">Como chegar à CKF</a></div></div></section>
    <section class="contact" id="contato"><div class="section-shell contact__wrap"><div><div><h2>Sua operação não pode esperar.</h2><p>Registre o cenário em poucos passos e continue o atendimento com a equipe pelo WhatsApp.</p></div></div><a class="button" href="${ticketHref}">Pedir orçamento</a></div></section>
    ${renderFooter()}
  </main>`
}

function renderServicePage(page) {
  const canonical = `${siteUrl}${page.href}`
  const whatsapp = buildWhatsAppUrl({ service: page.ctaService })
  const ticketHref = `/?orcamento=${encodeURIComponent(page.slug)}&cta=service-page`
  const servicesRows = page.services.map(([name, description]) => `<tr><th scope="row">${escapeHtml(name)}</th><td>${escapeHtml(description)}</td></tr>`).join('')
  const related = page.relatedSlugs
    .map((slug) => SERVICE_PAGES.find((item) => item.slug === slug))
    .filter(Boolean)
    .map((item) => `<li><a href="${item.href}">${escapeHtml(item.cardTitle)}</a></li>`)
    .join('')
  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: page.heading,
    description: page.description,
    url: canonical,
    areaServed: { '@type': 'City', name: 'Itajaí' },
    provider,
  }
  const breadcrumbSchema = breadcrumbs([
    { name: 'Início', url: siteUrl },
    { name: 'Serviços', url: `${siteUrl}/servicos` },
    { name: page.cardTitle, url: canonical },
  ])

  return `<!doctype html><html lang="pt-BR"><head>
    ${baseHead({ title: page.title, description: page.description, canonical, image: page.image, structuredData: [serviceSchema, breadcrumbSchema] })}
  </head><body class="service-page"><main>
    ${renderTopbar({ ctaHref: whatsapp, ctaLabel: 'WhatsApp rápido', external: true })}
    <nav class="section-shell service-page__breadcrumb" aria-label="Navegação estrutural"><a href="/">Início</a><span>/</span><a href="/servicos">Serviços</a><span>/</span><span aria-current="page">${escapeHtml(page.cardTitle)}</span></nav>
    <section class="hero"><img src="${page.image}" alt="${escapeHtml(page.imageAlt)}" fetchpriority="high" /><div class="hero__content"><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h1>${escapeHtml(page.heading)}</h1><p>${escapeHtml(page.intro)}</p><a class="button" href="${escapeHtml(ticketHref)}">Solicitar orçamento</a></div></section>
    <section class="service-list" aria-labelledby="service-detail-title"><div class="section-shell service-list__layout"><div><p class="eyebrow">Atendimento em Itajaí</p><h2 id="service-detail-title">O que avaliamos no serviço.</h2><p>A intervenção é definida depois de entender o equipamento, o problema e a condição encontrada no diagnóstico.</p><p class="service-page__local">CKF Manutenção · Espinheiros · Itajaí/SC</p></div><div class="service-table-wrap service-page__table"><table><thead><tr><th scope="col">Frente de serviço</th><th scope="col">Como ajudamos</th></tr></thead><tbody>${servicesRows}</tbody></table></div></div></section>
    <section class="section-shell service-page__related" aria-labelledby="related-title"><p class="eyebrow">Continue explorando</p><h2 id="related-title">Serviços relacionados</h2><ul>${related}</ul></section>
    <section class="contact"><div class="section-shell contact__wrap"><div><div><h2>Explique o cenário para a CKF.</h2><p>Registre equipamento, contato e urgência. Sua Solicitação é registrada antes de você continuar o atendimento pelo WhatsApp.</p></div></div><a class="button" href="${escapeHtml(ticketHref)}">Registrar Solicitação</a></div></section>
    ${renderFooter({ whatsapp })}
  </main></body></html>`
}

function renderServicesHub() {
  const canonical = `${siteUrl}/servicos`
  const ticketHref = '/?cta=services-hub'
  const cards = SERVICE_PAGES.map((page) => `<article class="service-page__hub-card"><p class="eyebrow">${escapeHtml(page.eyebrow)}</p><h2><a href="${page.href}">${escapeHtml(page.cardTitle)}</a></h2><p>${escapeHtml(page.description)}</p><a class="text-link" href="${page.href}">Ver serviço →</a></article>`).join('')
  const schema = breadcrumbs([{ name: 'Início', url: siteUrl }, { name: 'Serviços', url: canonical }])
  return `<!doctype html><html lang="pt-BR"><head>${baseHead({title:'Serviços de manutenção pesada e industrial | CKF Manutenção',description:'Conheça os serviços da CKF para caminhões, máquinas pesadas, centrais de concreto, manutenção industrial, hidráulica, solda e estruturas em Itajaí.',canonical,structuredData:[schema]})}</head><body class="service-page"><main>${renderTopbar({ ctaHref: ticketHref, ctaLabel: 'Pedir orçamento' })}<section class="section-shell service-page__hub"><p class="eyebrow">CKF Manutenção</p><h1>Todos os serviços</h1><p>Encontre a frente mais próxima do seu cenário. Se ainda não souber qual serviço escolher, registre a Solicitação e descreva o problema.</p><div class="service-page__hub-grid">${cards}</div></section><section class="contact"><div class="section-shell contact__wrap"><div><div><h2>Não encontrou o nome exato do serviço?</h2><p>Conte o que está acontecendo com o equipamento. A equipe direciona o atendimento.</p></div></div><a class="button" href="${ticketHref}">Registrar Solicitação</a></div></section>${renderFooter()}</main></body></html>`
}

function renderPrivacyPage() {
  const canonical = `${siteUrl}/privacidade`
  const ticketHref = '/?cta=privacy'
  const schema = breadcrumbs([{ name: 'Início', url: siteUrl }, { name: 'Política de Privacidade', url: canonical }])
  return `<!doctype html><html lang="pt-BR"><head>${baseHead({title:'Política de Privacidade | CKF Manutenção',description:'Saiba como a CKF Manutenção utiliza os dados enviados pelo site para responder Solicitações, preparar atendimento e orçamento.',canonical,structuredData:[schema]})}</head><body class="service-page"><main>${renderTopbar({ ctaHref: ticketHref, ctaLabel: 'Solicitar orçamento' })}<article class="section-shell service-page__legal"><p class="eyebrow">Privacidade</p><h1>Política de Privacidade</h1><p>Esta política explica como a CKF Manutenção trata as informações enviadas pelo site quando você registra uma Solicitação ou entra em contato pelo WhatsApp.</p><h2>Quais dados podemos receber</h2><p>Nome, telefone, e-mail opcional, empresa opcional, cidade e UF, tipo de equipamento, marca e modelo opcionais, descrição do problema, urgência e informações técnicas de origem da visita, como página acessada e parâmetros de campanha.</p><h2>Para que usamos esses dados</h2><p>Usamos as informações para identificar sua Solicitação, responder ao contato, entender o serviço necessário, organizar o atendimento e preparar orçamento quando aplicável. Não exigimos consentimento de marketing para solicitar atendimento.</p><h2>WhatsApp e serviços de infraestrutura</h2><p>Ao continuar o atendimento pelo WhatsApp, a conversa também fica sujeita às práticas da plataforma utilizada. O site utiliza infraestrutura de hospedagem e banco de dados para registrar e proteger as Solicitações.</p><h2>Segurança e minimização</h2><p>Coletamos apenas dados úteis ao atendimento. O identificador de rede usado para proteção contra abuso é transformado em digest criptográfico antes de ser armazenado, e o site não recebe acesso direto às tabelas internas da CKF.</p><h2>Retenção e direitos</h2><p>As informações são mantidas pelo período necessário às finalidades de atendimento, orçamento, relacionamento comercial e obrigações aplicáveis. Você pode solicitar acesso, correção ou eliminação quando cabível entrando em contato com a CKF pelos canais informados no site.</p><h2>Contato</h2><p>Para dúvidas sobre privacidade ou sobre uma Solicitação, fale com a CKF Manutenção pelo WhatsApp disponível neste site.</p><p><small>Última atualização: 25 de agosto de 2026.</small></p></article>${renderFooter()}</main></body></html>`
}

const publicIndexHtml = builtHtml
  .replaceAll('__CKF_SITE_URL__', siteUrl)
  .replace('<div id="root"></div>', `<div id="root">${renderHomeSeoSnapshot()}</div>`)
writeFileSync(index, publicIndexHtml)
writeFileSync(path.join(client, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`)
writeFileSync(path.join(client, 'llms.txt'), `# CKF Manutenção\n\n> Manutenção pesada e industrial em Itajaí, Santa Catarina.\n\nA CKF atende caminhões, máquinas pesadas, centrais de concreto, equipamentos industriais, chassis, hidráulica, solda e estruturas metálicas. Para solicitar atendimento, o visitante registra o cenário e continua a conversa com a equipe pelo WhatsApp.\n\n## Páginas principais\n\n- [Início](${siteUrl}/): visão geral, localização e como solicitar atendimento\n- [Serviços](${siteUrl}/servicos): catálogo de serviços da CKF\n${SERVICE_PAGES.map((page) => `- [${page.cardTitle}](${siteUrl}${page.href}): ${page.description}`).join('\n')}\n- [Política de Privacidade](${siteUrl}/privacidade)\n\n## Dados da empresa\n\n- Nome legal: CKF MANUTENCAO LTDA\n- CNPJ: 57.461.028/0001-43\n- Localização: Rodovia BR-101, 6780, Galpão 01, Sala 01, Espinheiros, Itajaí/SC, 88317-000\n- Telefones: +55 47 99121-4232 e +55 47 99913-0409\n- Área atendida: Itajaí e operações cuja demanda seja compatível com os serviços da CKF\n`)

for (const page of SERVICE_PAGES) {
  const pageDirectory = path.join(client, 'servicos', page.slug)
  mkdirSync(pageDirectory, { recursive: true })
  writeFileSync(path.join(pageDirectory, 'index.html'), renderServicePage(page))
}

mkdirSync(path.join(client, 'servicos'), { recursive: true })
writeFileSync(path.join(client, 'servicos', 'index.html'), renderServicesHub())
mkdirSync(path.join(client, 'privacidade'), { recursive: true })
writeFileSync(path.join(client, 'privacidade', 'index.html'), renderPrivacyPage())

const sitemapEntries = [siteUrl, `${siteUrl}/servicos`, ...SERVICE_PAGES.map((page) => `${siteUrl}${page.href}`), `${siteUrl}/privacidade`]
  .map((loc) => `  <url>\n    <loc>${loc}</loc>\n  </url>`)
  .join('\n')
writeFileSync(path.join(client, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`)

mkdirSync(path.join(dist, 'server'), { recursive: true })
mkdirSync(path.join(dist, '.openai'), { recursive: true })
copyFileSync(worker, path.join(dist, 'server', 'index.js'))
copyFileSync(hosting, path.join(dist, '.openai', 'hosting.json'))
console.log(`Prepared Sites build with SEO outputs, ${SERVICE_PAGES.length} service pages, hub, privacy and hosting files`)
