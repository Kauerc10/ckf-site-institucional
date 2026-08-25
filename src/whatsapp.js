export const CONTACTS = Object.freeze({
  primary: Object.freeze({
    phone: '5547991214232',
    label: '(47) 99121-4232',
  }),
  secondary: Object.freeze({
    phone: '5547999130409',
    label: '(47) 99913-0409',
  }),
})

const DEFAULT_MESSAGE = 'Olá! Vim pelo site da CKF Manutenção e gostaria de solicitar um orçamento.'

export function buildWhatsAppMessage({ service } = {}) {
  const normalizedService = service?.trim()

  if (!normalizedService) {
    return DEFAULT_MESSAGE
  }

  return `Olá! Vim pelo site da CKF Manutenção e gostaria de solicitar um orçamento para ${normalizedService}.`
}

export function buildWhatsAppUrl({ contact = 'primary', service } = {}) {
  const selectedContact = CONTACTS[contact]

  if (!selectedContact) {
    throw new Error(`Contato do WhatsApp desconhecido: ${contact}`)
  }

  const message = buildWhatsAppMessage({ service })

  return `https://wa.me/${selectedContact.phone}?text=${encodeURIComponent(message)}`
}
