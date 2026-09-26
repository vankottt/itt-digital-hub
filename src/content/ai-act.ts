import type { Locale } from "@/lib/i18n";

export type ExampleId =
  | "missing-information"
  | "article-lookup"
  | "roles"
  | "employment"
  | "timeline"
  | "missing-article"
  | "use-case";

export type ComparisonExample = {
  id: ExampleId;
  title: Record<Locale, string>;
  prompt: Record<Locale, string>;
};

export const comparisonExamples: ComparisonExample[] = [
  {
    id: "missing-information",
    title: { bg: "Непълна информация", en: "Missing information" },
    prompt: {
      bg: "Разработваме AI chatbot за служители. Попада ли под high-risk AI?",
      en: "We are building an AI chatbot for employees. Does it fall under high-risk AI?",
    },
  },
  {
    id: "article-lookup",
    title: { bg: "Нормативен източник", en: "Authoritative source" },
    prompt: {
      bg: "Какво изисква член 4 относно AI literacy?",
      en: "What does Article 4 require on AI literacy?",
    },
  },
  {
    id: "roles",
    title: { bg: "Роли и задължения", en: "Roles and duties" },
    prompt: {
      bg: "Използваме външен AI модел в собственото си приложение. Provider ли сме или deployer?",
      en: "We use an external AI model inside our own application. Are we a provider or a deployer?",
    },
  },
  {
    id: "employment",
    title: { bg: "Практически казус", en: "Practical case" },
    prompt: {
      bg: "Искаме да използваме AI за предварителен подбор на кандидати. Какво трябва да проверим?",
      en: "We want to use AI for preliminary screening of job candidates. What should we check?",
    },
  },
  {
    id: "timeline",
    title: { bg: "Времева приложимост", en: "Application timeline" },
    prompt: {
      bg: "Кои задължения по AI Act вече се прилагат и кои влизат в сила по-късно?",
      en: "Which AI Act obligations already apply, and which take effect later?",
    },
  },
  {
    id: "missing-article",
    title: { bg: "Несъществуващо правило", en: "Non-existent rule" },
    prompt: {
      bg: "Какво пише в член 999 относно задължителната регистрация на всички chatbot-и?",
      en: "What does Article 999 say about the mandatory registration of every chatbot?",
    },
  },
  {
    id: "use-case",
    title: { bg: "Анализ на AI use case", en: "AI use-case analysis" },
    prompt: {
      bg: "Имам AI use case. Помогни ми да разбера какво се прилага.",
      en: "I have an AI use case. Help me understand what applies.",
    },
  },
];

export function exampleById(id: string): ComparisonExample | undefined {
  return comparisonExamples.find((example) => example.id === id);
}

