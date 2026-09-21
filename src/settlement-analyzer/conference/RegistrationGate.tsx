'use client'

import { useRef, useState } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Locale } from '@/lib/i18n'
import { href } from '@/lib/paths'
import { Logo } from '@/components/layout/Logo'
import { sa } from '../copy'
import { ORGANIZATION_TYPES, ORGANIZATION_TYPE_EN } from './constants'
import { trackEvent } from './tracking'

type Props = {
  locale: Locale
  previewMode?: boolean
  onCompleted: (fullName: string) => void
}

const REGISTRATION_FLAG = 'conference_registration_completed'

export function RegistrationGate({ locale, previewMode = false, onCompleted }: Props) {
  const copy = sa(locale)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const started = useRef(false)

  const markStarted = () => {
    if (started.current) return
    started.current = true
    void trackEvent('registration_started')
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')
    const data = new FormData(event.currentTarget)
    const payload = {
      locale,
      fullName: data.get('fullName'),
      email: data.get('email'),
      companyName: data.get('companyName'),
      organizationType: data.get('organizationType'),
      marketingConsent: data.get('marketingConsent') === 'on',
    }
    if (previewMode) {
      onCompleted(String(payload.fullName || copy.testUser))
      return
    }
    setSubmitting(true)
    try {
      const response = await fetch('/api/settlement-analyzer/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await response.json() as { error?: string; fullName?: string }
      if (!response.ok) throw new Error(result.error || copy.registerError)
      localStorage.setItem(REGISTRATION_FLAG, '1')
      onCompleted(result.fullName || String(payload.fullName))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : copy.registerError)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="welcome-shell">
      <section className="registration-card" aria-labelledby="registration-title">
        {previewMode && <div className="owner-preview-note">{copy.ownerPreview}</div>}
        <div className="registration-brand">
          <Logo locale={locale} layout="compact" />
        </div>
        <h1 id="registration-title">{copy.welcomeTitle}</h1>
        <p className="registration-lead">{copy.welcomeLead}</p>
        <form onSubmit={submit} onFocus={markStarted}>
          <label><span className="field-label">{copy.fullName} <span className="required-mark">*</span></span><input name="fullName" required minLength={3} maxLength={120} autoComplete="name" /></label>
          <label><span className="field-label">{copy.email} <span className="required-mark">*</span></span><input name="email" type="email" required maxLength={180} autoComplete="email" inputMode="email" /></label>
          <label><span className="field-label">{copy.organisation} <span className="required-mark">*</span></span><input name="companyName" required minLength={2} maxLength={160} autoComplete="organization" /></label>
          <label><span className="field-label">{copy.organisationType} <span className="required-mark">*</span></span>
            <select name="organizationType" required defaultValue="">
              <option value="" disabled>{copy.organisationTypePlaceholder}</option>
              {ORGANIZATION_TYPES.map((option) => (
                <option key={option} value={option}>{locale === "en" ? ORGANIZATION_TYPE_EN[option] : option}</option>
              ))}
            </select>
          </label>
          <label className="consent-row"><input name="marketingConsent" type="checkbox" /><span>{copy.marketingConsent}</span></label>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="registration-submit" type="submit" disabled={submitting}>
            {submitting ? <span className="spinner spinner--light" /> : null}
            {submitting ? copy.submitting : copy.submit} <ArrowRight />
          </button>
        </form>
        <p className="privacy-notice">{copy.privacyNoticeBefore} <a href={href(locale, 'settlement-analyzer', 'privacy')}>{copy.privacyPolicy}</a>.</p>
      </section>
    </main>
  )
}
