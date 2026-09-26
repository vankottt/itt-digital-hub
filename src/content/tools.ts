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
  hrefKey?: "ai-act-agent" | "settlement-analyzer" | "pipe-thermal-analysis" | "vik-designer" | "vik-proektant";
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
  {
    id: "pipe-thermal-analysis",
    title: { bg: "Топлинен анализ на тръбопроводи", en: "Pipe Thermal Analysis" },
    category: { bg: "Инженерство · Модели", en: "Engineering · Models" },
    description: {
      bg: "Анализира изстиването и топлинните загуби в изолиран PE тръбопровод и показва как температурата се променя с времето.",
      en: "Analyses cooling and heat loss in an insulated PE pipeline and shows how temperature changes over time.",
    },
    image: { bg: "/tools/pipe-thermal-analysis-card-bg.svg", en: "/tools/pipe-thermal-analysis-card-en.svg" },
    imageAlt: {
      bg: "Интерфейс на топлинния анализ: параметри, показатели и крива на температурата с времето.",
      en: "Pipe Thermal Analysis interface: parameters, indicators and a temperature-over-time curve.",
    },
    hrefKey: "pipe-thermal-analysis",
  },
  {
    id: "vik-designer",
    title: { bg: "ВиК Проектант", en: "WSS Designer" },
    category: { bg: "ВиК · Норми", en: "WSS · Rules" },
    description: {
      bg: "Нормативна справка за водоснабдяване, канализация, присъединяване и свързани изисквания.",
      en: "A normative lookup for water supply, sewerage, connections and related requirements.",
    },
    image: { bg: "/tools/vik-designer-card.svg", en: "/tools/vik-designer-card.svg" },
    imageAlt: {
      bg: "Техническа схема на водопроводна мрежа: магистрали, отклонения и възли.",
      en: "Technical drawing of a water network: mains, branches and nodes.",
    },
    hrefKey: "vik-designer",
  },
  {
    id: "vik-proektant",
    title: { bg: "ВиК Проектант V2", en: "ViK Projektant V2" },
    category: { bg: "ВиК · Работен процес", en: "WSS · Workflow" },
    description: {
      bg: "Специализиран ход за ВиК проектиране върху общ AI модел: източници, проверки и изчисления. Съществуващата нормативна справка остава отделно.",
      en: "A specialized water and sewerage workflow on a general AI model: sources, checks and calculations. The existing normative lookup stays separate.",
    },
    image: { bg: "/tools/vik-proektant-card.jpg", en: "/tools/vik-proektant-card.jpg" },
    imageAlt: {
      bg: "Илюстрация на ВиК Проектант: нормативна уредба, водопровод и канализационна шахта.",
      en: "ViK Projektant illustration: a regulation, water pipes and a sewer manhole.",
    },
    hrefKey: "vik-proektant",
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
