declare namespace Cloudflare {
  interface Env {
    DB: D1Database
    ADMIN_USER_IDS?: string
    PRIVACY_CONTACT_EMAIL?: string
    DATA_CONTROLLER_NAME?: string
    DATA_RETENTION_MONTHS?: string
  }
}
