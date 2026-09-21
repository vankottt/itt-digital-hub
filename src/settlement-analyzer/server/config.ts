export function isAdminRequest(value: string | null | undefined) {
  const expected = process.env.LAND_SCOPE_ADMIN_KEY?.trim();
  if (!expected || expected.length < 12) return false;
  return Boolean(value && value === expected);
}

export function privacyConfig() {
  const retention = Number.parseInt(String(process.env.LAND_SCOPE_DATA_RETENTION_MONTHS ?? process.env.DATA_RETENTION_MONTHS ?? "24"), 10);
  return {
    dataControllerName: String(process.env.LAND_SCOPE_DATA_CONTROLLER_NAME ?? process.env.DATA_CONTROLLER_NAME ?? "").trim() || "ITT Digital Hub",
    privacyContactEmail: String(process.env.LAND_SCOPE_PRIVACY_CONTACT_EMAIL ?? process.env.PRIVACY_CONTACT_EMAIL ?? "office@ittdigitalhub.org").trim() || null,
    retentionMonths: Number.isFinite(retention) && retention > 0 ? retention : 24,
  };
}