export const aiAct = {
  meta: {
    title: { bg: "AI Act асистент", en: "AI Act Assistant" },
    description: {
      bg: "Специализиран ход за AI Act върху общ AI модел: нормативни източници, роли и приложимост, без измислен текст.",
      en: "A specialized AI Act workflow on a general AI model: authoritative sources, roles and applicability, without invented text.",
    },
  },
  compareMeta: {
    title: { bg: "Сравнение · AI Act асистент", en: "Comparison · AI Act Assistant" },
    description: {
      bg: "Един и същ въпрос и един и същ AI модел. Отдясно е специализираният ход за AI Act на ITT Digital Hub.",
      en: "The same question and the same AI model. The right side uses ITT Digital Hub's specialized AI Act workflow.",
    },
  },
  back: { bg: "Инструменти", en: "Tools" },
  label: { bg: "AI Act · Специализиран работен процес", en: "AI Act · Specialized workflow" },
  heading: { bg: "AI Act асистент", en: "AI Act Assistant" },
  lead: {
    bg: "Общ AI модел, подреден за въпроси по AI Act. От едната страна е обикновеният отговор. От другата е същият модел със специализирани източници и професионален ход от ITT Digital Hub.",
    en: "A general AI model, arranged for AI Act questions. One side is the ordinary answer. The other is the same model with specialized sources and a professional workflow from ITT Digital Hub.",
  },
  points: [
    {
      label: { bg: "Какво добавяме.", en: "What we add." },
      text: { bg: "Нормативни източници, роли, приложимост и ясна граница между текста и тълкуването.", en: "Authoritative sources, roles, applicability, and a clear line between the text and the explanation." },
    },
    {
      label: { bg: "Какво не правим.", en: "What we do not do." },
      text: { bg: "Не класифицираме система, когато решаващите факти липсват, и не допълваме липсващ член.", en: "We do not classify a system when the deciding facts are missing, and we do not fill in a missing article." },
    },
  ],
  sections: [
    {
      title: { bg: "За какво е", en: "What it is for" },
      body: {
        bg: "За въпроси дали AI Act изобщо засяга даден случай, коя роля може да се окаже релевантна, кой член говори по темата и кои дати на приложение са в заредения текст. Подходящ е за екип, който иска ориентир преди разговор с юрист.",
        en: "For questions about whether the AI Act may affect a case, which role might be relevant, which article speaks to the topic, and which application dates are in the loaded text. It suits a team that wants a bearing before speaking with counsel.",
      },
    },
    {
      title: { bg: "Какво се специализира", en: "What specialization changes" },
      body: {
        bg: "Моделът е същият. ITT Digital Hub добавя хода на работа, извадките от регламента и официалните насоки, и правилото да се каже когато колекцията не съдържа даден текст. Моделът не става по-умен. Става по-полезен за този въпрос, защото се опира на тях.",
        en: "The model is the same. ITT Digital Hub adds the working sequence, the regulation extracts and the official guidance, and the rule to say when the collection does not contain a text. The model does not become smarter. It becomes more useful for this question because it can rely on them.",
      },
    },
    {
      title: { bg: "Граница", en: "Limit" },
      body: {
        bg: "Асистентът помага да се разбере и анализира AI Act. Той не замества правна консултация, когато такава е необходима. Заредените текстове са извадки, не Официален вестник.",
        en: "The assistant supports understanding and analysis of the AI Act. It does not replace professional legal advice where that advice is required. The loaded texts are extracts, not the Official Journal.",
      },
    },
  ],
  compareCta: { bg: "Сравни отговорите", en: "Compare responses" },
  compareHint: {
    bg: "Един въпрос към същия модел, с и без специализирания ход.",
    en: "One question to the same model, with and without the specialized workflow.",
  },
  compare: {
    back: { bg: "Инструменти", en: "Tools" },
    heading: { bg: "Един въпрос.\nДва начина да разберете AI Act.", en: "One question.\nTwo ways to read the AI Act." },
    lead: {
      bg: "И двата отговора се генерират от един и същ AI модел по един и същ въпрос.",
      en: "Both answers are generated by the same AI model from the same question.",
    },
    leadPoints: [
      {
        label: { bg: "Стандартен модел.", en: "Standard model." },
        text: { bg: "Без специализирана AI Act база.", en: "Without a specialized AI Act collection." },
      },
      {
        label: { bg: "AI Act асистент.", en: "AI Act Assistant." },
        text: { bg: "Специализирани източници и професионален ход от ITT Digital Hub.", en: "Specialized sources and a professional workflow from ITT Digital Hub." },
      },
    ],
    promptLabel: { bg: "Въпрос", en: "Question" },
    promptPlaceholder: {
      bg: "Напишете един въпрос за AI Act, роля, член или конкретен use case.",
      en: "Write one question about the AI Act, a role, an article, or a specific use case.",
    },
    examples: { bg: "Примерни случаи", en: "Example cases" },
    fairness: { bg: "Един и същ модел · Един и същ въпрос", en: "Same model · Same question" },
    submit: { bg: "Сравни отговорите", en: "Compare responses" },
    pending: { bg: "Сравнението тече", en: "Comparison in progress" },
    controlTitle: { bg: "Стандартен AI модел", en: "Standard AI model" },
    expertTitle: { bg: "AI Act асистент от ITT Digital Hub", en: "AI Act Assistant from ITT Digital Hub" },
    controlNote: { bg: "Без специализирана AI Act база", en: "Without the specialized AI Act collection" },
    expertNote: { bg: "Със специализирани източници и инструкции.", en: "With specialized sources and instructions." },
    controlWaiting: { bg: "Генерира отговор…", en: "Generating an answer…" },
    expertWaiting: { bg: "Подготвя специализиран отговор…", en: "Preparing a specialized answer…" },
    idle: { bg: "Отговорът ще се появи тук.", en: "The answer will appear here." },
    sourcesTitle: { bg: "Източници", en: "Sources" },
    sourceOne: { bg: "1 използван източник", en: "1 source used" },
    sourceMany: { bg: "използвани източници", en: "sources used" },
    retrieval: { bg: "Търсене в специализираната база", en: "Search in the specialized collection" },
    tools: { bg: "Използвани инструменти", en: "Tools used" },
    toolRetrieval: { bg: "Търсене в нормативната база", en: "Search in the regulatory collection" },
    toolReference: { bg: "Преглед на конкретен запис", en: "Lookup of a specific record" },
    toolCatalogue: { bg: "Преглед на каталога", en: "Catalogue lookup" },
    kindLaw: { bg: "Регламент", en: "Regulation" },
    kindGuidance: { bg: "Официални насоки", en: "Official guidance" },
    kindNote: { bg: "Практическо обяснение, не е текст на регламента", en: "Practical explanation, not the regulation text" },
    disclosure: {
      bg: "Асистентът помага да се разбере и анализира AI Act. Той не замества правна консултация, когато такава е необходима.",
      en: "The assistant supports understanding and analysis of the AI Act. It does not replace professional legal advice where that advice is required.",
    },
    unfair: {
      bg: "Сравнението не е показано като равностойно, защото услугата не потвърди един и същ модел за двете страни.",
      en: "The comparison is not presented as equivalent, because the service did not confirm the same model on both sides.",
    },
    errors: {
      timeout: { bg: "Тази страна не отговори в определеното време.", en: "This side did not answer within the time limit." },
      upstream: { bg: "Тази страна не можа да бъде изпълнена.", en: "This side could not be completed." },
      configuration: { bg: "Сравнението не е включено в тази среда.", en: "The comparison is not enabled in this environment." },
      model_mismatch: { bg: "Услугата върна друг модел. Резултатът не се показва.", en: "The service returned a different model. The result is hidden." },
      empty: { bg: "Няма текст за показване.", en: "There is no text to show." },
      rate_limited: { bg: "Твърде много сравнения за кратко време.", en: "Too many comparisons in a short time." },
      invalid_prompt: { bg: "Въведете въпрос до 4000 знака.", en: "Enter a question of up to 4000 characters." },
    },
  },
};
