import type { TrackedEventName } from './constants'

export async function trackEvent(eventName: TrackedEventName, properties: Record<string, unknown> = {}) {
  try {
    const response = await fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventName, properties }),
      keepalive: true,
    })
    if (!response.ok) throw new Error('tracking failed')
    return true
  } catch {
    window.dispatchEvent(new CustomEvent('conference-tracking-error'))
    return false
  }
}
