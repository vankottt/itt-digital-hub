import type { Locale } from "@/lib/i18n";
import { home } from "@/content/pages";
import { Container } from "@/components/layout/Container";
import { PartnersMarquee } from "./PartnersMarquee";

export function PartnersBand({ locale }: { locale: Locale }) {
  const c = home.experience;

  return (
    <section id="experience" aria-labelledby="experience-heading" className="overflow-x-hidden bg-paper py-section-sm">
      <Container>
        <h2 id="experience-heading" className="text-h1 text-ink">
          {c.heading[locale]}
        </h2>
        <p className="mt-6 max-w-2xl text-lead text-ink-2">{c.lead[locale]}</p>
      </Container>
      <div className="mt-10 md:mt-14">
        <PartnersMarquee locale={locale} />
      </div>
    </section>
  );
}
