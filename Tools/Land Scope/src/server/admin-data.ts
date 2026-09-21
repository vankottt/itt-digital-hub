import { getD1 } from '../../db'
import { calculateLeadScore } from '../conference/lead-scoring'

export type AdminLead = {
  id: string
  fullName: string
  email: string
  phone: string | null
  jobRole: string | null
  companyName: string
  website: string | null
  organizationType: string
  employeeRange: string | null
  city: string | null
  useCases: string[]
  painPoints: string[]
  projectTimeline: string | null
  contactInterest: string | null
  profileCompleted: boolean
  createdAt: string
  lastSeenAt: string
  source: string
  utmCampaign: string | null
  utmContent: string | null
  sessionCount: number
  analysisCount: number
  settlements: string[]
  score: number
  status: string
  scoreBreakdown: Array<{ label: string; points: number }>
  marketingConsent: boolean
}

type RawLead = {
  id: string; full_name: string; email: string; phone: string | null; job_role: string | null
  company_name: string; website: string | null; organization_type: string; employee_range: string | null; city: string | null
  use_cases: string | null; pain_points: string | null; project_timeline: string | null; contact_interest: string | null
  profile_completed: number; created_at: string; last_seen_at: string; source: string; utm_campaign: string | null; utm_content: string | null
  session_count: number; analysis_count: number; settlements: string | null; marketing_consent: number
}

export async function getAdminData() {
  const d1 = getD1()
  const rows = await d1.prepare(`SELECT
    c.id, c.full_name, c.email, c.phone, c.job_role, c.organization_type, c.created_at, c.last_seen_at,
    c.source, c.utm_campaign, c.utm_content, c.marketing_consent,
    co.company_name, co.website, co.employee_range, co.city,
    p.use_cases, p.pain_points, p.project_timeline, p.contact_interest, COALESCE(p.profile_completed, 0) AS profile_completed,
    COUNT(DISTINCT s.id) AS session_count,
    COUNT(DISTINCT a.id) AS analysis_count,
    GROUP_CONCAT(DISTINCT a.settlement_name) AS settlements
    FROM contacts c
    JOIN companies co ON co.id = c.company_id
    LEFT JOIN profiles p ON p.contact_id = c.id
    LEFT JOIN sessions s ON s.contact_id = c.id
    LEFT JOIN analyses a ON a.contact_id = c.id
    GROUP BY c.id
    ORDER BY c.last_seen_at DESC`).all<RawLead>()

  const leads: AdminLead[] = rows.results.map((row) => {
    const input = {
      organizationType: row.organization_type,
      employeeRange: row.employee_range,
      projectTimeline: row.project_timeline,
      contactInterest: row.contact_interest,
      analysisCount: Number(row.analysis_count),
      sessionCount: Number(row.session_count),
      profileCompleted: Boolean(row.profile_completed),
      marketingConsent: Boolean(row.marketing_consent),
    }
    const scoring = calculateLeadScore(input)
    return {
      id: row.id, fullName: row.full_name, email: row.email, phone: row.phone, jobRole: row.job_role,
      companyName: row.company_name, website: row.website, organizationType: row.organization_type,
      employeeRange: row.employee_range, city: row.city, useCases: parseArray(row.use_cases), painPoints: parseArray(row.pain_points),
      projectTimeline: row.project_timeline, contactInterest: row.contact_interest, profileCompleted: Boolean(row.profile_completed),
      createdAt: row.created_at, lastSeenAt: row.last_seen_at, source: row.source, utmCampaign: row.utm_campaign,
      utmContent: row.utm_content, sessionCount: Number(row.session_count), analysisCount: Number(row.analysis_count),
      settlements: row.settlements ? row.settlements.split(',').filter(Boolean) : [], marketingConsent: Boolean(row.marketing_consent),
      score: scoring.score, status: scoring.status, scoreBreakdown: scoring.breakdown,
    }
  })

  const eventCounts = await d1.prepare(`SELECT event_name, COUNT(DISTINCT session_id) AS count
    FROM events WHERE event_name IN ('registration_started') GROUP BY event_name`).all<{ event_name: string; count: number }>()
  const visits = await d1.prepare('SELECT COUNT(*) AS count FROM sessions').first<{ count: number }>()
  const registrations = leads.length
  const registrationStarted = Math.max(registrations, Number(eventCounts.results.find((row) => row.event_name === 'registration_started')?.count ?? 0))
  const firstAnalysis = leads.filter((lead) => lead.analysisCount >= 1).length
  const secondAnalysis = leads.filter((lead) => lead.analysisCount >= 2).length
  const completedProfiles = leads.filter((lead) => lead.profileCompleted).length
  const contactRequests = leads.filter((lead) => lead.contactInterest && lead.contactInterest !== 'Засега не').length
  const qualifiedProfiles = leads.filter((lead) => lead.analysisCount >= 2 && lead.profileCompleted).length
  const qualifiedContactRequests = leads.filter((lead) => lead.analysisCount >= 2 && lead.profileCompleted
    && lead.contactInterest && lead.contactInterest !== 'Засега не').length
  const totalVisits = Number(visits?.count ?? 0)

  return {
    leads,
    kpis: {
      visits: totalVisits,
      registrations,
      registrationConversion: totalVisits ? registrations / totalVisits * 100 : 0,
      usersWithAnalysis: firstAnalysis,
      analyses: leads.reduce((sum, lead) => sum + lead.analysisCount, 0),
      returnVisitors: leads.filter((lead) => lead.sessionCount >= 2).length,
      completedProfiles,
      highPotential: leads.filter((lead) => lead.score >= 60).length,
      contactRequests,
    },
    funnel: [
      { label: 'Посещения', value: totalVisits },
      { label: 'Започната регистрация', value: registrationStarted },
      { label: 'Завършена регистрация', value: registrations },
      { label: 'Първи анализ', value: firstAnalysis },
      { label: '2+ анализа', value: secondAnalysis },
      { label: 'Попълнен профил', value: qualifiedProfiles },
      { label: 'Заявка за контакт', value: qualifiedContactRequests },
    ],
  }
}

function parseArray(value: string | null) {
  try {
    const parsed = JSON.parse(value ?? '[]')
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string') : []
  } catch { return [] }
}
