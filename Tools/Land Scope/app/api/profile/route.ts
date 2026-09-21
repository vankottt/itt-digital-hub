import { NextRequest, NextResponse } from 'next/server'
import { getD1 } from '../../../db'
import { CONTACT_INTERESTS, EMPLOYEE_RANGES, PAIN_POINTS, PROJECT_TIMELINES, USE_CASES } from '../../../src/conference/constants'
import { assertSameOrigin, cleanStringArray, cleanText, safeJson } from '../../../src/server/security'
import { ensureSession } from '../../../src/server/session'

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const session = await ensureSession(request)
    if (!session.contactId) return NextResponse.json({ error: 'Необходима е професионална регистрация.' }, { status: 401 })
    const body = await request.json() as Record<string, unknown>
    const employeeRange = cleanText(body.employeeRange, 80)
    const useCases = cleanStringArray(body.useCases, USE_CASES)
    const painPoints = cleanStringArray(body.painPoints, PAIN_POINTS)
    const projectTimeline = cleanText(body.projectTimeline, 100)
    const contactInterest = cleanText(body.contactInterest, 100)
    if (!EMPLOYEE_RANGES.includes(employeeRange as typeof EMPLOYEE_RANGES[number])) return error('Моля, посочете приблизителна големина на организацията.')
    if (useCases.length === 0) return error('Изберете поне една възможна употреба.')
    if (painPoints.length === 0) return error('Изберете поне една дейност, която отнема време.')
    if (!PROJECT_TIMELINES.includes(projectTimeline as typeof PROJECT_TIMELINES[number])) return error('Моля, посочете хоризонт за проект или задача.')
    if (!CONTACT_INTERESTS.includes(contactInterest as typeof CONTACT_INTERESTS[number])) return error('Моля, посочете интереса си към разговор.')
    const wantsContact = contactInterest !== 'Засега не'
    const phone = wantsContact ? cleanText(body.phone, 40) || null : null
    const jobRole = wantsContact ? cleanText(body.jobRole, 100) || null : null
    const now = new Date().toISOString()
    const d1 = getD1()
    const contact = await d1.prepare('SELECT company_id FROM contacts WHERE id = ? LIMIT 1').bind(session.contactId).first<{ company_id: string }>()
    if (!contact) return NextResponse.json({ error: 'Профилът не беше намерен.' }, { status: 404 })
    const statements = [
      d1.prepare(`UPDATE profiles SET use_cases = ?, pain_points = ?, project_timeline = ?, contact_interest = ?,
        profile_completed = 1, updated_at = ? WHERE contact_id = ?`).bind(
        safeJson(useCases), safeJson(painPoints), projectTimeline, contactInterest, now, session.contactId,
      ),
      d1.prepare('UPDATE companies SET employee_range = ?, updated_at = ? WHERE id = ?').bind(employeeRange, now, contact.company_id),
      d1.prepare('UPDATE contacts SET phone = ?, job_role = ?, updated_at = ?, last_seen_at = ? WHERE id = ?')
        .bind(phone, jobRole, now, now, session.contactId),
      d1.prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
        VALUES (?, ?, ?, 'profile_completed', '{}', ?)`).bind(crypto.randomUUID(), session.contactId, session.sessionId, now),
    ]
    if (wantsContact) {
      statements.push(d1.prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
        VALUES (?, ?, ?, 'contact_requested', ?, ?)`).bind(
        crypto.randomUUID(), session.contactId, session.sessionId, safeJson({ contactInterest }), now,
      ))
    }
    await d1.batch(statements)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Профилът не беше записан. Моля, опитайте отново.' }, { status: 503 })
  }
}

function error(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}
