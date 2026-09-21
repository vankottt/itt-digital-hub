import { StoreUnavailableError } from "./store";

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

export async function getAdminData(): Promise<{
  leads: AdminLead[]
  kpis: {
    visits: number
    registrations: number
    registrationConversion: number
    usersWithAnalysis: number
    analyses: number
    returnVisitors: number
    completedProfiles: number
    highPotential: number
    contactRequests: number
  }
  funnel: Array<{ label: string; value: number }>
}> {
  throw new StoreUnavailableError("Административният преглед изисква допълнителна сървърна конфигурация.");
}
