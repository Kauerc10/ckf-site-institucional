import { useEffect, useMemo, useRef, useState } from 'react'
import { FaWhatsapp, FaXmark } from 'react-icons/fa6'
import { SERVICE_PAGES } from '../service-pages.mjs'
import { trackEvent, trackEventAndWait } from './analytics.js'
import { buildTicketPayload, buildTicketWhatsAppUrl, createIdempotencyKey, readTicketAttribution, submitTicket } from './ticket-request.js'
import './ticket-request.css'

const INITIAL_FORM = Object.freeze({
  equipmentType: '', equipmentBrand: '', equipmentModel: '', companyName: '',
  contactName: '', phone: '', email: '', city: '', uf: '', description: '',
  urgency: 'a combinar', website: '',
})
const pagePath = () => globalThis.location?.pathname || '/'
const digits = (value) => value.replace(/\D/g, '')

function validateForm(serviceSlug, form) {
  if (!serviceSlug) return 'Escolha o serviço mais próximo do que você precisa.'
  if (form.description.trim().length < 5) return 'Conte brevemente o que precisa de atendimento.'
  if (form.contactName.trim().length < 2) return 'Informe seu nome.'
  const phone = digits(form.phone)
  if (phone.length < 10 || phone.length > 13) return 'Informe um WhatsApp válido com DDD.'
  if (form.uf && !/^[A-Za-z]{2}$/.test(form.uf.trim())) return 'Informe a UF com duas letras ou deixe em branco.'
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) return 'Informe um e-mail válido ou deixe em branco.'
  return ''
}

export function TicketRequestDialog({ open, source = 'unknown', initialServiceSlug = '', onClose }) {
  const dialogRef = useRef(null)
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

  function closeDialog() {
    if (submitting) return
    trackEvent('ticket_close', { page: pagePath(), serviceSlug, ctaSource: source, status: 'dismissed' })
    dialogRef.current?.close()
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const validationError = validateForm(serviceSlug, form)
    if (validationError) { setError(validationError); return }
    if (!service) { setError('Escolha o tipo de serviço.'); return }

    setSubmitting(true)
    setError('')
    trackEvent('ticket_submit', { page: pagePath(), serviceSlug, ctaSource: source })
    try {
      const attribution = readTicketAttribution({ ctaSource: source })
      const payload = buildTicketPayload({ service, form, attribution, idempotencyKey })
      const { publicId } = await submitTicket(payload)
      await trackEventAndWait('ticket_success', { page: pagePath(), serviceSlug, ctaSource: source, status: 'success' })
      const whatsappUrl = buildTicketWhatsAppUrl({
        publicId, serviceName: service.ctaService || service.cardTitle,
        equipmentType: form.equipmentType, description: form.description, urgency: form.urgency,
      })
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
      <form className="ticket-form" onSubmit={handleSubmit} noValidate>
        <div className="ticket-form__header">
          <div><p className="eyebrow">Solicitação CKF</p><h2 id="ticket-dialog-title">Conte o essencial.</h2><p>A equipe continua com você pelo WhatsApp.</p></div>
          <button className="ticket-form__close" type="button" aria-label="Fechar Solicitação" onClick={closeDialog} disabled={submitting}><FaXmark aria-hidden="true" /></button>
        </div>
        <div className="ticket-form__fields">
          <label>Qual serviço você precisa?
            <select value={serviceSlug} onChange={(event) => { setServiceSlug(event.target.value); setError('') }} required>
              <option value="">Escolha o mais próximo</option>
              {SERVICE_PAGES.map((item) => <option key={item.slug} value={item.slug}>{item.cardTitle}</option>)}
            </select>
          </label>
          <label>O que está acontecendo?
            <textarea name="description" value={form.description} onChange={updateField} rows={3} placeholder="Ex.: caminhão parado com falha hidráulica" required />
          </label>
          <div className="ticket-form__grid ticket-form__grid--2">
            <label>Seu nome<input name="contactName" value={form.contactName} onChange={updateField} autoComplete="name" placeholder="Como podemos chamar você?" required /></label>
            <label>WhatsApp com DDD<input name="phone" value={form.phone} onChange={updateField} type="tel" inputMode="tel" autoComplete="tel" placeholder="(47) 99999-9999" required /></label>
          </div>
          <details className="ticket-form__extras">
            <summary>Adicionar detalhes (opcional)</summary>
            <div className="ticket-form__extras-fields">
              <label>Urgência<select name="urgency" value={form.urgency} onChange={updateField}><option value="a combinar">A combinar</option><option value="parado">Operação parada</option><option value="urgente">Funcionando, mas é urgente</option><option value="programavel">Pode ser programado</option><option value="preventiva">Quero planejar preventiva</option></select></label>
              <div className="ticket-form__grid ticket-form__grid--2"><label>Equipamento<input name="equipmentType" value={form.equipmentType} onChange={updateField} placeholder="Ex.: betoneira" /></label><label>Cidade<input name="city" value={form.city} onChange={updateField} autoComplete="address-level2" /></label></div>
              <div className="ticket-form__grid ticket-form__grid--2"><label>UF<input name="uf" value={form.uf} onChange={updateField} maxLength={2} autoComplete="address-level1" placeholder="SC" /></label><label>Empresa<input name="companyName" value={form.companyName} onChange={updateField} autoComplete="organization" /></label></div>
              <div className="ticket-form__grid ticket-form__grid--2"><label>Marca<input name="equipmentBrand" value={form.equipmentBrand} onChange={updateField} placeholder="Ex.: Volvo" /></label><label>Modelo<input name="equipmentModel" value={form.equipmentModel} onChange={updateField} placeholder="Ex.: FH 540" /></label></div>
              <label>E-mail<input name="email" value={form.email} onChange={updateField} type="email" autoComplete="email" /></label>
            </div>
          </details>
          <label className="ticket-honeypot" aria-hidden="true">Website<input name="website" value={form.website} onChange={updateField} tabIndex={-1} autoComplete="off" /></label>
        </div>
        <div className="ticket-form__footer">
          {error && <p className="ticket-form__error" role="alert">{error}</p>}
          <button className="button ticket-form__submit" type="submit" disabled={submitting}><FaWhatsapp aria-hidden="true" /> {submitting ? 'Registrando...' : 'Registrar e continuar no WhatsApp'}</button>
          <p className="ticket-form__privacy">Ao enviar, você declara estar ciente da nossa <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a> e da <a href="/marketing" target="_blank" rel="noreferrer">Política de Comunicações e Marketing</a>.</p>
        </div>
      </form>
    </dialog>
  )
}
