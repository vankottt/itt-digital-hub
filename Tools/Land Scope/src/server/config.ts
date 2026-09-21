import { env } from 'cloudflare:workers'

export function isAdminUserId(userId: string | null | undefined) {
  if (!userId) return false
  const allowed = String(env.ADMIN_USER_IDS ?? '').split(',').map((value) => value.trim()).filter(Boolean)
  return allowed.includes(userId)
}

export function privacyConfig() {
  const retention = Number.parseInt(String(env.DATA_RETENTION_MONTHS ?? '24'), 10)
  return {
    dataControllerName: String(env.DATA_CONTROLLER_NAME ?? '').trim() || null,
    privacyContactEmail: String(env.PRIVACY_CONTACT_EMAIL ?? '').trim() || null,
    retentionMonths: Number.isFinite(retention) && retention > 0 ? retention : 24,
  }
}
