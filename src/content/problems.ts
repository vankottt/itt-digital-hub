import type { L } from "@/lib/i18n";

export interface ProblemClass {
  code: string;
  title: L;
  body: L;
}

export const problemClasses: ProblemClass[] = [
  {
    code: "01",
    title: { bg: "Разпокъсани процеси", en: "Fragmented workflows" },
    body: {
      bg: "Работа, разпръсната между хора, системи, имейл, таблици, ръчни предавания и несвързани приложения.",
      en: "Work split across people, systems, email, spreadsheets, manual handoffs and disconnected applications.",
    },
  },
  {
    code: "02",
    title: { bg: "Работа, натоварена със знание", en: "Knowledge-heavy work" },
    body: {
      bg: "Квалифицирани хора губят време да търсят, тълкуват, подготвят, проверяват, преобразуват и обобщават информация вместо да вършат по-ценната част от работата.",
      en: "Skilled people spend too long finding, interpreting, preparing, validating, transforming and summarising information instead of doing the higher-value part of the work.",
    },
  },
  {
    code: "03",
    title: { bg: "Сложни операции", en: "Complex operations" },
    body: {
      bg: "Случаи, в които софтуер, AI, данни, оперативен контекст, физически системи и човешки решения трябва да работят заедно.",
      en: "Settings where software, AI, data, operational context, physical systems and human decisions have to work together.",
    },
  },
];
