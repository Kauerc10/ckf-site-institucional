import {
  FaArrowRight,
  FaBuilding,
  FaComments,
  FaIndustry,
  FaLocationDot,
  FaMapLocationDot,
  FaMagnifyingGlass,
  FaScrewdriverWrench,
  FaTruck,
  FaWhatsapp,
  FaWrench,
} from 'react-icons/fa6'
import './styles.css'
import { CONTACTS, buildWhatsAppUrl } from './whatsapp.js'

const WHATSAPP = buildWhatsAppUrl()
const MAPS = 'https://www.google.com/maps/search/?api=1&query=Rodovia%20BR-101%2C%206780%2C%20Galp%C3%A3o%2001%20Sala%2001%2C%20Espinheiros%2C%20Itaja%C3%AD%20-%20SC%2C%2088317-000'

const serviceHighlights = [
  { title: 'Caminhões e máquinas pesadas', image: '/assets/real/chassis-real.webp' },
  { title: 'Centrais de concreto', image: '/assets/central-concreto-editorial.webp' },
  { title: 'Reforma de equipamentos e chassis', image: '/assets/real/maquina-pesada-real.webp' },
  { title: 'Estruturas metálicas', image: '/assets/estruturas-editorial.webp' },
]

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

const audiences = [
  [FaTruck, 'Gestores de frota'],
  [FaIndustry, 'Centrais de concreto'],
  [FaBuilding, 'Construtoras'],
  [FaWrench, 'Donos de caminhões e máquinas pesadas'],
]

const process = [
  [FaComments, '01', 'Entendimento rápido', 'Você nos conta o problema. Perguntamos o essencial para entender o cenário.'],
  [FaMagnifyingGlass, '02', 'Diagnóstico e plano', 'Avaliamos, explicamos as opções e deixamos o orçamento claro.'],
  [FaScrewdriverWrench, '03', 'Execução e entrega', 'Mão de obra especializada e teste final para a operação voltar com segurança.'],
]

