import type { Locale } from "@/lib/i18n";
import { home } from "@/content/pages";
import { Container } from "@/components/layout/Container";
import { PartnersMarquee } from "./PartnersMarquee";

function LeadWithDashedSpheres({ locale }: { locale: Locale }) {
  const c = home.experience;
  const text = c.lead[locale] as string;
  const spheres = locale === "bg"
    ? ["производство", "енергетика", "търговия", "логистика", "публични институции"]
    : ["manufacturing", "energy", "retail", "logistics", "public institutions"];

  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  for (const sphere of spheres) {
    const idx = remaining.indexOf(sphere);
    if (idx === -1) continue;
    if (idx > 0) {
      parts.push(remaining.slice(0, idx));
    }
    parts.push(
      <span key={key++} className="font-semibold underline decoration-dashed decoration-signal underline-offset-[4px]">
        {sphere}
      </span>
    );
    remaining = remaining.slice(idx + sphere.length);
  }
  if (remaining) parts.push(remaining);

  return <p className="mt-6 max-w-4xl text-lead whitespace-pre-line text-ink-2">{parts}</p>;
}

export function PartnersBand({ locale }: { locale: Locale }) {
  const c = home.experience;

  return (
    <section id="experience" aria-labelledby="experience-heading" className="overflow-x-hidden bg-paper py-section-sm">
      <Container>
        <h2 id="experience-heading" className="text-h1 text-ink">
          {c.heading[locale]}
        </h2>
        <LeadWithDashedSpheres locale={locale} />
      </Container>
      <div className="mt-10 md:mt-14">
        <PartnersMarquee locale={locale} />
      </div>
    </section>
  );
}
