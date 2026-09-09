import type { L, Locale } from "@/lib/i18n";
import type { Stage } from "./types";

/** Public working method. Not a consulting theatre of six stages. */
export const approachStages: Stage[] = [
  {
    code: "01",
    short: { bg: "Разбиране", en: "Understand" },
    title: { bg: "Разбиране", en: "Understand" },
    body: {
      bg: "Работен процес, хора, системи, данни, ограничения и реалният бизнес проблем — преди да се избере технология.",
      en: "Workflow, people, systems, data, constraints and the actual business problem — before choosing a technology.",
    },
  },
  {
    code: "02",
    short: { bg: "Проектиране", en: "Design" },
    title: { bg: "Проектиране", en: "Design" },
    body: {
      bg: "Подходящата комбинация от AI, автоматизация, софтуер, интеграции, данни и човешки контрол.",
      en: "The right combination of AI, automation, software, integration, data and human control.",
    },
  },
  {
    code: "03",
    short: { bg: "Изграждане", en: "Build" },
    title: { bg: "Изграждане", en: "Build" },
    body: {
      bg: "Изпълнение на системата на практика. Същите старши хора, които разбират проблема, остават в реализацията.",
      en: "Hands-on implementation. The same senior people who understood the problem stay involved in building it.",
    },
  },
];

export const approachName = {
  bg: "Разбиране · Проектиране · Изграждане",
  en: "Understand · Design · Build",
} satisfies L;

/** CMS stores one string; never show the English phrase on `/bg`. */
export function localizedApproachName(value: L | string | undefined, locale: Locale): string {
  const bg = typeof value === "string" ? value : value?.bg ?? "";
  const en = typeof value === "string" ? value : value?.en ?? "";
  const blob = `${bg} ${en}`;
  if (/understand/i.test(blob) || /разбиране/i.test(blob)) {
    return approachName[locale];
  }
  const localized = typeof value === "string" ? value : value?.[locale];
  return localized || approachName[locale];
}
