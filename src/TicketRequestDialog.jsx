import { useEffect, useMemo, useRef, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaCheck, FaWhatsapp, FaXmark } from 'react-icons/fa6'
import { SERVICE_PAGES } from '../service-pages.mjs'
import { trackEvent } from './analytics.js'
import {
  buildTicketPayload,
  buildTicketWhatsAppUrl,
  createIdempotencyKey,
  readTicketAttribution,
  submitTicket,
} from './ticket-request.js'
import './ticket-request.css'

const INITIAL_FORM = Object.freeze({equipmentType:'',equipmentBrand:'',equipmentModel:'',companyName:'',contactName:'',phone:'',email:'',city:'',uf:'SC',description:'',urgency:'',website:''})
const pagePath = () => globalThis.location?.pathname || '/'
const digits = (value) => value.replace(/\D/g, '')

function validateStep(step, serviceSlug, form) {
  if (step === 1) {
    if (!serviceSlug) return 'Escolha o tipo de serviço.'
    if (form.equipmentType.trim().length < 2) return 'Informe qual equipamento precisa de atendimento.'
  }
  if (step === 2) {
    if (form.contactName.trim().length < 2) return 'Informe seu nome.'
    const phone = digits(form.phone)
    if (phone.length < 10 || phone.length > 13) return 'Informe um WhatsApp válido com DDD.'
    if (form.city.trim().length < 2) return 'Informe a cidade do atendimento.'
    if (!/^[A-Za-z]{2}$/.test(form.uf.trim())) return 'Informe a UF com duas letras.'
  }
  if (step === 3) {
    if (form.description.trim().length < 5) return 'Conte brevemente o que está acontecendo.'
    if (!form.urgency) return 'Selecione a urgência do atendimento.'
  }
  return ''
}

