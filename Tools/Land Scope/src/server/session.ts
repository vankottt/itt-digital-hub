import { cookies } from 'next/headers'
import type { NextRequest } from 'next/server'
import { getD1 } from '../../db'
import { cleanText } from './security'

export const CONTACT_COOKIE = 'conference_contact_id'
export const SESSION_COOKIE = 'conference_session_id'

export type Attribution = {
  source: string
  utmSource: string | null
  utmMedium: string | null
  utmCampaign: string | null
  utmContent: string | null
}

export async function ensureSession(request: NextRequest) {
  const cookieStore = await cookies()
  const d1 = getD1()
  const now = new Date().toISOString()
  let contactId = cookieStore.get(CONTACT_COOKIE)?.value ?? null
  if (contactId) {
    const contact = await d1.prepare('SELECT id FROM contacts WHERE id = ? LIMIT 1').bind(contactId).first<{ id: string }>()
    if (!contact) {
      contactId = null
      cookieStore.delete(CONTACT_COOKIE)
    }
  }

  const existingSessionId = cookieStore.get(SESSION_COOKIE)?.value
  if (existingSessionId) {
    const existing = await d1.prepare('SELECT id, contact_id FROM sessions WHERE id = ? LIMIT 1').bind(existingSessionId).first<{ id: string; contact_id: string | null }>()
    if (existing) {
      if (contactId && !existing.contact_id) {
        await d1.prepare('UPDATE sessions SET contact_id = ?, last_seen_at = ? WHERE id = ?').bind(contactId, now, existingSessionId).run()
      } else {
        await d1.prepare('UPDATE sessions SET last_seen_at = ? WHERE id = ?').bind(now, existingSessionId).run()
      }
      if (contactId) await d1.prepare('UPDATE contacts SET last_seen_at = ?, updated_at = ? WHERE id = ?').bind(now, now, contactId).run()
      return { sessionId: existingSessionId, contactId, isNewSession: false }
    }
  }

  const attribution = attributionFrom(request)
  const sessionId = crypto.randomUUID()
  const statements = [
    d1.prepare(`INSERT INTO sessions (id, contact_id, source, utm_source, utm_medium, utm_campaign, utm_content, first_seen_at, last_seen_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      sessionId, contactId, attribution.source, attribution.utmSource, attribution.utmMedium,
      attribution.utmCampaign, attribution.utmContent, now, now,
    ),
    d1.prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
      VALUES (?, ?, ?, 'landing_viewed', '{}', ?)`).bind(crypto.randomUUID(), contactId, sessionId, now),
  ]
  if (contactId) {
    const previous = await d1.prepare('SELECT COUNT(*) AS count FROM sessions WHERE contact_id = ?').bind(contactId).first<{ count: number }>()
    if (Number(previous?.count ?? 0) > 0) {
      statements.push(d1.prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
        VALUES (?, ?, ?, 'return_visit', '{}', ?)`).bind(crypto.randomUUID(), contactId, sessionId, now))
    }
    statements.push(d1.prepare('UPDATE contacts SET last_seen_at = ?, updated_at = ? WHERE id = ?').bind(now, now, contactId))
  }
  await d1.batch(statements)
  cookieStore.set(SESSION_COOKIE, sessionId, cookieOptions())
  return { sessionId, contactId, isNewSession: true }
}

export async function setContactCookie(contactId: string) {
  const cookieStore = await cookies()
  cookieStore.set(CONTACT_COOKIE, contactId, { ...cookieOptions(), maxAge: 60 * 60 * 24 * 365 })
}

export function attributionFrom(request: NextRequest): Attribution {
  const value = (name: string) => cleanText(request.nextUrl.searchParams.get(name), 120) || null
  const utmSource = value('utm_source')
  return {
    source: utmSource || 'direct',
    utmSource,
    utmMedium: value('utm_medium'),
    utmCampaign: value('utm_campaign'),
    utmContent: value('utm_content'),
  }
}

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  }
}
