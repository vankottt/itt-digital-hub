import type { Locale } from "@/lib/i18n";
import type { Person } from "@/content/types";
import { personEyebrow, personIntro, type PersonIntroVariant } from "@/content/people";
import { PersonPortrait, PersonPortraitPlate } from "./PersonPortrait";

export function FoundersPair({
  people,
  locale,
  variant = "card",
}: {
  people: Person[];
  locale: Locale;
  variant?: PersonIntroVariant;
}) {
  return (
    <ul className="grid items-stretch gap-10 md:grid-cols-2 md:gap-12">
      {people.map((person) => {
        const name = person.name[locale];
        const eyebrow = personEyebrow(person, locale);
        const paragraphs = personIntro(person, locale, variant);
        const expertise = person.expertise[locale];
        return (
          <li key={person.slug} className="surface-card flex h-full flex-col">
            {eyebrow ? <p className="label">{eyebrow}</p> : null}
            <div className="mt-5 w-full max-w-[14.5rem]">
              {person.portrait ? (
                <PersonPortrait
                  src={person.portrait.src}
                  alt={name}
                  objectPosition={person.portrait.objectPosition}
                />
              ) : (
                <PersonPortraitPlate />
              )}
            </div>
            <h3 className="mt-5 text-h3 text-pretty text-ink">{name}</h3>
            {person.role ? <p className="mt-1 text-small text-ink-2">{person.role[locale]}</p> : null}
            <div className="mt-4 space-y-3 text-small text-ink-2">
              {paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
            {variant === "profile" && expertise.length ? (
              <p className="mt-4 text-meta text-ink-3">{expertise.join(" · ")}</p>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
