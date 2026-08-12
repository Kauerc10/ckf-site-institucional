import {
  FaWhatsapp,
  FaTruck,
  FaIndustry,
  FaBuilding,
  FaWrench,
  FaMagnifyingGlass,
  FaComments,
  FaScrewdriverWrench,
} from 'react-icons/fa6'
import './styles.css'

const WHATSAPP = 'https://wa.me/5547991214232?text=Olá%2C%20gostaria%20de%20solicitar%20um%20orçamento.'

const services = [
  { title: 'Caminhões e máquinas pesadas', image: '/assets/hero-truck.png', anchor: 'caminhoes' },
  { title: 'Central de concreto', image: '/assets/central-concreto.png', anchor: 'concreto' },
  { title: 'Reforma de equipamentos e chassis', image: '/assets/solda-chassi.png', anchor: 'reforma' },
  { title: 'Estruturas metálicas', image: '/assets/estruturas-metalicas.png', anchor: 'estruturas' },
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
        <a className="brand" href="#inicio" aria-label="CKF Manutenção - Início">
          <img src="/assets/logo-ckf.png" alt="CKF Manutenção" />
        </a>
        <nav aria-label="Navegação principal">
          <a href="#servicos">Serviços</a>
          <a href="#sobre">Quem somos</a>
          <a href="#processo">Como trabalhamos</a>
          <a href="#contato">Contato</a>
        </nav>
        <a className="button button--small" href={WHATSAPP} target="_blank" rel="noreferrer"><FaWhatsapp /> Pedir orçamento</a>
      </header>

      <section className="hero" id="inicio">
        <img src="/assets/hero-truck.png" alt="Técnico realizando manutenção em caminhão pesado" />
        <div className="hero__content">
          <p className="eyebrow">CKF Manutenção</p>
          <h1>Sua operação<br />precisa continuar.</h1>
          <p>Manutenção especializada para manter caminhões, máquinas e equipamentos em movimento.</p>
          <a className="button" href={WHATSAPP} target="_blank" rel="noreferrer"><FaWhatsapp /> Solicitar orçamento</a>
        </div>
      </section>

      <section className="audience" aria-labelledby="audience-title">
        <div className="section-shell">
          <h2 id="audience-title">Quem confia, não para.</h2>
          <div className="audience__items">
            {audiences.map(([Icon, label]) => <div className="audience__item" key={label}><Icon aria-hidden="true" /><span>{label}</span></div>)}
          </div>
        </div>
      </section>

      <section className="services section-shell" id="servicos">
        <div className="services__intro">
          <p className="eyebrow">Para cada desafio</p>
          <h2>Soluções completas para operações pesadas.</h2>
          <p>Atuamos onde sua operação mais precisa: manutenção industrial pesada com equipe, estrutura e responsabilidade.</p>
        </div>
        <div className="service-grid">
          {services.map((service, index) => <a className="service-card" key={service.title} href={WHATSAPP} target="_blank" rel="noreferrer" aria-label={`Solicitar orçamento para ${service.title}`}>
            <img src={service.image} alt="" />
            <span className="service-card__number">0{index + 1}</span>
            <h3>{service.title}</h3>
          </a>)}
        </div>
      </section>

      <section className="cost" id="sobre">
        <img src="/assets/hero-truck.png" alt="Manutenção detalhada em motor de equipamento pesado" />
        <div className="section-shell cost__copy">
          <p className="eyebrow">O impacto da parada</p>
          <h2>Equipamento parado <em>custa alto.</em></h2>
          <p>Cada hora parada é perda de produção, atraso na entrega e desgaste da equipe. Manutenção certa é investimento que volta em produtividade.</p>
        </div>
      </section>

      <section className="process" id="processo">
        <div className="section-shell">
          <p className="eyebrow">Nosso processo</p>
          <h2>Da primeira conversa ao retorno da operação.</h2>
          <div className="process__track">
            {process.map(([Icon, number, title, text]) => <article className="process__step" key={number}>
              <div className="process__icon"><Icon aria-hidden="true" /></div>
              <span className="process__number">{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section className="trust">
        <img src="/assets/solda-chassi.png" alt="Profissional realizando solda em chassis industrial" />
        <div className="section-shell trust__copy">
          <p className="eyebrow">Trabalho que sustenta</p>
          <h2>Gente que resolve.<br />Do jeito certo.</h2>
          <p>Equipe especializada, trabalho de verdade e foco total no que importa: sua operação funcionando com segurança.</p>
        </div>
      </section>

      <section className="contact" id="contato">
        <div className="section-shell contact__wrap">
          <div><FaWhatsapp className="contact__icon" aria-hidden="true" /><div><h2>Precisou? Chama no WhatsApp.</h2><p>Fale agora com a CKF e receba seu orçamento rápido.</p></div></div>
          <a className="button" href={WHATSAPP} target="_blank" rel="noreferrer"><FaWhatsapp /> Pedir orçamento</a>
        </div>
      </section>

      <footer>
        <div className="footer__inner section-shell">
          <div><img src="/assets/logo-ckf.png" alt="CKF Manutenção" /><p>Soluções em manutenção geral para caminhões, máquinas, concreto, equipamentos e estruturas.</p></div>
          <div><h3>Fale com a gente</h3><a href={WHATSAPP} target="_blank" rel="noreferrer"><FaWhatsapp /> (47) 99121-4232</a><a href={WHATSAPP} target="_blank" rel="noreferrer"><FaWhatsapp /> (47) 99913-0409</a><p>Atendimento rápido pelo WhatsApp.</p></div>
          <div><h3>Manutenção geral</h3><p>Suspensão · Solda · Preventiva · Freios<br />Hidráulica · Reforma · Pintura · Embreagem</p></div>
        </div>
      </footer>
    </main>
  )
}
