import type { L } from "@/lib/i18n";

export interface ProblemClass {
  code: string;
  title: L;
  body: L;
}

export const problemClasses: ProblemClass[] = [
  {
    code: "01",
    title: { bg: "Автоматизираме рутината", en: "We automate the routine" },
    body: {
      bg: "Досадни задачи отиват при машината. Хората се фокусират върху работата, която носи стойност.",
      en: "Tedious tasks go to the machine. People focus on work that creates value.",
    },
  },
  {
    code: "02",
    title: { bg: "Свързваме информацията", en: "We connect the information" },
    body: {
      bg: "Всичко е на едно място. Няма търсене в имейли, таблици и чатове.",
      en: "Everything in one place. No searching through emails, spreadsheets and chats.",
    },
  },
  {
    code: "03",
    title: { bg: "Интегрираме системите", en: "We integrate the systems" },
    body: {
      bg: "Софтуер, данни и решения работят заедно. Не в изолация.",
      en: "Software, data and decisions work together. Not in isolation.",
    },
  },
];
