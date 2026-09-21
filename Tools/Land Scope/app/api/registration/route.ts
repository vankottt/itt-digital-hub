import { NextRequest, NextResponse } from 'next/server'
import { getChatGPTUser } from '../../chatgpt-auth'
import { getD1 } from '../../../db'
import { ORGANIZATION_TYPES, PRIVACY_VERSION } from '../../../src/conference/constants'
import { assertSameOrigin, cleanEmail, cleanText, normalizeCompanyName } from '../../../src/server/security'
import { ensureSession, setContactCookie } from '../../../src/server/session'

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const session = await ensureSession(request)
    if (session.contactId) return NextResponse.json({ ok: true, existing: true })
    const body = await request.json() as Record<string, unknown>
    const fullName = cleanText(body.fullName, 120)
    const email = cleanEmail(body.email)
    const companyName = cleanText(body.companyName, 160)
    const organizationType = cleanText(body.organizationType, 100)
    const marketingConsent = body.marketingConsent === true
    if (fullName.length < 3) return error('Моля, въведете име и фамилия.')
    if (!email) return error('Моля, въведете валиден служебен email.')
    if (companyName.length < 2) return error('Моля, въведете организация или фирма.')
    if (!ORGANIZATION_TYPES.includes(organizationType as typeof ORGANIZATION_TYPES[number])) return error('Моля, изберете тип организация.')

    const d1 = getD1()
    const authenticatedUser = await getChatGPTUser()
    if (authenticatedUser?.userId) {
      const linkedContact = await d1.prepare('SELECT id FROM contacts WHERE chatgpt_user_id = ? LIMIT 1').bind(authenticatedUser.userId).first()
      if (linkedContact) return NextResponse.json({ error: 'Този ChatGPT профил вече е свързан с професионален достъп. Отворете отново началната страница.' }, { status: 409 })
    }
    const duplicate = await d1.prepare('SELECT id FROM contacts WHERE email = ? LIMIT 1').bind(email).first()
    if (duplicate) return NextResponse.json({ error: 'С този служебен email вече има регистрация. Отворете приложението от устройството, на което сте се регистрирали.' }, { status: 409 })

    const now = new Date().toISOString()
    const companyId = crypto.randomUUID()
    const normalizedName = normalizeCompanyName(companyName)
    const company = await d1.prepare(`INSERT INTO companies (id, company_name, normalized_name, organization_type, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(normalized_name) DO UPDATE SET updated_at = excluded.updated_at
      RETURNING id`).bind(companyId, companyName, normalizedName, organizationType, now, now).first<{ id: string }>()
    if (!company?.id) throw new Error('Неуспешно записване на организацията.')

    const attribution = await d1.prepare(`SELECT source, utm_source, utm_medium, utm_campaign, utm_content
      FROM sessions WHERE id = ? LIMIT 1`).bind(session.sessionId).first<{
      source: string; utm_source: string | null; utm_medium: string | null; utm_campaign: string | null; utm_content: string | null
    }>()
    const contactId = crypto.randomUUID()
    await d1.batch([
      d1.prepare(`INSERT INTO contacts (id, full_name, email, company_id, organization_type, chatgpt_user_id, created_at, updated_at, source,
        utm_source, utm_medium, utm_campaign, utm_content, marketing_consent, privacy_accepted, privacy_version, last_seen_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`)
        .bind(contactId, fullName, email, company.id, organizationType, authenticatedUser?.userId ?? null, now, now, attribution?.source ?? 'direct',
          attribution?.utm_source ?? null, attribution?.utm_medium ?? null, attribution?.utm_campaign ?? null,
          attribution?.utm_content ?? null, marketingConsent ? 1 : 0, PRIVACY_VERSION, now),
      d1.prepare(`INSERT INTO profiles (id, contact_id, use_cases, pain_points, profile_completed, created_at, updated_at)
        VALUES (?, ?, '[]', '[]', 0, ?, ?)`).bind(crypto.randomUUID(), contactId, now, now),
      d1.prepare('UPDATE sessions SET contact_id = ?, last_seen_at = ? WHERE id = ?').bind(contactId, now, session.sessionId),
      d1.prepare('UPDATE events SET contact_id = ? WHERE session_id = ? AND contact_id IS NULL').bind(contactId, session.sessionId),
      d1.prepare(`INSERT INTO consents (id, contact_id, consent_type, granted, privacy_version, created_at)
        VALUES (?, ?, 'privacy', 1, ?, ?)`).bind(crypto.randomUUID(), contactId, PRIVACY_VERSION, now),
      d1.prepare(`INSERT INTO consents (id, contact_id, consent_type, granted, privacy_version, created_at)
        VALUES (?, ?, 'marketing', ?, ?, ?)`).bind(crypto.randomUUID(), contactId, marketingConsent ? 1 : 0, PRIVACY_VERSION, now),
      d1.prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
        VALUES (?, ?, ?, 'registration_completed', '{}', ?)`).bind(crypto.randomUUID(), contactId, session.sessionId, now),
    ])
    await setContactCookie(contactId)
    return NextResponse.json({ ok: true, fullName })
  } catch (cause) {
    const message = cause instanceof Error && cause.message === 'Невалидна заявка.'
      ? cause.message
      : 'Регистрацията не беше записана. Моля, опитайте отново.'
    return NextResponse.json({ error: message }, { status: message === 'Невалидна заявка.' ? 403 : 500 })
  }
}

function error(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}
