import { useEffect, useRef, useState } from 'react'
import { CheckCircle2, ChevronRight, ShieldAlert, UserRoundSearch, X } from 'lucide-react'
import App from '../App'
import type { AnalysisResult } from '../types'
import { ProfileQuestionnaire } from './ProfileQuestionnaire'
import { RegistrationGate } from './RegistrationGate'
import { trackEvent } from './tracking'

type BootstrapState = {
  registered: boolean
  ownerMode: boolean
  fullName?: string
  profileCompleted: boolean
  analysisCount: number
  degraded?: boolean
  message?: string
}

export default function ConferenceExperience({ ownerMode: serverOwnerMode }: { ownerMode: boolean }) {
  const [state, setState] = useState<BootstrapState | null>(null)
  const [loadingError, setLoadingError] = useState('')
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
  const [promptDismissed, setPromptDismissed] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [analyticsWarning, setAnalyticsWarning] = useState('')
  const promptTracked = useRef(false)
  const testRegistration = serverOwnerMode && typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test_registration') === '1'

  useEffect(() => {
    setPromptDismissed(sessionStorage.getItem('conference_profile_prompt_dismissed') === '1')
    let active = true
    const load = async () => {
      try {
        const response = await fetch(`/api/bootstrap${window.location.search}`, { cache: 'no-store' })
        const result = await response.json() as BootstrapState
        if (!response.ok && !(result.degraded && localStorage.getItem('conference_registration_completed') === '1')) {
          throw new Error(result.message || 'Приложението временно не може да зареди професионалния достъп.')
        }
        if (active) setState({
          ...result,
          registered: result.registered || serverOwnerMode || Boolean(result.degraded && localStorage.getItem('conference_registration_completed') === '1'),
        })
      } catch (cause) {
        if (!active) return
        if (serverOwnerMode || localStorage.getItem('conference_registration_completed') === '1') {
          setState({ registered: true, ownerMode: serverOwnerMode, profileCompleted: false, analysisCount: 0, degraded: true })
          setAnalyticsWarning('Анализаторът работи, но статистиката временно не се записва.')
        } else setLoadingError(cause instanceof Error ? cause.message : 'Професионалният достъп временно не може да бъде зареден.')
      }
    }
    void load()
    const trackingError = () => setAnalyticsWarning('Анализаторът работи, но статистиката временно не се записва.')
    window.addEventListener('conference-tracking-error', trackingError)
    return () => { active = false; window.removeEventListener('conference-tracking-error', trackingError) }
  }, [serverOwnerMode])

  const handleAnalysisStarted = (isSecond: boolean) => {
    void trackEvent(isSecond ? 'second_analysis_started' : 'analysis_started')
  }
  const handleAnalysisCompleted = async (result: AnalysisResult) => {
    try {
      const response = await fetch('/api/analyses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settlementName: result.settlement.name,
          summary: {
            municipality: result.settlement.municipality,
            region: result.settlement.region,
            areaKm2: Number(result.analysisAreaKm2.toFixed(3)),
            buildings: result.buildingMetrics.total,
            roadLengthKm: Number(result.roadMetrics.lengthKm.toFixed(2)),
            confidence: result.confidence.level,
            profile: result.profile,
          },
        }),
      })
      const payload = await response.json() as { analysisCount?: number }
      if (!response.ok) throw new Error('tracking failed')
      setState((current) => current ? { ...current, analysisCount: payload.analysisCount ?? current.analysisCount + 1 } : current)
    } catch {
      setAnalyticsWarning('Анализът е готов, но статистиката временно не беше записана.')
      setState((current) => current ? { ...current, analysisCount: current.analysisCount + 1 } : current)
    }
  }
  const profileCompleted = () => {
    setShowQuestionnaire(false)
    setState((current) => current ? { ...current, profileCompleted: true } : current)
    setSuccessMessage('Благодарим! Можете да продължите да използвате анализатора.')
  }
  const shouldPrompt = Boolean(state && state.analysisCount >= 1 && !state.profileCompleted && !promptDismissed && !state.ownerMode)
  useEffect(() => {
    if (!shouldPrompt || promptTracked.current) return
    promptTracked.current = true
    void trackEvent('profile_prompt_viewed')
  }, [shouldPrompt])

  if (testRegistration) {
    return <RegistrationGate previewMode onCompleted={() => window.location.assign('/')} />
  }
  if (!state && !loadingError) return <div className="conference-loading"><span className="spinner" /><strong>Подготвяме професионалния достъп...</strong></div>
  if (loadingError) return <div className="conference-error"><ShieldAlert /><h1>Достъпът временно не може да бъде зареден</h1><p>{loadingError}</p><button className="button button--primary" onClick={() => window.location.reload()}>Опитай отново</button></div>
  if (!state?.registered) return <RegistrationGate onCompleted={(fullName) => setState({ registered: true, ownerMode: false, fullName, profileCompleted: false, analysisCount: 0 })} />

  return (
    <>
      <App
        ownerMode={state.ownerMode}
        analysisCount={state.analysisCount}
        onAnalysisStarted={handleAnalysisStarted}
        onAnalysisCompleted={handleAnalysisCompleted}
        onFeatureUsed={(featureName) => void trackEvent('feature_used', { featureName })}
      />
      {analyticsWarning && <div className="analytics-warning" role="status"><span>{analyticsWarning}</span><button aria-label="Затвори съобщението" onClick={() => setAnalyticsWarning('')}><X /></button></div>}
      {successMessage && <div className="profile-success" role="status"><CheckCircle2 /><span>{successMessage}</span><button aria-label="Затвори съобщението" onClick={() => setSuccessMessage('')}><X /></button></div>}
      {shouldPrompt && !showQuestionnaire && (
        <aside className="profile-prompt">
          <span className="profile-prompt__icon"><UserRoundSearch /></span>
          <div><strong>Помогнете ни да адаптираме инструмента към вашата работа</strong><p>Няколко кратки въпроса ще ни помогнат да развиваме функциите, които са най-полезни за професионалистите в сектора.</p></div>
          <div className="profile-prompt__actions"><button className="button" onClick={() => { sessionStorage.setItem('conference_profile_prompt_dismissed', '1'); setPromptDismissed(true) }}>По-късно</button><button className="button button--primary" onClick={() => setShowQuestionnaire(true)}>Продължи <ChevronRight /></button></div>
        </aside>
      )}
      {showQuestionnaire && <ProfileQuestionnaire onClose={() => { sessionStorage.setItem('conference_profile_prompt_dismissed', '1'); setShowQuestionnaire(false); setPromptDismissed(true) }} onCompleted={profileCompleted} />}
    </>
  )
}
