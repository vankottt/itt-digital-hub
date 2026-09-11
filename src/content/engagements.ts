import type { L } from "@/lib/i18n";

export type EngagementKind = "itt-client" | "previous-professional" | "founder-owned" | "internal-rd" | "unverified";

export interface Engagement {
  id: string;
  name: L;
  sector: L;
  work: L;
  kind: EngagementKind;
  kindLabel: L;
  note?: L;
}

/**
 * Credibility layer — not a client logo wall.
 * Do not imply a client relationship unless kind is `itt-client`.
 */
export const engagements: Engagement[] = [
  {
    id: "atn",
    name: { bg: "ATN", en: "ATN" },
    sector: { bg: "Гаранционни и следпродажбени операции", en: "Warranty / after-sales operations" },
    work: { bg: "Бизнес системи · дигитализация на процеси", en: "Business systems · workflow digitisation" },
    kind: "unverified",
    kindLabel: { bg: "Оперативен контекст", en: "Operational context" },
  },
  {
    id: "solar",
    name: { bg: "Слънчева инфраструктура", en: "Solar infrastructure" },
    sector: { bg: "Възобновяема енергия", en: "Renewable energy" },
    work: { bg: "Операции · софтуер · приложен AI", en: "Operations · software · applied AI" },
    kind: "founder-owned",
    kindLabel: { bg: "Свързана оперативна среда", en: "Related operational environment" },
  },
  {
    id: "local-ai",
    name: { bg: "Локален AI", en: "Local AI" },
    sector: { bg: "Вътрешна разработка", en: "Internal R&D" },
    work: { bg: "Оркестрация · модели · инструменти", en: "Orchestration · models · tools" },
    kind: "internal-rd",
    kindLabel: { bg: "Вътрешна разработка / прототип", en: "Internal R&D / prototype" },
  },
];