export function TicketRequestDialog({ open, source = 'unknown', initialServiceSlug = '', onClose }) {
  const dialogRef = useRef(null)
  const [step, setStep] = useState(1)
  const [serviceSlug, setServiceSlug] = useState(initialServiceSlug)
  const [form, setForm] = useState(() => ({ ...INITIAL_FORM }))
  const [idempotencyKey, setIdempotencyKey] = useState(() => createIdempotencyKey())
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const service = useMemo(() => SERVICE_PAGES.find((item) => item.slug === serviceSlug) ?? null, [serviceSlug])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    setStep(1)
    setServiceSlug(initialServiceSlug || '')
    setForm({ ...INITIAL_FORM })
    setError('')
    setSubmitting(false)
    setIdempotencyKey(createIdempotencyKey())
    trackEvent('ticket_form_open', { page: pagePath(), serviceSlug: initialServiceSlug, ctaSource: source })
  }, [open, initialServiceSlug, source])

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    if (error) setError('')
  }

  function nextStep() {
    const validationError = validateStep(step, serviceSlug, form)
    if (validationError) { setError(validationError); return }
    trackEvent('ticket_step_complete', { page: pagePath(), serviceSlug, ctaSource: source, step })
    setError('')
    setStep((current) => Math.min(3, current + 1))
  }

  function previousStep() {
    setError('')
    setStep((current) => Math.max(1, current - 1))
  }

  function closeDialog() {
    if (submitting) return
    trackEvent('ticket_close', { page: pagePath(), serviceSlug, ctaSource: source, step, status: 'dismissed' })
    dialogRef.current?.close()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateStep(3, serviceSlug, form)
    if (validationError) { setError(validationError); return }
    if (!service) { setError('Escolha o tipo de serviço.'); setStep(1); return }

    setSubmitting(true)
    setError('')
    trackEvent('ticket_submit', { page: pagePath(), serviceSlug, ctaSource: source, step: 3 })

    try {
      const attribution = readTicketAttribution({ ctaSource: source })
      const payload = buildTicketPayload({ service, form, attribution, idempotencyKey })
      const { publicId } = await submitTicket(payload)
      trackEvent('ticket_success', { page: pagePath(), serviceSlug, ctaSource: source, status: 'success' })
      const whatsappUrl = buildTicketWhatsAppUrl({publicId,serviceName:service.ctaService || service.cardTitle,equipmentType:form.equipmentType,description:form.description,urgency:form.urgency})
      globalThis.location.assign(whatsappUrl)
    } catch (submitError) {
      trackEvent('ticket_error', { page: pagePath(), serviceSlug, ctaSource: source, status: String(submitError?.status || submitError?.name || 'error') })
      if (submitError?.name === 'AbortError') setError('A conexão demorou mais que o esperado. Tente enviar novamente.')
      else if (submitError?.status === 429) setError('Recebemos muitas solicitações em pouco tempo. Aguarde um pouco e tente novamente.')
      else setError(submitError?.message || 'Não foi possível registrar sua Solicitação. Tente novamente.')
      setSubmitting(false)
    }
  }

  return (
    <dialog className="ticket-dialog" ref={dialogRef} aria-labelledby="ticket-dialog-title" onCancel={(event) => { event.preventDefault(); closeDialog() }} onClose={() => onClose?.()}>
      <form className="ticket-form" onSubmit={handleSubmit}>
        <div className="ticket-form__header"><div><p className="eyebrow">Solicitação CKF</p><h2 id="ticket-dialog-title">Conte o essencial. A equipe assume daqui.</h2></div><button className="ticket-form__close" type="button" aria-label="Fechar Solicitação" onClick={closeDialog} disabled={submitting}><FaXmark aria-hidden="true" /></button></div>
        <ol className="ticket-progress" aria-label="Progresso da Solicitação">{[1,2,3].map((item) => <li className={item <= step ? 'is-active' : ''} key={item} aria-current={item === step ? 'step' : undefined}><span>{item < step ? <FaCheck aria-hidden="true" /> : item}</span>{item === 1 ? 'Serviço' : item === 2 ? 'Contato' : 'Cenário'}</li>)}</ol>

        {step === 1 && <fieldset><legend>O que precisa de atendimento?</legend><label>Serviço<select value={serviceSlug} onChange={(event) => setServiceSlug(event.target.value)} required><option value="">Selecione</option>{SERVICE_PAGES.map((item) => <option key={item.slug} value={item.slug}>{item.cardTitle}</option>)}</select></label><label>Equipamento<input name="equipmentType" value={form.equipmentType} onChange={updateField} placeholder="Ex.: caminhão, betoneira, central, máquina" autoComplete="off" required /></label><div className="ticket-form__grid ticket-form__grid--2"><label>Marca <span>opcional</span><input name="equipmentBrand" value={form.equipmentBrand} onChange={updateField} placeholder="Ex.: Volvo" autoComplete="off" /></label><label>Modelo <span>opcional</span><input name="equipmentModel" value={form.equipmentModel} onChange={updateField} placeholder="Ex.: FH 540" autoComplete="off" /></label></div></fieldset>}
        {step === 2 && <fieldset><legend>Como a CKF fala com você?</legend><div className="ticket-form__grid ticket-form__grid--2"><label>Seu nome<input name="contactName" value={form.contactName} onChange={updateField} autoComplete="name" required /></label><label>WhatsApp<input name="phone" value={form.phone} onChange={updateField} inputMode="tel" autoComplete="tel" placeholder="(47) 99999-9999" required /></label></div><div className="ticket-form__grid ticket-form__grid--2"><label>Cidade<input name="city" value={form.city} onChange={updateField} autoComplete="address-level2" required /></label><label>UF<input name="uf" value={form.uf} onChange={updateField} maxLength={2} autoComplete="address-level1" required /></label></div><div className="ticket-form__grid ticket-form__grid--2"><label>Empresa <span>opcional</span><input name="companyName" value={form.companyName} onChange={updateField} autoComplete="organization" /></label><label>E-mail <span>opcional</span><input name="email" value={form.email} onChange={updateField} type="email" autoComplete="email" /></label></div></fieldset>}
        {step === 3 && <fieldset><legend>O que está acontecendo?</legend><label>Situação do equipamento<select name="urgency" value={form.urgency} onChange={updateField} required><option value="">Selecione</option><option value="parado">Operação parada</option><option value="urgente">Funcionando, mas é urgente</option><option value="programavel">Pode ser programado</option><option value="preventiva">Quero planejar preventiva</option></select></label><label>Descreva o problema<textarea name="description" value={form.description} onChange={updateField} rows={5} placeholder="Ex.: perdeu pressão hidráulica, surgiu trinca no chassis, central está com falha..." required /></label><label className="ticket-honeypot" aria-hidden="true">Website<input name="website" value={form.website} onChange={updateField} tabIndex={-1} autoComplete="off" /></label></fieldset>}
        {error && <p className="ticket-form__error" role="alert">{error}</p>}
        <div className="ticket-form__actions">{step > 1 && <button className="ticket-form__secondary" type="button" onClick={previousStep} disabled={submitting}><FaArrowLeft /> Voltar</button>}{step < 3 ? <button className="button" type="button" onClick={nextStep}>Continuar <FaArrowRight /></button> : <button className="button" type="submit" disabled={submitting}>{submitting ? 'Registrando...' : <><FaWhatsapp /> Registrar e continuar no WhatsApp</>}</button>}</div>
        <p className="ticket-form__privacy">Seus dados serão usados para responder esta Solicitação e preparar o atendimento ou orçamento. <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</p>
      </form>
    </dialog>
  )
}
