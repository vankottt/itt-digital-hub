import { NextRequest, NextResponse } from 'next/server'
import { getD1 } from '../../../db'
import { TRACKED_EVENT_NAMES } from '../../../src/conference/constants'
import { assertSameOrigin, cleanText, safeJson } from '../../../src/server/security'
import { ensureSession } from '../../../src/server/session'

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const body = await request.json() as Record<string, unknown>
    const eventName = cleanText(body.eventName, 80)
    if (!TRACKED_EVENT_NAMES.includes(eventName as typeof TRACKED_EVENT_NAMES[number])) {
      return NextResponse.json({ error: 'Неподдържано събитие.' }, { status: 400 })
    }
    const session = await ensureSession(request)
    await getD1().prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
      VALUES (?, ?, ?, ?, ?, ?)`).bind(
      crypto.randomUUID(), session.contactId, session.sessionId, eventName, safeJson(body.properties), new Date().toISOString(),
    ).run()
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Събитието не беше записано.' }, { status: 503 })
  }
}
