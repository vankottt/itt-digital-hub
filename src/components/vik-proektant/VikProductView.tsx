import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";
import { vikProektant as copy } from "@/content/vik-proektant";
import { BackLink } from "@/components/ui/BackLink";
import { Container } from "@/components/layout/Container";

export function VikProductView({
  locale,
  chatGptUrl,
}: {
  locale: Locale;
  chatGptUrl: string | null;
}) {
  return (
    <div className="bg-paper">
      <Container className="pt-4 pb-12 md:pt-5 md:pb-16">
        <BackLink href={href(locale, "tools")}>{copy.back[locale]}</BackLink>
        <div className="mt-4 grid items-center gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(16rem,0.8fr)]">
          <header>
            <p className="label">{copy.label[locale]}</p>
            <h1 className="mt-2 text-h1 text-pretty">{copy.heading[locale]}</h1>
            <p className="mt-3 max-w-[40rem] text-body text-ink-2">{copy.lead[locale]}</p>
            <p className="mt-2 max-w-[40rem] text-small text-ink-3">{copy.support[locale]}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={href(locale, "vik-proektant", "compare")}
                className="inline-flex items-center justify-center rounded-full bg-marine px-5 py-3 text-small font-medium text-on-dark transition-colors hover:bg-marine-2"
              >
                {copy.compareCta[locale]}
              </Link>
              {chatGptUrl ? (
                <a
                  href={chatGptUrl}
                  className="inline-flex items-center justify-center rounded-full border border-line-strong bg-white px-5 py-3 text-small font-medium text-ink transition-colors hover:border-ink"
                >
                  {copy.chatgptCta[locale]}
                </a>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full border border-line bg-white px-5 py-3 text-small font-medium text-ink-3">
                  {copy.chatgptCta[locale]}
                </span>
              )}
            </div>
            <p className="mt-3 max-w-[36rem] text-meta text-ink-3">{chatGptUrl ? copy.compareHint[locale] : copy.chatgptWaiting[locale]}</p>
          </header>
          <div className="relative aspect-[16/10] overflow-hidden rounded-[1.25rem] bg-white">
            <Image
              src="/tools/vik-designer-card.svg"
              alt={locale === "bg" ? "Схема на водопроводна мрежа." : "Diagram of a water network."}
              fill
              priority
              sizes="(min-width: 1024px) 36vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.25rem] bg-white p-5 md:p-6">
            <h2 className="text-h4 text-ink">{copy.doesTitle[locale]}</h2>
            <p className="mt-3 text-small text-ink-2">{copy.does[locale]}</p>
          </article>
          <article className="rounded-[1.25rem] bg-white p-5 md:p-6">
            <h2 className="text-h4 text-ink">{copy.casesTitle[locale]}</h2>
            <ul className="mt-3 space-y-2 text-small text-ink-2">
              {copy.cases.map((item) => (
                <li key={item.en}>{item[locale]}</li>
              ))}
            </ul>
          </article>
          <article className="rounded-[1.25rem] bg-white p-5 md:p-6">
            <h2 className="text-h4 text-ink">{copy.howTitle[locale]}</h2>
            <p className="mt-3 text-small text-ink-2">{copy.how[locale]}</p>
          </article>
          <article className="rounded-[1.25rem] bg-white p-5 md:p-6">
            <h2 className="text-h4 text-ink">{copy.sourcesTitle[locale]}</h2>
            <p className="mt-3 text-small text-ink-2">{copy.sources[locale]}</p>
          </article>
          <article className="rounded-[1.25rem] bg-white p-5 md:p-6">
            <h2 className="text-h4 text-ink">{copy.toolsTitle[locale]}</h2>
            <p className="mt-3 text-small text-ink-2">{copy.tools[locale]}</p>
          </article>
          <article className="rounded-[1.25rem] bg-white p-5 md:p-6">
            <h2 className="text-h4 text-ink">{copy.limitsTitle[locale]}</h2>
            <p className="mt-3 text-small text-ink-2">{copy.limits[locale]}</p>
            <p className="mt-4">
              <Link href={href(locale, "vik-designer")} className="text-small font-medium text-ink underline decoration-line-strong underline-offset-4">
                {copy.legacyLink[locale]}
              </Link>
            </p>
          </article>
        </section>
      </Container>
    </div>
  );
}
