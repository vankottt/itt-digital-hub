import type { Locale } from "@/lib/i18n";
import { isDevFixturesEnabled } from "./dev-fixtures";
import type { Person } from "./types";

export type PersonIntroVariant = "card" | "profile";

/**
 * Public founders only. Names, roles and first-person copy are confirmed;
 * unverified employers, years, education and metrics stay out of the record.
 */
const confirmedPeople: Person[] = [
  {
    slug: "ivan-todorov",
    name: { bg: "Иван Тодоров", en: "Ivan Todorov" },
    axis: { bg: "AI / Трансформация", en: "AI / Transformation" },
    role: {
      bg: "Консултант по AI стратегия и бизнес трансформация",
      en: "AI Strategy & Business Transformation Consultant",
    },
    expertise: {
      bg: [
        "AI стратегия",
        "Бизнес трансформация",
        "Проектиране на процеси",
        "Автоматизация",
        "Корпоративни системи",
      ],
      en: ["AI Strategy", "Business Transformation", "Process Design", "Automation", "Enterprise Systems"],
    },
    cardBio: {
      bg: [
        "Работя на пресечната точка между бизнес стратегията, процесите и приложния AI. Фокусирам се върху това да разбирам как реално работят организациите, къде възникват затруднения и къде технологиите могат да създадат реална стойност.",
        "В ITT Digital Hub водя discovery, AI стратегията и оформянето на решения, превръщайки бизнес нуждите в практически инициативи за трансформация.",
      ],
      en: [
        "I work at the intersection of business strategy, processes and applied AI. I focus on understanding how organisations actually work, where friction appears and where technology can create meaningful value.",
        "At ITT Digital Hub, I lead discovery, AI strategy and solution shaping, turning business needs into practical transformation initiatives.",
      ],
    },
    bio: {
      bg: [
        "Работата ми обединява бизнес анализ, оптимизация на процеси, корпоративни системи и приложен AI. Фокусирам се първо върху реалния оперативен проблем и едва след това върху технологията, която трябва да го реши.",
        "Работя с организации за разбиране на работните процеси, откриване на неефективности и превръщане на бизнес нуждите в ясни възможности за трансформация. Решението може да включва AI, автоматизация, корпоративни платформи или комбинация от технологии според конкретната ситуация.",
        "В ITT Digital Hub водя работата по AI стратегия, discovery и бизнес трансформация и оставам ангажиран през валидирането и реализацията. Целта ми е технологията да създава измерима оперативна стойност, а не просто да добавя още един изолиран инструмент.",
      ],
      en: [
        "My work combines business analysis, process improvement, enterprise systems and applied AI. I focus on identifying the real operational problem before deciding what technology should be used to solve it.",
        "I work with organisations to understand workflows, uncover inefficiencies and translate business needs into clear transformation opportunities. This can involve AI, automation, enterprise platforms or a combination of technologies, depending on what the situation actually requires.",
        "At ITT Digital Hub, I lead AI strategy, discovery and business transformation work and stay involved through validation and delivery. My goal is to ensure that technology creates measurable operational value rather than becoming another isolated tool.",
      ],
    },
    portrait: {
      src: "/images/team/ivan-todorov-portrait-v2.jpg",
      width: 819,
      height: 1024,
    },
    projects: ["atn-warranty-portal"],
  },
  {
    slug: "ivan-tomchev",
    name: { bg: "Иван Томчев", en: "Ivan Tomchev" },
    axis: { bg: "AI / Инженеринг", en: "AI / Engineering" },
    role: {
      bg: "Архитект на системи с AI и софтуерен инженер",
      en: "AI Systems Architect & Software Engineer",
    },
    expertise: {
      bg: ["Софтуерна архитектура", "Local AI", "Оркестрация", "Интеграции", "Инфраструктура"],
      en: ["Software Architecture", "Local AI", "Orchestration", "Integrations", "Infrastructure"],
    },
    cardBio: {
      bg: [
        "Проектирам и изграждам софтуерни и AI системи за сложни оперативни среди, с фокус върху архитектура, локален AI, оркестрация и системни интеграции.",
        "В ITT Digital Hub водя техническата архитектура и инженерната реализация, превръщайки валидираните концепции в надеждни системи за реална експлоатация.",
      ],
      en: [
        "I design and build software and AI systems for complex operational environments, with a focus on architecture, local AI, orchestration and system integration.",
        "At ITT Digital Hub, I lead technical architecture and hands-on engineering, turning validated concepts into reliable operational systems.",
      ],
    },
    bio: {
      bg: [
        "Работя като софтуерен инженер и системен архитект, като проектирам надеждни системи за сложни оперативни среди. Работата ми включва софтуерна архитектура, интеграции, инфраструктура и инженерните решения, необходими за стабилната работа на системите в реална среда.",
        "При приложния AI се фокусирам върху локално изпълнение на модели, оркестрация, интеграция с инструменти и архитектури, при които AI е част от по-голяма софтуерна система, а не изолирана функционалност.",
        "В ITT Digital Hub водя техническата архитектура и инженерната реализация, като превръщам валидираните концепции в работещи системи чрез имплементация, интеграция и реално внедряване. Фокусът ми е върху системи, които са технически стабилни, поддържаеми и готови за реална експлоатация.",
      ],
      en: [
        "I work as a software engineer and systems architect, designing dependable systems for complex operational environments. My work spans software architecture, integrations, infrastructure and the engineering required to make systems reliable in production.",
        "In applied AI, I focus on local model execution, orchestration, tool integration and architectures where AI operates as part of a larger software system rather than as an isolated feature.",
        "At ITT Digital Hub, I lead technical architecture and engineering, taking validated concepts through implementation, integration and operational deployment. My focus is on building systems that are technically sound, maintainable and ready to work in real environments.",
      ],
    },
    portrait: {
      src: "/images/team/ivan-tomchev-portrait-v2.jpg",
      width: 859,
      height: 1024,
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

export function personEyebrow(person: Person, locale: Locale): string | undefined {
  return person.axis?.[locale] ?? person.role?.[locale];
}

export function personIntro(person: Person, locale: Locale, variant: PersonIntroVariant): string[] {
  if (variant === "card") return person.cardBio?.[locale] ?? person.bio[locale];
  return person.bio[locale];
}

export function withSeedPortrait(person: Person): Person {
  const seed = people.find((p) => p.slug === person.slug);
  if (!seed) return { ...person, links: publicProfileLinks(person) };
  return {
    ...person,
    portrait: person.portrait ?? seed.portrait,
    axis: person.axis ?? seed.axis,
    cardBio: person.cardBio ?? seed.cardBio,
    links: publicProfileLinks(person),
  };
}

export function isLinkedInUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./i, "").toLowerCase();
    return host === "linkedin.com" || host.endsWith(".linkedin.com");
  } catch {
    return false;
  }
}

export function publicProfileLinks(person: Person): Array<{ label: string; url: string }> {
  return (person.links ?? []).filter((link) => !isLinkedInUrl(link.url));
}

export function linkedInHref(person: Person): string | undefined {
  for (const link of person.links ?? []) {
    if (isLinkedInUrl(link.url)) return link.url;
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
