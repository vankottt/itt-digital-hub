import { useState } from 'react'
import { ArrowLeft, ArrowRight, Check, X } from 'lucide-react'
import { CONTACT_INTERESTS, EMPLOYEE_RANGES, PAIN_POINTS, PROJECT_TIMELINES, USE_CASES } from './constants'
import { trackEvent } from './tracking'

type Props = { onClose: () => void; onCompleted: () => void }

export function ProfileQuestionnaire({ onClose, onCompleted }: Props) {
  const [step, setStep] = useState(0)
  const [employeeRange, setEmployeeRange] = useState('')
  const [useCases, setUseCases] = useState<string[]>([])
  const [painPoints, setPainPoints] = useState<string[]>([])
  const [projectTimeline, setProjectTimeline] = useState('')
  const [contactInterest, setContactInterest] = useState('')
  const [phone, setPhone] = useState('')
  const [jobRole, setJobRole] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const totalSteps = 5

  const canContinue = [Boolean(employeeRange), useCases.length > 0, painPoints.length > 0, Boolean(projectTimeline), Boolean(contactInterest)][step]
  const toggle = (value: string, current: string[], setter: (values: string[]) => void) => {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value])
  }
  const next = () => {
    if (!canContinue) { setError('Моля, изберете отговор, за да продължите.'); return }
    setError('')
    if (step === 0) void trackEvent('profile_started')
    if (step < totalSteps - 1) setStep(step + 1)
    else void save()
  }
  const save = async () => {
    setSaving(true)
    setError('')
    try {
      const response = await fetch('/api/profile', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeRange, useCases, painPoints, projectTimeline, contactInterest, phone, jobRole }),
      })
      const result = await response.json() as { error?: string }
      if (!response.ok) throw new Error(result.error || 'Профилът не беше записан.')
      onCompleted()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Профилът не беше записан. Моля, опитайте отново.')
    } finally { setSaving(false) }
  }
  const wantsContact = contactInterest && contactInterest !== 'Засега не'

  return (
    <div className="questionnaire-backdrop" role="dialog" aria-modal="true" aria-labelledby="question-title">
      <section className="questionnaire-card">
        <header>
          <div><span>Професионален профил</span><strong>Въпрос {step + 1} от {totalSteps}</strong></div>
          <button type="button" aria-label="Затвори въпросите" onClick={onClose}><X /></button>
        </header>
        <div className="question-progress"><span style={{ width: `${(step + 1) / totalSteps * 100}%` }} /></div>
        <div className="question-body">
          {step === 0 && <SingleQuestion title="Каква е приблизителната големина на вашата организация?" options={EMPLOYEE_RANGES} value={employeeRange} onChange={setEmployeeRange} />}
          {step === 1 && <MultiQuestion title="За какво бихте използвали подобен инструмент?" options={USE_CASES} values={useCases} onToggle={(value) => toggle(value, useCases, setUseCases)} />}
          {step === 2 && <MultiQuestion title="Кои дейности в работата ви отнемат най-много време?" options={PAIN_POINTS} values={painPoints} onToggle={(value) => toggle(value, painPoints, setPainPoints)} />}
          {step === 3 && <SingleQuestion title="Имате ли конкретен проект или задача, при която подобен анализ би бил полезен?" options={PROJECT_TIMELINES} value={projectTimeline} onChange={setProjectTimeline} />}
          {step === 4 && (
            <>
              <SingleQuestion title="Бихте ли искали да обсъдим как AI, автоматизация или подобен тип анализ могат да се приложат във вашата организация?" options={CONTACT_INTERESTS} value={contactInterest} onChange={setContactInterest} />
              {wantsContact && <div className="optional-contact-fields"><label>Телефон <small>по желание</small><input value={phone} onChange={(e) => setPhone(e.target.value)} maxLength={40} inputMode="tel" autoComplete="tel" /></label><label>Длъжност <small>по желание</small><input value={jobRole} onChange={(e) => setJobRole(e.target.value)} maxLength={100} autoComplete="organization-title" /></label></div>}
            </>
          )}
          {error && <div className="form-error" role="alert">{error}</div>}
        </div>
        <footer>
          <button type="button" className="button" onClick={() => step === 0 ? onClose() : setStep(step - 1)}><ArrowLeft /> {step === 0 ? 'По-късно' : 'Назад'}</button>
          <button type="button" className="button button--primary" disabled={saving} onClick={next}>{saving ? 'Запазване...' : step === totalSteps - 1 ? 'Запази профила' : 'Продължи'} {step < totalSteps - 1 && <ArrowRight />}</button>
        </footer>
      </section>
    </div>
  )
}

function SingleQuestion({ title, options, value, onChange }: { title: string; options: readonly string[]; value: string; onChange: (value: string) => void }) {
  return <fieldset><legend id="question-title">{title}</legend><div className="choice-list">{options.map((option) => <label key={option} className={value === option ? 'selected' : ''}><input type="radio" name="single-question" checked={value === option} onChange={() => onChange(option)} /><span className="choice-mark">{value === option && <Check />}</span>{option}</label>)}</div></fieldset>
}

function MultiQuestion({ title, options, values, onToggle }: { title: string; options: readonly string[]; values: string[]; onToggle: (value: string) => void }) {
  return <fieldset><legend id="question-title">{title}</legend><p className="choice-help">Може да изберете повече от един отговор.</p><div className="choice-list choice-list--multi">{options.map((option) => <label key={option} className={values.includes(option) ? 'selected' : ''}><input type="checkbox" checked={values.includes(option)} onChange={() => onToggle(option)} /><span className="choice-mark">{values.includes(option) && <Check />}</span>{option}</label>)}</div></fieldset>
}
