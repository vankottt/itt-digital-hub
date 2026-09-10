import { isDevFixturesEnabled } from "./dev-fixtures";
import type { Person } from "./types";

/**
 * Public founders only. Unverified biography facts stay on TODO markers.
 */
const confirmedPeople: Person[] = [
  {
    slug: "ivan-todorov",
    name: { bg: "Иван Тодоров", en: "Ivan Todorov" },
    role: {
      bg: "Консултант по бизнес системи и AI решения",
      en: "Business Systems & AI Solutions Consultant",
    },
    expertise: {
      bg: [
        "Анализ на бизнес процеси",
        "Salesforce / CRM",
        "Корпоративни системи",
        "Автоматизация",
        "Проектиране на решения",
      ],
      en: [
        "Business-process analysis",
        "Salesforce / CRM",
        "Enterprise systems",
        "Automation",
        "Solution design",
      ],
    },
    bio: {
      bg: [
        "Работи от страна на процеса и бизнес системите: как реално тече работата, къде се чупи и какво има смисъл да се изгради.",
        "TODO_CONTENT — кратка потвърдена биография. Без измислени години, работодатели или метрики.",
      ],
      en: [
        "Works from the process and business-systems side: how the work actually runs, where it breaks, and what is worth building.",
        "TODO_CONTENT — short confirmed biography. No invented years, employers or metrics.",
      ],
    },
    portrait: {
      src: "/images/team/ivan-todorov-portrait.jpg",
      width: 819,
      height: 1024,
    },
    links: [{ label: "LinkedIn", url: "https://www.linkedin.com/in/ivan-todorov-30152428/" }],
    projects: ["atn-warranty-portal"],
  },
  {
    slug: "ivan-tomchev",
    name: { bg: "Иван Томчев", en: "Ivan Tomchev" },
    role: {
      bg: "Архитект на AI системи и софтуерен инженер",
      en: "AI Systems Architect & Software Engineer",
    },
    expertise: {
      bg: ["Софтуерна архитектура", "AI системи", "Локален AI", "Оркестрация", "Интеграции"],
      en: ["Software architecture", "AI systems", "Local AI", "Orchestration", "Integrations"],
    },
    bio: {
      bg: [
        "Проектира и изгражда сложен софтуер и AI системи, с фокус върху локален AI, оркестрация, интеграции и оперативни приложения.",
        "TODO_CONTENT — потвърдени факти за компанията за слънчеви паркове, образование и точен технологичен стек. LinkedIn: TODO_CONTENT.",
      ],
      en: [
        "Designs and builds complex software and AI systems, with a focus on local AI, orchestration, integrations and operational applications.",
        "TODO_CONTENT — confirmed facts on the solar-park company, education and exact technology stack. LinkedIn: TODO_CONTENT.",
      ],
    },
    portrait: {
      src: "/images/team/ivan-tomchev-portrait.jpg",
      width: 819,
      height: 1024,
      objectPosition: "center top",
    },
    projects: ["ai-assisted-solar-operations", "local-ai-orchestration"],
  },
];

const DEV_JOIN_PLACEHOLDER_SLUG = "dev-fixture-researcher";

const devFixtures: Person[] = [
  {
    slug: DEV_JOIN_PLACEHOLDER_SLUG,
    name: { bg: "Тук може да си ти!", en: "This could be you!" },
    role: { bg: "Виж как да се включиш!", en: "See how to join." },
    expertise: { bg: [], en: [] },
    bio: {
      bg: ["Фикстура за разработка. Не се показва в публичния ITT сайт."],
      en: ["Development fixture. Not shown on the public ITT site."],
    },
  },
];

export const devFixturesEnabled = isDevFixturesEnabled();

export const people: Person[] = devFixturesEnabled ? [...confirmedPeople, ...devFixtures] : confirmedPeople;

/** ITT is two people. No vacant “join us” slot on the public site. */
export const teamUpcomingCount = 0;

export function joinSlotCount(visible: Person[]): number {
  if (visible.some((person) => person.slug === DEV_JOIN_PLACEHOLDER_SLUG)) return 0;
  return teamUpcomingCount;
}

export function isJoinPlaceholder(person: Person): boolean {
  return person.slug === DEV_JOIN_PLACEHOLDER_SLUG;
}

export function getPerson(slug: string): Person | undefined {
  return people.find((p) => p.slug === slug);
}

export function withSeedPortrait(person: Person): Person {
  const seed = people.find((p) => p.slug === person.slug);
  if (!seed) return person;
  return {
    ...person,
    portrait: person.portrait ?? seed.portrait,
    links: person.links?.length ? person.links : seed.links,
  };
}

export function linkedInHref(person: Person): string | undefined {
  for (const link of person.links ?? []) {
    try {
      const host = new URL(link.url).hostname.replace(/^www\./i, "").toLowerCase();
      if (host === "linkedin.com" || host.endsWith(".linkedin.com")) return link.url;
    } catch {
      /* skip malformed URLs */
    }
  }
  return undefined;
}

export function publicTeamList(fromCms: Person[]): Person[] {
  if (fromCms.length) {
    const bySlug = new Map(fromCms.map((p) => [p.slug, withSeedPortrait(p)]));
    const ordered = people.map((seed) => bySlug.get(seed.slug)).filter((p): p is Person => Boolean(p));
    const extras = fromCms.filter((p) => !people.some((seed) => seed.slug === p.slug)).map(withSeedPortrait);
    return [...ordered, ...extras];
  }
  return people;
}
