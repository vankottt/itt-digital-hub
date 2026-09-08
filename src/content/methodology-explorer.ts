import type { L } from "@/lib/i18n";
import { stages } from "./methodology";

/**
 * Explorer fields are restatements of the Action Plan's ten-stage methodology.
 * Fields without source support are omitted (no invented doctrine).
 */
export interface ExplorerStage {
  code: string;
  short: L;
  title: L;
  purpose: L;
  questions?: L<string[]>;
  analysed?: L<string[]>;
  output?: L;
  next?: L;
}

export const explorerFieldLabels = {
  purpose: { bg: "Предназначение", en: "Purpose" },
  questions: { bg: "Въпроси", en: "Questions" },
  analysed: { bg: "Какво се анализира", en: "What is analysed" },
  output: { bg: "Резултат от етапа", en: "Output" },
  next: { bg: "Връзка със следващия етап", en: "Relationship to the next stage" },
} as const;

export const explorerStages: ExplorerStage[] = [
  {
    code: "01",
    short: stages[0]!.short,
    title: stages[0]!.title,
    purpose: stages[0]!.body,
    questions: {
      bg: ["Какво е предназначението на системата?", "Какви са очакванията на заинтересованите страни?", "Спрямо кои измерими резултати ще бъде оценявана?"],
      en: ["What is the system's purpose?", "What do its stakeholders expect?", "Against which measurable outcomes will it be assessed?"],
    },
    output: {
      bg: "Изяснено предназначение, очаквания на заинтересованите страни и измерими резултати.",
      en: "A clarified purpose, stakeholder expectations and measurable outcomes.",
    },
    next: {
      bg: "Следва идентифициране на границите и архитектурата, които трябва да служат на тези цели.",
      en: "Next: identify the boundaries and architecture that must serve those goals.",
    },
  },
  {
    code: "02",
    short: stages[1]!.short,
    title: stages[1]!.title,
    purpose: stages[1]!.body,
    questions: {
      bg: ["Кои институционални компоненти, участници и роли са част от системата?", "Какви правни компетентности, технологии и зависимости я ограждат?"],
      en: ["Which institutional components, actors and roles belong to the system?", "What legal competences, technologies and dependencies bound it?"],
    },
    analysed: {
      bg: ["Институционални компоненти", "Участници и роли", "Правни компетентности", "Технологии и зависимости"],
      en: ["Institutional components", "Actors and roles", "Legal competences", "Technologies and dependencies"],
    },
    output: {
      bg: "Карта на границите и архитектурата на системата.",
      en: "A map of the system's boundaries and architecture.",
    },
    next: {
      bg: "Следва проследяване на процесите и алгоритмите вътре в тази архитектура.",
      en: "Next: trace the processes and algorithms inside that architecture.",
    },
  },
  {
    code: "03",
    short: stages[2]!.short,
    title: stages[2]!.title,
    purpose: stages[2]!.body,
    questions: {
      bg: ["Какви последователности при вземане на решения действат реално?", "Как текат информацията, формалните процедури, неформалните практики, стимулите и поведенческите реакции?"],
      en: ["What decision sequences actually operate?", "How do information, formal procedures, informal practices, incentives and behavioural responses run?"],
    },
    analysed: {
      bg: ["Последователности при вземане на решения", "Информационни потоци", "Формални процедури и неформални практики", "Стимули и поведенчески реакции"],
      en: ["Decision sequences", "Information flows", "Formal procedures and informal practices", "Incentives and behavioural responses"],
    },
    output: {
      bg: "Карта на процесите и алгоритмите, чрез които системата преобразува входове в решения и действия.",
      en: "A map of the processes and algorithms through which the system turns inputs into decisions and actions.",
    },
    next: {
      bg: "Следва оценка на качеството на информацията, върху която тези алгоритми се опираят.",
      en: "Next: assess the quality of the information those algorithms rely on.",
    },
  },
  {
    code: "04",
    short: stages[3]!.short,
    title: stages[3]!.title,
    purpose: stages[3]!.body,
    questions: {
      bg: ["Какви са качеството, пълнотата, навременността и надеждността на информацията, която системата използва при решенията си?"],
      en: ["What are the quality, completeness, timeliness and reliability of the information the system uses to decide?"],
    },
    analysed: {
      bg: ["Качество", "Пълнота", "Навременност", "Надеждност на информацията"],
      en: ["Quality", "Completeness", "Timeliness", "Reliability of information"],
    },
    output: {
      bg: "Оценка на входните данни и информацията, използвана при решенията.",
      en: "An assessment of the inputs and information used in decisions.",
    },
    next: {
      bg: "Следва изпитване на ефективността на системата спрямо нейните цели.",
      en: "Next: test the system's performance against its goals.",
    },
  },
  {
    code: "05",
    short: stages[4]!.short,
    title: stages[4]!.title,
    purpose: stages[4]!.body,
    questions: {
      bg: ["Как системата се представя спрямо целите, за които е създадена?"],
      en: ["How does the system perform against the goals it was created to serve?"],
    },
    analysed: stages[4]!.items!,
    output: {
      bg: "Оценка по показатели за резултатност, ефикасност, разходи, бързина, надеждност, справедливост, прозрачност, устойчивост, адаптивност и резултати за потребителите.",
      en: "An assessment against indicators of effectiveness, efficiency, cost, speed, reliability, fairness, transparency, resilience, adaptability and outcomes for users.",
    },
    next: {
      bg: "Следва анализ на дефектите и рисковете, които обясняват слабото представяне.",
      en: "Next: analyse the defects and risks that explain weak performance.",
    },
  },
  {
    code: "06",
    short: stages[5]!.short,
    title: stages[5]!.title,
    purpose: stages[5]!.body,
    questions: {
      bg: ["Къде архитектурата, правилата, координацията или стимулите водят до отказ?", "Как системата е уязвима спрямо външната среда?"],
      en: ["Where do architecture, rules, coordination or incentives produce failure?", "How is the system vulnerable to its environment?"],
    },
    analysed: {
      bg: ["Архитектурни слабости", "Тесни места", "Противоречащи си правила", "Координационни дефекти", "Непредвидени стимули", "Уязвимости спрямо външната среда"],
      en: ["Architectural weaknesses", "Bottlenecks", "Conflicting rules", "Coordination defects", "Unintended incentives", "Vulnerabilities to the external environment"],
    },
    output: {
      bg: "Карта на дефектите и рисковете, проследима до конкретни компоненти на системата.",
      en: "A map of defects and risks, traceable to specific system components.",
    },
    next: {
      bg: "Следва разработване и изпитване на алтернативни архитектури.",
      en: "Next: develop and test alternative architectures.",
    },
  },
  {
    code: "07",
    short: stages[6]!.short,
    title: stages[6]!.title,
    purpose: stages[6]!.body,
    questions: {
      bg: ["Какви алтернативни институционални, регулаторни, организационни и технологични архитектури могат да бъдат изпитани?"],
      en: ["Which alternative institutional, regulatory, organizational and technological architectures can be tested?"],
    },
    output: {
      bg: "Изпитани алтернативни архитектури, а не единствена препоръка „на хартия“.",
      en: "Tested alternative architectures, not a single paper recommendation.",
    },
    next: {
      bg: "Следва съгласуван пакет от препоръки, произтичащи от изпитаните алтернативи.",
      en: "Next: a coherent package of recommendations drawn from the tested alternatives.",
    },
  },
  {
    code: "08",
    short: stages[7]!.short,
    title: stages[7]!.title,
    purpose: stages[7]!.body,
    analysed: stages[7]!.items!,
    output: {
      bg: "Съгласуван пакет от промени в политиките, регулациите, организацията, процесите, поведението, дигиталните решения и управлението.",
      en: "A coherent package of policy, regulatory, organizational, process, behavioural, digital and governance changes.",
    },
    next: {
      bg: "Следва архитектура на изпълнението — кой прави какво, с какъв ресурс и при какъв риск.",
      en: "Next: an implementation architecture — who does what, with which resources and under which risks.",
    },
  },
  {
    code: "09",
    short: stages[8]!.short,
    title: stages[8]!.title,
    purpose: stages[8]!.body,
    questions: {
      bg: ["Кой носи отговорност?", "В каква последователност?", "С какви ресурси, точки за решения, етапи и механизми за риск?"],
      en: ["Who is responsible?", "In what sequence?", "With which resources, decision points, milestones and risk mechanisms?"],
    },
    analysed: {
      bg: ["Отговорности", "Последователност", "Необходими ресурси", "Точки за вземане на решения", "Етапи", "Управление на риска"],
      en: ["Responsibilities", "Sequencing", "Required resources", "Decision points", "Milestones", "Risk management"],
    },
    output: {
      bg: "Архитектура на изпълнението, по която препоръките могат да бъдат внедрени.",
      en: "An implementation architecture through which the recommendations can be delivered.",
    },
    next: {
      bg: "Следва създаване на механизми за наблюдение и адаптация след внедряването.",
      en: "Next: establish monitoring and adaptation after implementation.",
    },
  },
  {
    code: "10",
    short: stages[9]!.short,
    title: stages[9]!.title,
    purpose: stages[9]!.body,
    questions: {
      bg: ["Как препроектираната система ще бъде изпитвана и коригирана при промяна на условията?"],
      en: ["How will the redesigned system be tested and corrected as conditions change?"],
    },
    output: {
      bg: "Механизми за обратна връзка и показатели за ефективност, които затварят цикъла към целите.",
      en: "Feedback mechanisms and performance indicators that close the loop back to the goals.",
    },
    next: {
      bg: "Цикълът се затваря: наблюдението връща анализа към дефинирането на целите, когато средата или резултатите се променят.",
      en: "The loop closes: monitoring returns the analysis to defining goals when the environment or results change.",
    },
  },
];
