import { useEffect, useRef, useState } from 'react'
import {
  FaArrowRight, FaBuilding, FaComments, FaIndustry, FaLocationDot, FaMapLocationDot,
  FaMagnifyingGlass, FaScrewdriverWrench, FaTruck, FaWhatsapp, FaWrench,
} from 'react-icons/fa6'
import './styles.css'
import './legal-footer.css'
import { SERVICE_PAGES } from '../service-pages.mjs'
import { trackEvent } from './analytics.js'
import { TicketRequestDialog } from './TicketRequestDialog.jsx'
import { readTicketLaunchIntent } from './ticket-request.js'
import { CONTACTS, buildWhatsAppUrl } from './whatsapp.js'

const WHATSAPP = buildWhatsAppUrl()
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Rodovia%20BR-101%2C%206780%2C%20Galp%C3%A3o%2001%20Sala%2001%2C%20Espinheiros%2C%20Itaja%C3%AD%20-%20SC%2C%2088317-000'
const serviceHighlights = SERVICE_PAGES.filter((service) => service.featured)
const serviceSlugs = SERVICE_PAGES.map((service) => service.slug)
const pagePath = () => globalThis.location?.pathname || '/'
const trackWhatsApp = (ctaSource, serviceSlug = '') => trackEvent('whatsapp_click', { page: pagePath(), ctaSource, serviceSlug })

const capabilityGallery = [
  ['Centrais de concreto', 'Montagem, manutenção e disponibilidade para operações que não param.', '/assets/central-concreto-editorial.webp'],
  ['Estruturas metálicas', 'Execução em campo com leitura técnica de cada etapa.', '/assets/estruturas-editorial.webp'],
  ['Oficina CKF', 'Estrutura preparada para fabricar, recuperar e entregar.', '/assets/oficina-editorial.webp'],
]
const serviceTable = [
  ['Manutenção preventiva', 'Inspeção e correção programada para reduzir paradas.'],
  ['Suspensão e freios', 'Revisão voltada à segurança e à estabilidade da operação.'],
  ['Solda e estruturas', 'Reparos, reforços e fabricação para trabalho pesado.'],
  ['Hidráulica e embreagem', 'Diagnóstico e reparos em sistemas essenciais.'],
  ['Reforma de chassis', 'Recuperação estrutural e adaptação de equipamentos.'],
  ['Pintura e acabamento', 'Proteção e renovação para prolongar a vida útil.'],
]
const audiences = [[FaTruck,'Gestores de frota'],[FaIndustry,'Centrais de concreto'],[FaBuilding,'Construtoras'],[FaWrench,'Donos de caminhões e máquinas pesadas']]
const process = [[FaComments,'01','Entendimento rápido','Você nos conta o problema. Perguntamos o essencial para entender o cenário.'],[FaMagnifyingGlass,'02','Diagnóstico e plano','Avaliamos, explicamos as opções e deixamos o orçamento claro.'],[FaScrewdriverWrench,'03','Execução e entrega','Mão de obra especializada e teste final para a operação voltar com segurança.']]

function MobileMenu() {
  const detailsRef = useRef(null)
  const closeMenu = () => { if (detailsRef.current) detailsRef.current.open = false }
  const closeMenuAndTrackWhatsApp = () => { closeMenu(); trackWhatsApp('mobile-menu') }

  return <details className="mobile-menu" ref={detailsRef}><summary aria-label="Abrir menu de navegação">Menu</summary><nav aria-label="Navegação móvel"><a href="#servicos" onClick={closeMenu}>Serviços</a><a href="#capacidade" onClick={closeMenu}>Estrutura</a><a href="#sobre" onClick={closeMenu}>Quem somos</a><a href="#processo" onClick={closeMenu}>Como trabalhamos</a><a href="#localizacao" onClick={closeMenu}>Localização</a><a href="#contato" onClick={closeMenu}>Contato</a><a className="mobile-menu__cta" href={WHATSAPP} target="_blank" rel="noreferrer" data-cta-source="mobile-menu" onClick={closeMenuAndTrackWhatsApp}>WhatsApp</a></nav></details>
}

