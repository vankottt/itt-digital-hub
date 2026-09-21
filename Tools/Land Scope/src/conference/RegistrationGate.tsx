import { useRef, useState } from 'react'
import { ArrowRight, Building2, CheckCircle2, FileDown, MapPinned, ShieldCheck } from 'lucide-react'
import { ORGANIZATION_TYPES } from './constants'
import { trackEvent } from './tracking'

type Props = {
  previewMode?: boolean
  onCompleted: (fullName: string) => void
}

export function RegistrationGate({ previewMode = false, onCompleted }: Props) {
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [trackingWarning, setTrackingWarning] = useState('')
  const started = useRef(false)

  const markStarted = () => {
    if (started.current) return
    started.current = true
    void trackEvent('registration_started').then((recorded) => {
      if (!recorded) setTrackingWarning('Можете да продължите. Статистиката временно не се записва.')
    })
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const payload = {
      fullName: data.get('fullName'),
      email: data.get('email'),
      companyName: data.get('companyName'),
      organizationType: data.get('organizationType'),
      marketingConsent: data.get('marketingConsent') === 'on',
    }
    if (previewMode) {
      onCompleted(String(payload.fullName || 'Тестов потребител'))
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('/api/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json() as { error?: string; fullName?: string }
      if (!response.ok) throw new Error(result.error || 'Регистрацията не беше записана.')
      localStorage.setItem('conference_registration_completed', '1')
      onCompleted(result.fullName || String(payload.fullName))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Регистрацията не беше записана. Моля, опитайте отново.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="welcome-shell">
      <section className="welcome-intro">
        <div className="welcome-brand"><span><MapPinned /></span> Анализатор на населени места</div>
        <div className="welcome-copy">
          <h1>Оценете застроената зона на населено място.</h1>
          <p>Изберете населено място и получете ориентировъчна граница, площи, сгради и улици от отворени данни.</p>
          <ul>
            <li><CheckCircle2 /> Автоматично определена застроена зона</li>
            <li><Building2 /> Сгради, улици, земеползване и ключови показатели</li>
            <li><FileDown /> CSV и GeoJSON за последваща работа</li>
          </ul>
        </div>
        <div className="welcome-trust"><ShieldCheck /> Идея: др. Станислав Дарачев, реализация ITT Digital Hub</div>
      </section>

      <section className="registration-card" aria-labelledby="registration-title">
        {previewMode && <div className="owner-preview-note">Тестов режим за собственик — данните няма да бъдат записани.</div>}
        <h2 id="registration-title">Моля, въведете вашите данни</h2>
        <p className="registration-lead">Формата отнема под минута и не изисква ChatGPT профил.</p>
        <form onSubmit={submit} onFocus={markStarted}>
          <label><span className="field-label">Име и фамилия <span className="required-mark">*</span></span><input name="fullName" required minLength={3} maxLength={120} autoComplete="name" /></label>
          <label><span className="field-label">Служебен email <span className="required-mark">*</span></span><input name="email" type="email" required maxLength={180} autoComplete="email" inputMode="email" /></label>
          <label><span className="field-label">Организация / фирма <span className="required-mark">*</span></span><input name="companyName" required minLength={2} maxLength={160} autoComplete="organization" /></label>
          <label><span className="field-label">Тип организация <span className="required-mark">*</span></span>
            <select name="organizationType" required defaultValue="">
              <option value="" disabled>Изберете тип организация</option>
              {ORGANIZATION_TYPES.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="consent-row"><input name="marketingConsent" type="checkbox" /><span>Желая да получавам информация за нови инструменти, услуги и професионални събития.</span></label>
          {trackingWarning && <div className="form-warning" role="status">{trackingWarning}</div>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="registration-submit" type="submit" disabled={submitting}>
            {submitting ? <span className="spinner spinner--light" /> : null}
            {submitting ? 'Записване...' : 'Към анализатора'} <ArrowRight />
          </button>
        </form>
        <p className="privacy-notice">С изпращането приемате <a href="/privacy">Политиката за поверителност</a>. Маркетинговото поле е отделно и по избор.</p>
      </section>
    </main>
  )
}
