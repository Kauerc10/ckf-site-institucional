window.va = window.va || function () {
  ;(window.vaq = window.vaq || []).push(arguments)
}

;(function initCkfAnalytics() {
  const MEASUREMENT_ID = 'G-46ZTK5JDFX'
  const STORAGE_KEY = 'ckf:analytics-consent:v1'
  const GRANTED = 'granted'
  const DENIED = 'denied'

  window.dataLayer = window.dataLayer || []
  window.gtag = window.gtag || function () {
    window.dataLayer.push(arguments)
  }

  function gtag() {
    window.gtag.apply(window, arguments)
  }

  const deniedConsent = {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  }

  const grantedAnalyticsConsent = {
    analytics_storage: 'granted',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  }

  gtag('consent', 'default', deniedConsent)

  let consentChoice = readStoredChoice()
  let googleTagLoaded = false

  function readStoredChoice() {
    try {
      const value = window.localStorage.getItem(STORAGE_KEY)
      return value === GRANTED || value === DENIED ? value : null
    } catch {
      return null
    }
  }

  function persistChoice(value) {
    consentChoice = value
    try {
      window.localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // A preferência continua válida nesta navegação mesmo sem storage persistente.
    }
  }

  function loadGoogleTag() {
    if (googleTagLoaded || document.querySelector('script[data-ckf-google-tag]')) {
      googleTagLoaded = true
      return
    }

    googleTagLoaded = true
    gtag('js', new Date())
    gtag('config', MEASUREMENT_ID, {
      send_page_view: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    })

    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(MEASUREMENT_ID)}`
    script.dataset.ckfGoogleTag = MEASUREMENT_ID
    document.head.appendChild(script)
  }

  function applyChoice(value, { persist = true } = {}) {
    if (persist) persistChoice(value)
    else consentChoice = value

    if (value === GRANTED) {
      gtag('consent', 'update', grantedAnalyticsConsent)
      loadGoogleTag()
      return
    }

    gtag('consent', 'update', deniedConsent)

    if (googleTagLoaded) {
      window.location.reload()
    }
  }

  function removeBanner() {
    document.getElementById('ckf-analytics-consent')?.remove()
  }

  function makeElement(tag, className, text) {
    const element = document.createElement(tag)
    if (className) element.className = className
    if (text) element.textContent = text
    return element
  }

  function showPreferences({ focusAction = false } = {}) {
    removeBanner()

    const panel = makeElement('aside', 'analytics-consent')
    panel.id = 'ckf-analytics-consent'
    panel.setAttribute('role', 'dialog')
    panel.setAttribute('aria-labelledby', 'ckf-analytics-consent-title')
    panel.setAttribute('aria-describedby', 'ckf-analytics-consent-copy')

    const content = makeElement('div', 'analytics-consent__content')
    const eyebrow = makeElement('p', 'analytics-consent__eyebrow', 'Cookies')
    const title = makeElement('h2', 'analytics-consent__title', 'Cookies e privacidade')
    title.id = 'ckf-analytics-consent-title'
    const copy = makeElement(
      'p',
      'analytics-consent__copy',
      'Usamos tecnologias essenciais para o funcionamento do site e a Vercel para métricas operacionais. Com sua autorização, também usamos cookies do Google Analytics para entender o uso do site. Recusar cookies opcionais não afeta o envio de Solicitações.',
    )
    copy.id = 'ckf-analytics-consent-copy'

    const policy = makeElement('a', 'analytics-consent__policy', 'Política de Privacidade')
    policy.href = '/privacidade'

    const actions = makeElement('div', 'analytics-consent__actions')
    const reject = makeElement('button', 'analytics-consent__action analytics-consent__action--secondary', 'Rejeitar opcionais')
    reject.type = 'button'
    const accept = makeElement('button', 'analytics-consent__action analytics-consent__action--primary', 'Aceitar todos')
    accept.type = 'button'

    reject.addEventListener('click', () => {
      applyChoice(DENIED)
      removeBanner()
    })
    accept.addEventListener('click', () => {
      applyChoice(GRANTED)
      removeBanner()
    })

    actions.append(reject, accept)
    content.append(eyebrow, title, copy, policy, actions)
    panel.append(content)
    document.body.append(panel)

    if (focusAction) window.requestAnimationFrame?.(() => accept.focus())
  }

  function mountPreferenceControl() {
    const policies = document.querySelector('.footer__policies')
    if (!policies || policies.querySelector('.analytics-consent__manage')) return

    const separator = makeElement('span', '', '·')
    separator.setAttribute('aria-hidden', 'true')
    const button = makeElement('button', 'analytics-consent__manage', 'Preferências de cookies')
    button.type = 'button'
    button.addEventListener('click', () => showPreferences({ focusAction: true }))
    policies.append(separator, button)
  }

  window.ckfGoogleAnalytics = {
    measurementId: MEASUREMENT_ID,
    getConsent() {
      return consentChoice
    },
    openPreferences() {
      showPreferences({ focusAction: true })
    },
    track(name, data) {
      if (consentChoice !== GRANTED || typeof name !== 'string' || !name) return
      gtag('event', name, data || {})
    },
  }

  if (consentChoice === GRANTED) applyChoice(GRANTED, { persist: false })
  else if (consentChoice === DENIED) applyChoice(DENIED, { persist: false })

  function mountConsentUi() {
    mountPreferenceControl()
    if (consentChoice === null) showPreferences({ focusAction: true })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountConsentUi, { once: true })
  } else {
    mountConsentUi()
  }
})()
