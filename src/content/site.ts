import type { L } from "@/lib/i18n";
import type { RouteKey } from "@/lib/paths";

export const site = {
  name: {
    bg: "ITT Digital Hub",
    en: "ITT Digital Hub",
  } satisfies L,
  /** Two-line header lockup; `name` stays the single-line form for metadata. */
  nameLines: {
    bg: ["ITT", "Digital Hub"],
    en: ["ITT", "Digital Hub"],
  } satisfies { bg: readonly [string, string]; en: readonly [string, string] },
  short: { bg: "ITT", en: "ITT" } satisfies L,
  descriptor: {
    bg: "Приложен AI консултинг",
    en: "Applied AI Consultancy",
  } satisfies L,
  /** Temporary lockup line until the final mark arrives. Not a parent institution. */
  anchor: {
    bg: "Приложен AI консултинг",
    en: "Applied AI Consultancy",
  } satisfies L,
  anchorShort: { bg: "ITT", en: "ITT" } satisfies L,
  description: {
    bg: "ITT Digital Hub съчетава разбиране на бизнес процеси с практическо софтуерно инженерство, за да проектира и изгражда AI решения около реални операции, съществуващи системи и данни.",
    en: "ITT Digital Hub combines business process expertise and hands-on software engineering to design and build AI solutions around real operations, existing systems and data.",
  } satisfies L,
  contactNote: {
    bg: "Директен контакт:",
    en: "Direct contact:",
  } satisfies L,
};

export const contactEmail = "office@ittdigitalhub.uk";

export const contactPhones = ["+359 895 581 911", "+359 899 811 455"] as const;

export interface NavItem {
  key: RouteKey;
  label: L;
}

export const primaryNav: NavItem[] = [
  { key: "projects", label: { bg: "Работа", en: "Work" } },
  { key: "about", label: { bg: "Какво решаваме", en: "What we solve" } },
  { key: "methodology", label: { bg: "Подход", en: "Approach" } },
  { key: "people", label: { bg: "За нас", en: "About" } },
  { key: "work-with-us", label: { bg: "Контакт", en: "Contact" } },
];

export const footerNav: NavItem[] = [...primaryNav, { key: "privacy", label: { bg: "Поверителност", en: "Privacy" } }];
