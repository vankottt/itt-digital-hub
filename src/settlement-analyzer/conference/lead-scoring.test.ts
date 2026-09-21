import { describe, expect, it } from 'vitest'
import { calculateLeadScore } from './lead-scoring'

describe('calculateLeadScore', () => {
  it('keeps a minimally engaged contact cold', () => {
    expect(calculateLeadScore({
      organizationType: 'Друго', employeeRange: null, projectTimeline: null,
      contactInterest: null, analysisCount: 0, sessionCount: 1,
      profileCompleted: false, marketingConsent: false,
    })).toEqual({ score: 0, status: 'Студен', breakdown: [] })
  })

  it('qualifies a conference contact from transparent business signals', () => {
    const result = calculateLeadScore({
      organizationType: 'ВиК оператор', employeeRange: '11–50 души',
      projectTimeline: 'Да, в момента', contactInterest: 'Да, бих искал разговор',
      analysisCount: 2, sessionCount: 2, profileCompleted: true, marketingConsent: true,
    })

    expect(result.score).toBe(86)
    expect(result.status).toBe('Висок потенциал')
    expect(result.breakdown).toContainEqual({ label: 'Заявка за разговор', points: 25 })
  })

  it('keeps the strongest supported combination below the 100-point cap', () => {
    const result = calculateLeadScore({
      organizationType: 'Община / публична администрация', employeeRange: 'Над 250 души',
      projectTimeline: 'Да, в момента', contactInterest: 'Да, бих искал разговор',
      analysisCount: 5, sessionCount: 4, profileCompleted: true, marketingConsent: true,
    })

    expect(result.score).toBe(93)
    expect(result.status).toBe('Висок потенциал')
  })
})
