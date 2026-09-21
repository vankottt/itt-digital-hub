import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { isAdminSession } from "@/settlement-analyzer/server/admin-auth";
import { getAdminData } from "@/settlement-analyzer/server/admin-data";
import { privacyConfig } from "@/settlement-analyzer/server/config";
import { AdminDashboard } from "@/settlement-analyzer/conference/AdminDashboard";
import { sa } from "@/settlement-analyzer/copy";

type Params = { params: Promise<{ locale: string }> };

export default async function SettlementAnalyzerAdminPage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  if (!(await isAdminSession())) notFound();
  const copy = sa(locale);
  const data = await getAdminData().catch(() => null);
  if (!data) {
    return (
      <main className="admin-page">
        <div className="page-topbar">
          <a href={href(locale, "settlement-analyzer")}>← {copy.name}</a>
          <strong>{copy.admin}</strong>
        </div>
        <section className="admin-error">
          <h1>Данните временно не могат да бъдат заредени</h1>
          <p>Административният преглед на регистрациите е наличен след допълнителна сървърна конфигурация. Самият анализатор работи независимо от този екран.</p>
          <a className="button button--primary" href={href(locale, "settlement-analyzer")}>{copy.name}</a>
        </section>
      </main>
    );
  }
  return (
    <AdminDashboard
      {...data}
      adminName="ITT"
      privacyReady={Boolean(privacyConfig().dataControllerName && privacyConfig().privacyContactEmail)}
    />
  );
}
