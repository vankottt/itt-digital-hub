import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core'

export const companies = sqliteTable('companies', {
  id: text('id').primaryKey(),
  companyName: text('company_name').notNull(),
  normalizedName: text('normalized_name').notNull(),
  website: text('website'),
  organizationType: text('organization_type').notNull(),
  employeeRange: text('employee_range'),
  city: text('city'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [uniqueIndex('idx_companies_normalized_name').on(table.normalizedName)])

export const contacts = sqliteTable('contacts', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  companyId: text('company_id').notNull().references(() => companies.id),
  organizationType: text('organization_type').notNull(),
  jobRole: text('job_role'),
  phone: text('phone'),
  chatgptUserId: text('chatgpt_user_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  source: text('source').notNull(),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmContent: text('utm_content'),
  marketingConsent: integer('marketing_consent', { mode: 'boolean' }).notNull().default(false),
  privacyAccepted: integer('privacy_accepted', { mode: 'boolean' }).notNull().default(false),
  privacyVersion: text('privacy_version').notNull(),
  lastSeenAt: text('last_seen_at').notNull(),
}, (table) => [
  uniqueIndex('idx_contacts_email').on(table.email),
  uniqueIndex('idx_contacts_chatgpt_user_id').on(table.chatgptUserId),
  index('idx_contacts_company_id').on(table.companyId),
  index('idx_contacts_last_seen_at').on(table.lastSeenAt),
  index('idx_contacts_utm_campaign').on(table.utmCampaign),
])

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  useCases: text('use_cases').notNull().default('[]'),
  painPoints: text('pain_points').notNull().default('[]'),
  projectTimeline: text('project_timeline'),
  contactInterest: text('contact_interest'),
  profileCompleted: integer('profile_completed', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [uniqueIndex('idx_profiles_contact_id').on(table.contactId)])

export const sessions = sqliteTable('sessions', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').references(() => contacts.id),
  source: text('source').notNull(),
  utmSource: text('utm_source'),
  utmMedium: text('utm_medium'),
  utmCampaign: text('utm_campaign'),
  utmContent: text('utm_content'),
  firstSeenAt: text('first_seen_at').notNull(),
  lastSeenAt: text('last_seen_at').notNull(),
}, (table) => [
  index('idx_sessions_contact_id').on(table.contactId),
  index('idx_sessions_first_seen_at').on(table.firstSeenAt),
])

export const analyses = sqliteTable('analyses', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  settlementName: text('settlement_name').notNull(),
  analysisSummary: text('analysis_summary').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_analyses_contact_id').on(table.contactId),
  index('idx_analyses_session_id').on(table.sessionId),
  index('idx_analyses_created_at').on(table.createdAt),
])

export const events = sqliteTable('events', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').references(() => contacts.id),
  sessionId: text('session_id').notNull().references(() => sessions.id),
  eventName: text('event_name').notNull(),
  eventProperties: text('event_properties').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_events_contact_id').on(table.contactId),
  index('idx_events_session_id').on(table.sessionId),
  index('idx_events_name_created_at').on(table.eventName, table.createdAt),
])

export const consents = sqliteTable('consents', {
  id: text('id').primaryKey(),
  contactId: text('contact_id').notNull().references(() => contacts.id),
  consentType: text('consent_type').notNull(),
  granted: integer('granted', { mode: 'boolean' }).notNull(),
  privacyVersion: text('privacy_version').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('idx_consents_contact_id').on(table.contactId),
  index('idx_consents_type_created_at').on(table.consentType, table.createdAt),
])
