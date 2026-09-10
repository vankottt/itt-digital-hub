import type { Locale } from "@/lib/i18n";
import type { Person } from "@/content/types";
import { t } from "@/content/messages";
import { linkedInHref } from "@/content/people";
import { home } from "@/content/pages";
import { LinkedInIcon } from "@/components/ui/Icons";
import { PersonPortrait, PersonPortraitPlate } from "./PersonPortrait";

export function FoundersPair({ people, locale }: { people: Person[]; locale: Locale }) {
  const m = t(locale);
  const axes = [home.people.axes.left[locale], home.people.axes.right[locale]];

  return (
    <ul className="grid gap-10 md:grid-cols-2 md:gap-12">
      {people.map((person, index) => {
        const linkedIn = linkedInHref(person);
        const name = person.name[locale];
        return (
          <li key={person.slug} className="surface-card">
            <p className="label">{axes[index] ?? person.role?.[locale]}</p>
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
              {person.bio[locale].map((paragraph) => (
                <p key={paragraph.slice(0, 48)}>{paragraph}</p>
              ))}
            </div>
            {linkedIn ? (
              <a
                href={linkedIn}
                rel="noopener noreferrer"
                target="_blank"
                aria-label={`${m.linkedInProfile}: ${name}`}
                className="mt-4 inline-flex min-h-11 items-center gap-2 text-small text-ink-2 transition-colors hover:text-marine"
              >
                <LinkedInIcon size={15} />
                <span>LinkedIn</span>
              </a>
            ) : (
              <p className="mt-4 text-meta text-ink-3">LinkedIn: TODO_CONTENT</p>
            )}
          </li>
        );
      })}
    </ul>
  );
}
