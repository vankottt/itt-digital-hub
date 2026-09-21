import { NextRequest, NextResponse } from 'next/server'
import { getD1 } from '../../../db'
import { assertSameOrigin, cleanText, safeJson } from '../../../src/server/security'
import { ensureSession } from '../../../src/server/session'

export async function POST(request: NextRequest) {
  try {
    assertSameOrigin(request)
    const session = await ensureSession(request)
    if (!session.contactId) return NextResponse.json({ ok: true, recorded: false }, { status: 202 })
    const body = await request.json() as Record<string, unknown>
    const settlementName = cleanText(body.settlementName, 140)
    if (!settlementName) return NextResponse.json({ error: 'Липсва населено място.' }, { status: 400 })
    const summary = typeof body.summary === 'object' && body.summary ? body.summary : {}
    const now = new Date().toISOString()
    const d1 = getD1()
    await d1.batch([
      d1.prepare(`INSERT INTO analyses (id, contact_id, session_id, settlement_name, analysis_summary, created_at)
        VALUES (?, ?, ?, ?, ?, ?)`).bind(crypto.randomUUID(), session.contactId, session.sessionId, settlementName, safeJson(summary, 3000), now),
      d1.prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
        VALUES (?, ?, ?, 'analysis_completed', ?, ?)`).bind(
        crypto.randomUUID(), session.contactId, session.sessionId, safeJson({ settlementName }, 500), now,
      ),
      d1.prepare('UPDATE contacts SET last_seen_at = ?, updated_at = ? WHERE id = ?').bind(now, now, session.contactId),
    ])
    const count = await d1.prepare('SELECT COUNT(*) AS count FROM analyses WHERE contact_id = ?').bind(session.contactId).first<{ count: number }>()
    return NextResponse.json({ ok: true, recorded: true, analysisCount: Number(count?.count ?? 0) })
  } catch {
    return NextResponse.json({ error: 'Анализът е готов, но статистиката не беше записана.' }, { status: 503 })
  }
}
