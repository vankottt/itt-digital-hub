import { NextRequest, NextResponse } from 'next/server'
import { getChatGPTUser } from '../../chatgpt-auth'
import { getD1 } from '../../../db'
import { isAdminUserId } from '../../../src/server/config'
import { ensureSession, setContactCookie } from '../../../src/server/session'

export async function GET(request: NextRequest) {
  try {
    const user = await getChatGPTUser()
    const ownerMode = isAdminUserId(user?.userId)
    const session = await ensureSession(request)
    const d1 = getD1()
    if (!session.contactId && user?.userId && !ownerMode) {
      const linkedContact = await d1.prepare('SELECT id FROM contacts WHERE chatgpt_user_id = ? LIMIT 1')
        .bind(user.userId).first<{ id: string }>()
      if (linkedContact) {
        const now = new Date().toISOString()
        await d1.batch([
          d1.prepare('UPDATE sessions SET contact_id = ?, last_seen_at = ? WHERE id = ?')
            .bind(linkedContact.id, now, session.sessionId),
          d1.prepare('UPDATE events SET contact_id = ? WHERE session_id = ? AND contact_id IS NULL')
            .bind(linkedContact.id, session.sessionId),
          d1.prepare('UPDATE contacts SET last_seen_at = ?, updated_at = ? WHERE id = ?')
            .bind(now, now, linkedContact.id),
          d1.prepare(`INSERT INTO events (id, contact_id, session_id, event_name, event_properties, created_at)
            VALUES (?, ?, ?, 'return_visit', '{}', ?)`).bind(crypto.randomUUID(), linkedContact.id, session.sessionId, now),
        ])
        await setContactCookie(linkedContact.id)
        session.contactId = linkedContact.id
      }
    }
    if (!session.contactId) {
      return NextResponse.json({ registered: ownerMode, ownerMode, profileCompleted: false, analysisCount: 0 })
    }

    const state = await d1.prepare(`SELECT
      c.full_name AS fullName,
      COALESCE(p.profile_completed, 0) AS profileCompleted,
      (SELECT COUNT(*) FROM analyses a WHERE a.contact_id = c.id) AS analysisCount
      FROM contacts c LEFT JOIN profiles p ON p.contact_id = c.id WHERE c.id = ? LIMIT 1`)
      .bind(session.contactId).first<{ fullName: string; profileCompleted: number; analysisCount: number }>()
    if (!state) return NextResponse.json({ registered: ownerMode, ownerMode, profileCompleted: false, analysisCount: 0 })
    return NextResponse.json({
      registered: true,
      ownerMode,
      fullName: state.fullName,
      profileCompleted: Boolean(state.profileCompleted),
      analysisCount: Number(state.analysisCount),
    })
  } catch {
    return NextResponse.json({
      registered: false,
      ownerMode: false,
      profileCompleted: false,
      analysisCount: 0,
      degraded: true,
      message: 'Връзката с базата данни временно не е достъпна. Ако вече сте се регистрирали, можете да продължите с анализа.',
    }, { status: 503 })
  }
}