export function App() {
  const [ticketDialog, setTicketDialog] = useState({ open:false, source:'', serviceSlug:'' })
  function openTicket(source, serviceSlug = '') { setTicketDialog({ open:true, source, serviceSlug }) }

  useEffect(() => {
    const intent = readTicketLaunchIntent({
      search: globalThis.location?.search ?? '',
      knownServiceSlugs: serviceSlugs,
    })
    if (intent.shouldOpen) openTicket(intent.source, intent.serviceSlug)
  }, [])

  return <main>
    <a className="skip-link" href="#inicio">Pular para o conteúdo</a>
    <header className="topbar"><a className="brand" href="#inicio" aria-label="CKF Manutenção - Início"><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /></a><nav className="desktop-nav" aria-label="Navegação principal"><a href="#servicos">Serviços</a><a href="#capacidade">Estrutura</a><a href="#sobre">Quem somos</a><a href="#processo">Como trabalhamos</a><a href="#localizacao">Localização</a><a href="#contato">Contato</a></nav><a className="button button--small" href={WHATSAPP} target="_blank" rel="noreferrer" data-cta-source="header" onClick={() => trackWhatsApp('header')}><FaWhatsapp /> WhatsApp</a><MobileMenu /></header>

    <section className="hero" id="inicio"><img src="/assets/solda-ckf.webp" alt="Profissional da CKF realizando solda em chassi de caminhão" fetchPriority="high" /><span className="hero__weld-glow" aria-hidden="true" /><div className="hero__content"><p className="eyebrow">CKF Manutenção</p><h1>Sua operação<br />precisa continuar.</h1><p>Manutenção pesada para quem mede resultado em operação, prazo e segurança.</p><button className="button" type="button" data-ticket-trigger="hero" onClick={() => openTicket('hero')}>Solicitar orçamento <FaArrowRight aria-hidden="true" /></button></div></section>
    <section className="audience" aria-labelledby="audience-title"><div className="section-shell"><h2 id="audience-title">Quem confia, não para.</h2><div className="audience__items">{audiences.map(([Icon,label]) => <div className="audience__item" key={label}><Icon aria-hidden="true" /><span>{label}</span></div>)}</div></div></section>
    <section className="services section-shell" id="servicos"><div className="services__intro"><p className="eyebrow">Para cada desafio</p><h2>Soluções que sustentam a operação.</h2><p>Diagnóstico, execução e responsabilidade técnica para o trabalho seguir no ritmo certo.</p></div><div className="service-grid">{serviceHighlights.map((service,index) => <a className="service-card" key={service.slug} href={service.href} aria-label={`Conhecer ${service.cardTitle}`} data-cta-source="service-highlight" data-cta-service={service.cardTitle} data-service-slug={service.slug} onClick={() => trackEvent('service_view', { page:pagePath(), serviceSlug:service.slug, ctaSource:'service-highlight' })}><img src={service.image} alt="" loading="lazy" /><span className="service-card__number">0{index+1}</span><h3>{service.cardTitle}</h3></a>)}</div></section>
    <section className="service-list" aria-labelledby="service-list-title"><div className="section-shell service-list__layout"><div><p className="eyebrow">Manutenção geral</p><h2 id="service-list-title">O essencial para sua operação seguir.</h2><p>Serviços objetivos, atendimento direto e orçamento pelo WhatsApp.</p></div><div className="service-table-wrap"><table><thead><tr><th scope="col">Serviço</th><th scope="col">Como ajudamos</th><th aria-label="Solicitar orçamento" /></tr></thead><tbody>{serviceTable.map(([service,description]) => <tr key={service}><th scope="row">{service}</th><td>{description}</td><td><a href={buildWhatsAppUrl({service})} target="_blank" rel="noreferrer" aria-label={`Falar sobre ${service} no WhatsApp`} data-cta-source="service-table" data-cta-service={service} onClick={() => trackWhatsApp('service-table')}><FaArrowRight aria-hidden="true" /></a></td></tr>)}</tbody></table><a className="text-link" href={WHATSAPP} target="_blank" rel="noreferrer" data-cta-source="service-list" onClick={() => trackWhatsApp('service-list')}><FaWhatsapp /> Falar sobre um serviço <FaArrowRight aria-hidden="true" /></a></div></div></section>
    <section className="capability" id="capacidade"><div className="section-shell"><div className="capability__heading"><div><p className="eyebrow">Estrutura em campo</p><h2>Capacidade para ir além do reparo.</h2></div><p>Do galpão à obra, a CKF entra com solução técnica, mão de obra e responsabilidade pela entrega.</p></div><div className="capability__gallery">{capabilityGallery.map(([title,text,image]) => <article className="capability__card" key={title}><img src={image} alt="" loading="lazy" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>
    <section className="about" id="sobre"><div className="section-shell about__layout"><div className="about__copy"><p className="eyebrow">Quem somos</p><h2>Trabalho de verdade. Decisão técnica em cada entrega.</h2><p>A CKF nasceu para atender operações que não podem esperar. Nossa equipe soma experiência de campo, estrutura e atenção ao detalhe para entregar manutenção pesada com segurança.</p><p className="about__signature">Sócios fundadores · CKF Manutenção</p></div><div className="about__portraits" aria-label="Sócios fundadores da CKF Manutenção"><img className="about__portrait about__portrait--left" src="/assets/fundador-ckf-capacete.webp" alt="Sócio fundador da CKF Manutenção" loading="lazy" /><img className="about__portrait about__portrait--right" src="/assets/socio-ckf-capacete.webp" alt="Sócio fundador da CKF Manutenção" loading="lazy" /></div></div></section>
    <section className="cost"><img src="/assets/real/oficina-real.webp" alt="Profissional da CKF trabalhando em uma oficina" loading="lazy" /><div className="section-shell cost__copy"><p className="eyebrow">O custo da parada</p><h2>Quando a operação para, <em>o custo cresce.</em></h2><p>Produção perdida, prazo pressionado e equipe parada. Manutenção bem conduzida reduz incerteza e devolve previsibilidade ao seu trabalho.</p></div></section>
    <section className="process" id="processo"><div className="section-shell"><p className="eyebrow">Nosso processo</p><h2>Da primeira conversa ao retorno da operação.</h2><div className="process__track">{process.map(([Icon,number,title,text]) => <article className="process__step" key={number}><div className="process__icon"><Icon aria-hidden="true" /></div><span className="process__number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>
    <section className="trust"><div className="trust__layout"><div className="trust__copy"><p className="eyebrow">Trabalho que sustenta</p><h2>Gente que resolve.<br />Do jeito certo.</h2><p>Equipe especializada, trabalho de verdade e foco total no que importa: sua operação funcionando com segurança.</p></div><figure className="trust__media"><img src="/assets/equipe-ckf-editorial.webp" alt="Equipe da CKF Manutenção reunida em frente a caminhão betoneira" loading="lazy" /></figure></div></section>
    <section className="location" id="localizacao"><div className="section-shell location__card"><img src="/assets/real/fachada-ckf-editorial.jpg" alt="Fachada da unidade da CKF Manutenção com caminhão betoneira em atendimento" loading="lazy" /><div className="location__copy"><p className="eyebrow">Nossa unidade</p><h2>Venha conversar com a equipe.</h2><address><FaLocationDot aria-hidden="true" /><span>Rodovia BR-101, 6780<br />Galpão 01, Sala 01 · Espinheiros<br />Itajaí · SC · 88317-000</span></address><a className="button" href={MAPS} target="_blank" rel="noreferrer"><FaMapLocationDot /> Abrir rota no Maps</a></div></div></section>
    <section className="contact" id="contato"><div className="section-shell contact__wrap"><div><FaWhatsapp className="contact__icon" aria-hidden="true" /><div><h2>Sua operação não pode esperar.</h2><p>Registre o cenário em poucos passos e continue o atendimento com a equipe pelo WhatsApp.</p></div></div><button className="button" type="button" data-ticket-trigger="contact" onClick={() => openTicket('contact')}>Pedir orçamento <FaArrowRight aria-hidden="true" /></button></div></section>
    <footer>
      <div className="footer__inner section-shell"><div><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /><p>Soluções em manutenção geral para caminhões, máquinas, concreto, equipamentos e estruturas.</p></div><div><h3>Fale com a gente</h3><a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" data-cta-source="footer-primary" data-contact="primary" onClick={() => trackWhatsApp('footer-primary')}><FaWhatsapp /> {CONTACTS.primary.label}</a><a href={buildWhatsAppUrl({contact:'secondary'})} target="_blank" rel="noreferrer" data-cta-source="footer-secondary" data-contact="secondary" onClick={() => trackWhatsApp('footer-secondary')}><FaWhatsapp /> {CONTACTS.secondary.label}</a><p>Atendimento rápido pelo WhatsApp.</p></div><div><h3>Manutenção geral</h3><p>Suspensão · Solda · Preventiva · Freios<br />Hidráulica · Reforma · Pintura · Embreagem</p></div></div>
      <div className="footer__legal section-shell">
        <nav className="footer__policies" aria-label="Políticas e informações jurídicas"><a href="/privacidade">Política de Privacidade</a><span aria-hidden="true">·</span><a href="/marketing">Política de Comunicações e Marketing</a></nav>
        <p className="footer__company">CKF MANUTENCAO LTDA · CNPJ 57.461.028/0001-43 · Rodovia BR-101, 6780, Galpão 01, Sala 01 · Espinheiros · Itajaí/SC · 88317-000</p>
        <p className="footer__credit">Idealizado e desenvolvido por <strong>K-Hub</strong></p>
      </div>
    </footer>
    <TicketRequestDialog open={ticketDialog.open} source={ticketDialog.source} initialServiceSlug={ticketDialog.serviceSlug} onClose={() => setTicketDialog({open:false,source:'',serviceSlug:''})} />
  </main>
}
