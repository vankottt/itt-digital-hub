import Image from "next/image";
import { partners, type Partner } from "@/content/partners";
import type { Locale } from "@/lib/i18n";
import { t } from "@/content/messages";

function LogoMark({ partner, locale }: { partner: Partner; locale: Locale }) {
  const svg = partner.logo.endsWith(".svg");
  const className = "h-12 w-auto max-h-12 max-w-[11rem] object-contain object-center md:h-14 md:max-h-14 md:max-w-[13rem]";
  return svg ? (
    // SVGs from public/ stay as img so Next does not rasterise the official marks.
    // eslint-disable-next-line @next/next/no-img-element
    <img src={partner.logo} alt={partner.name[locale]} width={partner.width} height={partner.height} className={className} />
  ) : (
    <Image
      src={partner.logo}
      alt={partner.name[locale]}
      width={partner.width}
      height={partner.height}
      className={className}
    />
  );
}

function Track({
  items,
  locale,
  hidden,
}: {
  items: Partner[];
  locale: Locale;
  hidden?: boolean;
}) {
  return (
    <ul className="flex shrink-0 items-center gap-10 pr-10 md:gap-16 md:pr-16" aria-hidden={hidden || undefined}>
      {items.map((partner, index) => (
        <li key={`${partner.id}-${hidden ? "dup" : "a"}-${index}`}>
          <a
            href={partner.href}
            target="_blank"
            rel="noopener noreferrer"
            className="partners-logo inline-flex h-20 items-center justify-center px-2 no-underline md:h-24"
          >
            <LogoMark partner={partner} locale={locale} />
          </a>
        </li>
      ))}
    </ul>
  );
}

export function PartnersMarquee({ locale }: { locale: Locale }) {
  const m = t(locale);
  const row = [...partners, ...partners, ...partners];

  return (
    <div className="partners-marquee" aria-label={m.partnersMarquee}>
      <div className="partners-row">
        <div className="partners-track">
          <Track items={row} locale={locale} />
          <Track items={row} locale={locale} hidden />
        </div>
      </div>
    </div>
  );
}
