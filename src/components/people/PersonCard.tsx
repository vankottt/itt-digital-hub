import type { Locale } from "@/lib/i18n";
import type { Person } from "@/content/types";
import { publicProfileLinks } from "@/content/people";

/**
 * Profile row for confirmed people. Renders only fields that exist:
 * name, confirmed role, affiliation, expertise, short bio, verified non-LinkedIn links.
 */
export function PersonCard({ person, locale, expertiseLabel }: { person: Person; locale: Locale; expertiseLabel: string }) {
  const links = publicProfileLinks(person);
  return (
    <li className="grid gap-4 border-b border-line py-6 md:grid-cols-12 md:gap-8">
      <div className="md:col-span-4">
        <h3 className="text-h3 text-ink">{person.name[locale]}</h3>
        {person.role ? <p className="mt-1 text-small font-medium text-ink-2">{person.role[locale]}</p> : null}
        {person.affiliation ? <p className="mt-1 text-small text-ink-3">{person.affiliation[locale]}</p> : null}
      </div>
      <div className="md:col-span-8">
        <div className="space-y-3 text-body text-ink-2">
          {person.bio[locale].map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
        {person.expertise[locale].length ? (
          <div className="mt-4">
            <p className="label mb-2">{expertiseLabel}</p>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5 text-small text-ink-2">
              {person.expertise[locale].map((e) => (
                <li key={e} className="flex items-center gap-2">
                  <span aria-hidden="true" className="h-px w-3 bg-line-strong" />
                  {e}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
        {links.length ? (
          <ul className="mt-4 flex flex-wrap gap-x-5 text-small">
            {links.map((l) => (
              <li key={l.url}>
                <a href={l.url} className="link-quiet" rel="noopener noreferrer" target="_blank">
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </li>
  );
}
