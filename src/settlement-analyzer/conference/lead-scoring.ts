export type LeadScoreInput = {
  organizationType: string
  employeeRange: string | null
  projectTimeline: string | null
  contactInterest: string | null
  analysisCount: number
  sessionCount: number
  profileCompleted: boolean
  marketingConsent: boolean
}

export type LeadScoreResult = {
  score: number
  status: 'Студен' | 'Потенциален' | 'Висок потенциал'
  breakdown: Array<{ label: string; points: number }>
}

export function calculateLeadScore(input: LeadScoreInput): LeadScoreResult {
  const breakdown: LeadScoreResult['breakdown'] = []
  const add = (label: string, points: number) => { if (points > 0) breakdown.push({ label, points }) }

  if (input.organizationType !== 'Друго') add('Релевантна професионална организация', 10)
  if (['11–50 души', '51–250 души', 'Над 250 души'].includes(input.employeeRange ?? '')) add('Организация с 11+ служители', 5)
  if (input.projectTimeline === 'Да, в момента') add('Актуален проект', 15)
  else if (input.projectTimeline === 'В следващите 3 месеца') add('Проект до 3 месеца', 10)
  else if (input.projectTimeline === 'В следващите 6–12 месеца') add('Проект до 12 месеца', 5)

  if (input.analysisCount >= 5) add('Пет или повече анализа', 15)
  else if (input.analysisCount >= 3) add('Три или повече анализа', 12)
  else if (input.analysisCount >= 2) add('Два или повече анализа', 8)
  else if (input.analysisCount >= 1) add('Първи завършен анализ', 5)
  if (input.sessionCount >= 2) add('Повторно посещение', 15)
  if (input.profileCompleted) add('Попълнен професионален профил', 5)

  if (input.contactInterest === 'Да, бих искал разговор') add('Заявка за разговор', 25)
  else if (input.contactInterest === 'Да, но на по-късен етап') add('Интерес за разговор по-късно', 12)
  if (input.marketingConsent) add('Маркетингово съгласие', 3)

  const score = Math.min(100, breakdown.reduce((sum, item) => sum + item.points, 0))
  const status = score >= 60 ? 'Висок потенциал' : score >= 30 ? 'Потенциален' : 'Студен'
  return { score, status, breakdown }
}
