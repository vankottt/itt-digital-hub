import type { L, Locale } from "@/lib/i18n";
import { href } from "@/lib/paths";

/** Localized catalogue row before a locale is applied. */
type ToolSource = {
  id: string;
  title: L;
  category: L;
  description: L;
  image: L;
  imageAlt: L;
  hrefKey?: "ai-act-agent" | "settlement-analyzer";
  status?: L;
  external?: boolean;
};

export type ToolItem = {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  imageAlt: string;
  href?: string;
  status?: string;
  external?: boolean;
};

const catalog: ToolSource[] = [
  {
    id: "ai-act-assistant",
    title: { bg: "AI Act асистент", en: "AI Act Assistant" },
    category: { bg: "AI · Регулации", en: "AI · Regulation" },
    description: {
      bg: "Практически асистент за ориентиране в AI Act и пример как се изгражда специализиран AI агент със собствени инструкции, източници и проверки.",
      en: "A practical AI Act assistant and an example of how a specialized AI agent is built with its own instructions, sources and validation.",
    },
    image: { bg: "/tools/ai-act-assistant-card-bg.png", en: "/tools/ai-act-assistant-card-en.png" },
    imageAlt: {
      bg: "Интерфейс на AI Act асистента с примерни въпроси и поле за въвеждане.",
      en: "AI Act Assistant interface with starter questions and an input field.",
    },
    hrefKey: "ai-act-agent",
  },
  {
    id: "settlement-analyzer",
    title: { bg: "Анализатор на населени места", en: "Settlement Analyzer" },
    category: { bg: "Данни · Анализ", en: "Data · Analysis" },
    description: {
      bg: "Интерактивен инструмент за анализ на данни за населени места при инженерни, инфраструктурни и проектантски задачи.",
      en: "An interactive tool for settlement data analysis for engineering, infrastructure and planning tasks.",
    },
    image: { bg: "/tools/settlement-analyzer-card-bg.png", en: "/tools/settlement-analyzer-card-en.png" },
    imageAlt: {
      bg: "Анализатор на населени места: карта и пространствени резултати.",
      en: "Settlement Analyzer: map and spatial results.",
    },
    hrefKey: "settlement-analyzer",
  },
];

export function toolsFor(locale: Locale): ToolItem[] {
  return catalog.map((item) => ({
    id: item.id,
    title: item.title[locale],
    category: item.category[locale],
    description: item.description[locale],
    image: item.image[locale],
    imageAlt: item.imageAlt[locale],
    href: item.hrefKey ? href(locale, item.hrefKey) : undefined,
    status: item.status?.[locale],
    external: item.external,
  }));
}
