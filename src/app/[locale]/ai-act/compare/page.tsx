import type { Metadata } from "next";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { href } from "@/lib/paths";
import { aiAct } from "@/content/ai-act";
import { Container } from "@/components/layout/Container";
import { BackLink } from "@/components/ui/BackLink";
import { CompareLab } from "@/components/ai-act/CompareLab";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  return {
    ...pageMetadata({
      locale,
      key: "ai-act",
      slug: "compare",
      title: aiAct.compareMeta.title[locale],
      description: aiAct.compareMeta.description[locale],
    }),
    title: { absolute: `${aiAct.compareMeta.title[locale]} · ITT Digital Hub` },
    alternates: {
      canonical: href(locale, "ai-act", "compare"),
      languages: {
        bg: href("bg", "ai-act", "compare"),
        en: href("en", "ai-act", "compare"),
      },
    },
  };
}

export default async function AiActComparePage({ params }: Params) {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "bg";
  const text = aiAct.compare;
  return (
    <div>
      <section className="hero-atmosphere -mt-[5.5rem] text-on-dark" data-surface="dark">
        <Container className="pt-24 pb-12 md:pt-28 md:pb-14">
          <BackLink href={href(locale, "tools")} className="text-on-dark decoration-on-dark/35 hover:text-on-dark">
            {text.back[locale]}
          </BackLink>
          <h1 className="mt-3 whitespace-pre-line text-h1 text-on-dark">{text.heading[locale]}</h1>
          <p className="mt-3 max-w-[68ch] text-body text-on-dark-muted">{text.lead[locale]}</p>
          <ul className="mt-3 list-disc space-y-1.5 pl-5 text-small text-on-dark-muted">
            {text.leadPoints.map((point) => (
              <li key={point.label.en}>
                <strong className="font-medium text-on-dark">{point.label[locale]}</strong> {point.text[locale]}
              </li>
            ))}
          </ul>
        </Container>
      </section>
      <div className="bg-paper">
        <Container className="relative z-10 -mt-8 pb-16 md:-mt-10 md:pb-24">
          <CompareLab locale={locale} />
        </Container>
      </div>
    </div>
  );
}