export function App() {
  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="CKF Manutenção - Início"><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /></a>
        <nav aria-label="Navegação principal"><a href="#servicos">Serviços</a><a href="#capacidade">Estrutura</a><a href="#sobre">Quem somos</a><a href="#processo">Como trabalhamos</a><a href="#localizacao">Localização</a><a href="#contato">Contato</a></nav>
        <a className="button button--small" href={WHATSAPP} target="_blank" rel="noreferrer" data-cta-source="header"><FaWhatsapp /> Pedir orçamento</a>
      </header>

      <section className="hero" id="inicio">
        <img src="/assets/solda-ckf.webp" alt="Profissional da CKF realizando solda em chassi de caminhão" fetchPriority="high" />
        <span className="hero__weld-glow" aria-hidden="true" />
        <div className="hero__content"><p className="eyebrow">CKF Manutenção</p><h1>Sua operação<br />precisa continuar.</h1><p>Manutenção pesada para quem mede resultado em operação, prazo e segurança.</p><a className="button" href={WHATSAPP} target="_blank" rel="noreferrer" data-cta-source="hero"><FaWhatsapp /> Solicitar orçamento</a></div>
      </section>

      <section className="audience" aria-labelledby="audience-title"><div className="section-shell"><h2 id="audience-title">Quem confia, não para.</h2><div className="audience__items">{audiences.map(([Icon, label]) => <div className="audience__item" key={label}><Icon aria-hidden="true" /><span>{label}</span></div>)}</div></div></section>

      <section className="services section-shell" id="servicos">
        <div className="services__intro"><p className="eyebrow">Para cada desafio</p><h2>Soluções que sustentam a operação.</h2><p>Diagnóstico, execução e responsabilidade técnica para o trabalho seguir no ritmo certo.</p></div>
        <div className="service-grid">{serviceHighlights.map((service, index) => <a className="service-card" key={service.title} href={buildWhatsAppUrl({ service: service.title })} target="_blank" rel="noreferrer" aria-label={`Solicitar orçamento para ${service.title}`} data-cta-source="service-highlight" data-cta-service={service.title}><img src={service.image} alt="" loading="lazy" /><span className="service-card__number">0{index + 1}</span><h3>{service.title}</h3></a>)}</div>
      </section>

      <section className="service-list" aria-labelledby="service-list-title"><div className="section-shell service-list__layout"><div><p className="eyebrow">Manutenção geral</p><h2 id="service-list-title">O essencial para sua operação seguir.</h2><p>Serviços objetivos, atendimento direto e orçamento pelo WhatsApp.</p></div><div className="service-table-wrap"><table><thead><tr><th scope="col">Serviço</th><th scope="col">Como ajudamos</th><th aria-label="Solicitar orçamento" /></tr></thead><tbody>{serviceTable.map(([service, description]) => <tr key={service}><th scope="row">{service}</th><td>{description}</td><td><a href={buildWhatsAppUrl({ service })} target="_blank" rel="noreferrer" aria-label={`Falar sobre ${service} no WhatsApp`} data-cta-source="service-table" data-cta-service={service}><FaArrowRight aria-hidden="true" /></a></td></tr>)}</tbody></table><a className="text-link" href={WHATSAPP} target="_blank" rel="noreferrer" data-cta-source="service-list"><FaWhatsapp /> Falar sobre um serviço <FaArrowRight aria-hidden="true" /></a></div></div></section>

      <section className="capability" id="capacidade"><div className="section-shell"><div className="capability__heading"><div><p className="eyebrow">Estrutura em campo</p><h2>Capacidade para ir além do reparo.</h2></div><p>Do galpão à obra, a CKF entra com solução técnica, mão de obra e responsabilidade pela entrega.</p></div><div className="capability__gallery">{capabilityGallery.map(([title, text, image]) => <article className="capability__card" key={title}><img src={image} alt="" loading="lazy" /><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div></section>

      <section className="about" id="sobre"><div className="section-shell about__layout"><div className="about__copy"><p className="eyebrow">Quem somos</p><h2>Trabalho de verdade. Decisão técnica em cada entrega.</h2><p>A CKF nasceu para atender operações que não podem esperar. Nossa equipe soma experiência de campo, estrutura e atenção ao detalhe para entregar manutenção pesada com segurança.</p><p className="about__signature">Sócios fundadores · CKF Manutenção</p></div><div className="about__portraits" aria-label="Sócios fundadores da CKF Manutenção"><img className="about__portrait about__portrait--left" src="/assets/fundador-ckf-premium.webp" alt="Sócio fundador da CKF Manutenção" loading="lazy" /><img className="about__portrait about__portrait--right" src="/assets/socio-ckf.webp" alt="Sócio fundador da CKF Manutenção" loading="lazy" /></div></div></section>

      <section className="cost"><img src="/assets/real/oficina-real.webp" alt="Profissional da CKF trabalhando em uma oficina" loading="lazy" /><div className="section-shell cost__copy"><p className="eyebrow">O custo da parada</p><h2>Quando a operação para, <em>o custo cresce.</em></h2><p>Produção perdida, prazo pressionado e equipe parada. Manutenção bem conduzida reduz incerteza e devolve previsibilidade ao seu trabalho.</p></div></section>

      <section className="process" id="processo"><div className="section-shell"><p className="eyebrow">Nosso processo</p><h2>Da primeira conversa ao retorno da operação.</h2><div className="process__track">{process.map(([Icon, number, title, text]) => <article className="process__step" key={number}><div className="process__icon"><Icon aria-hidden="true" /></div><span className="process__number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div></div></section>

      <section className="trust"><img src="/assets/real/equipe-central-ai-enhanced.webp" alt="Equipe da CKF executando serviço em central de concreto" loading="lazy" /><div className="section-shell trust__copy"><p className="eyebrow">Trabalho que sustenta</p><h2>Gente que resolve.<br />Do jeito certo.</h2><p>Equipe especializada, trabalho de verdade e foco total no que importa: sua operação funcionando com segurança.</p></div></section>

      <section className="location" id="localizacao"><div className="section-shell location__card"><img src="/assets/real/fachada-real.webp" alt="Fachada da unidade da CKF Manutenção" loading="lazy" /><div className="location__copy"><p className="eyebrow">Nossa unidade</p><h2>Venha conversar com a equipe.</h2><address><FaLocationDot aria-hidden="true" /><span>Rodovia BR-101, 6780<br />Galpão 01, Sala 01 · Espinheiros<br />Itajaí · SC · 88317-000</span></address><a className="button" href={MAPS} target="_blank" rel="noreferrer"><FaMapLocationDot /> Abrir rota no Maps</a></div></div></section>

      <section className="contact" id="contato"><div className="section-shell contact__wrap"><div><FaWhatsapp className="contact__icon" aria-hidden="true" /><div><h2>Sua operação não pode esperar.</h2><p>Fale com a CKF, explique o cenário e receba um retorno direto pelo WhatsApp.</p></div></div><a className="button" href={WHATSAPP} target="_blank" rel="noreferrer" data-cta-source="contact"><FaWhatsapp /> Pedir orçamento</a></div></section>

      <footer><div className="footer__inner section-shell"><div><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /><p>Soluções em manutenção geral para caminhões, máquinas, concreto, equipamentos e estruturas.</p></div><div><h3>Fale com a gente</h3><a href={buildWhatsAppUrl()} target="_blank" rel="noreferrer" data-cta-source="footer-primary" data-contact="primary"><FaWhatsapp /> {CONTACTS.primary.label}</a><a href={buildWhatsAppUrl({ contact: 'secondary' })} target="_blank" rel="noreferrer" data-cta-source="footer-secondary" data-contact="secondary"><FaWhatsapp /> {CONTACTS.secondary.label}</a><p>Atendimento rápido pelo WhatsApp.</p></div><div><h3>Manutenção geral</h3><p>Suspensão · Solda · Preventiva · Freios<br />Hidráulica · Reforma · Pintura · Embreagem</p></div></div></footer>
    </main>
  )
}