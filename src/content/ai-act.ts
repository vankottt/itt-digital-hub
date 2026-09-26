import type { Locale } from "@/lib/i18n";

export type ExampleId =
  | "design"
  | "responsibility"
  | "project-check"
  | "infrastructure"
  | "roles"
  | "article-4"
  | "open-case";

export type ComparisonExample = {
  id: ExampleId;
  title: Record<Locale, string>;
  prompt: Record<Locale, string>;
};

export const comparisonExamples: ComparisonExample[] = [
  {
    id: "design",
    title: { bg: "Проектиране с ИИ", en: "Design with AI" },
    prompt: {
      bg: "Използвам изкуствен интелект при оразмеряване и подготовка на техническа документация. Какви изисквания трябва да имам предвид?",
      en: "I use artificial intelligence when sizing and preparing technical documentation. What requirements should I keep in mind?",
    },
  },
  {
    id: "responsibility",
    title: { bg: "Отговорност на проектанта", en: "Designer responsibility" },
    prompt: {
      bg: "Ако използвам изкуствен интелект за предложение на техническо решение, какво трябва да имам предвид относно проверката и отговорността за крайния проект?",
      en: "If I use artificial intelligence to propose a technical solution, what should I consider about review and responsibility for the final design?",
    },
  },
  {
    id: "project-check",
    title: { bg: "Проверка на проект", en: "Design review" },
    prompt: {
      bg: "Използваме изкуствен интелект за автоматична проверка на инвестиционни проекти. Какво трябва да съобразим според Акта за изкуствения интелект?",
      en: "We use artificial intelligence to check investment designs automatically. What should we consider under the Artificial Intelligence Act?",
    },
  },
  {
    id: "infrastructure",
    title: { bg: "Управление на инфраструктура", en: "Infrastructure control" },
    prompt: {
      bg: "Система с изкуствен интелект автоматично управлява помпи и налягане във водоснабдителна мрежа. Кога подобна система може да попадне в категория с висок риск?",
      en: "An artificial-intelligence system automatically controls pumps and pressure in a water-supply network. When could such a system fall into a high-risk category?",
    },
  },
  {
    id: "roles",
    title: { bg: "Роли и задължения", en: "Roles and duties" },
    prompt: {
      bg: "Проектантска фирма използва външен модел с изкуствен интелект за анализ на документи и чертежи. Каква може да бъде ролята ѝ според Акта за изкуствения интелект?",
      en: "A design firm uses an external artificial-intelligence model to analyse documents and drawings. What role might it have under the Artificial Intelligence Act?",
    },
  },
  {
    id: "article-4",
    title: { bg: "Грамотност в областта на ИИ", en: "AI literacy" },
    prompt: {
      bg: "Какво изисква член 4 от организация, чиито инженери използват инструменти с изкуствен интелект в работата си?",
      en: "What does Article 4 require of an organisation whose engineers use artificial-intelligence tools in their work?",
    },
  },
  {
    id: "open-case",
    title: { bg: "Моят конкретен случай", en: "My specific case" },
    prompt: {
      bg: "Искам да използвам изкуствен интелект в проектантската си работа. Помогни ми да разбера какви изисквания могат да се прилагат.",
      en: "I want to use artificial intelligence in my design work. Help me understand which requirements may apply.",
    },
  },
];

export function exampleById(id: string): ComparisonExample | undefined {
  return comparisonExamples.find((example) => example.id === id);
}

export const aiAct = {
  meta: {
    title: { bg: "Акт за изкуствения интелект", en: "AI Act Assistant" },
    description: {
      bg: "Специализиран асистент за Акта за изкуствения интелект: нормативен текст, роли и приложимост, включително при проектантска работа.",
      en: "A specialist assistant for the Artificial Intelligence Act: the regulation, roles and applicability, including design practice.",
    },
  },
  compareMeta: {
    title: { bg: "Сравнение · Акт за изкуствения интелект", en: "Comparison · AI Act Assistant" },
    description: {
      bg: "Един и същ въпрос и един и същ модел. Отдясно е специализираният асистент на ITT Digital Hub.",
      en: "The same question and the same model. The right side is ITT Digital Hub's specialist assistant.",
    },
  },
  back: { bg: "Инструменти", en: "Tools" },
  label: { bg: "Специализиран асистент", en: "Specialist assistant" },
  heading: { bg: "Акт за изкуствения интелект", en: "AI Act Assistant" },
  lead: {
    bg: "Регламентът е общ. Трудното е да се разбере какво означава за конкретната професионална дейност. От едната страна е обикновеният отговор. От другата е същият модел със заредения нормативен текст и професионален контекст от ITT Digital Hub.",
    en: "The regulation is broad. The difficult part is what it means for a specific professional activity. One side is the ordinary answer. The other is the same model with the loaded legal text and professional context from ITT Digital Hub.",
  },
  points: [
    {
      label: { bg: "Какво добавяме.", en: "What we add." },
      text: { bg: "Нормативен текст, роли, дати на прилагане и ясна граница между регламента и обяснението.", en: "The regulation, roles, application dates, and a clear line between the text and the explanation." },
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
        bg: "За въпроси дали регламентът засяга даден случай, коя правна роля може да е относима, кой член говори по темата и кои дати са в заредения текст. Подходящ е преди разговор с юрист.",
        en: "For questions about whether the regulation affects a case, which legal role may be relevant, which article speaks to the topic, and which dates are in the loaded text. It is a bearing before speaking with counsel.",
      },
    },
    {
      title: { bg: "Какво се специализира", en: "What specialization changes" },
      body: {
        bg: "Моделът е същият. ITT Digital Hub добавя начина на работа, българския консолидиран текст и правилото да се каже, когато колекцията не съдържа даден член. Моделът не става по-умен. Става по-полезен, защото се опира на този текст.",
        en: "The model is the same. ITT Digital Hub adds the working sequence, the Bulgarian consolidated text, and the rule to say when the collection does not contain an article. The model does not become smarter. It becomes more useful because it can rely on that text.",
      },
    },
    {
      title: { bg: "Граница", en: "Limit" },
      body: {
        bg: "Асистентът помага да се разбере и анализира Актът за изкуствения интелект. Той не замества правна консултация, когато такава е необходима, и не определя сам професионалната отговорност за инвестиционен проект.",
        en: "The assistant supports understanding and analysis of the Artificial Intelligence Act. It does not replace professional legal advice where that advice is required, and it does not by itself decide professional responsibility for an investment design.",
      },
    },
  ],
  compareCta: { bg: "Сравни отговорите", en: "Compare responses" },
  audienceTitle: { bg: "При професионална работа", en: "In professional work" },
  audience: {
    bg: "Регламентът е общ. Тук примерите са за проектантски организации, инженери, инфраструктурни оператори, технически консултанти и смесени проектантски екипи. Професията не замества правния анализ.",
    en: "The regulation is general. The examples here are for design organisations, engineers, infrastructure operators, technical consultants and mixed design teams. The profession does not replace the legal analysis.",
  },
  compareHint: {
    bg: "Един въпрос към същия модел, със и без специализирания асистент.",
    en: "One question to the same model, with and without the specialist assistant.",
  },
  compare: {
    back: { bg: "Инструменти", en: "Tools" },
    heading: { bg: "Един въпрос.\nДва начина да разберете акта.", en: "One question.\nTwo ways to read the Act." },
    lead: {
      bg: "И двата отговора се генерират от един и същ модел по един и същ въпрос.",
      en: "Both answers are generated by the same model from the same question.",
    },
    leadPoints: [
      {
        label: { bg: "Стандартен модел.", en: "Standard model." },
        text: { bg: "Без специализираната нормативна база.", en: "Without the specialized regulatory collection." },
      },
      {
        label: { bg: "Специализиран асистент.", en: "Specialist assistant." },
        text: { bg: "Нормативен текст и професионален контекст от ITT Digital Hub.", en: "The regulation and professional context from ITT Digital Hub." },
      },
    ],
    promptLabel: { bg: "Въпрос", en: "Question" },
    promptPlaceholder: {
      bg: "Напишете един въпрос за акта, за роля, за член или за конкретен случай.",
      en: "Write one question about the Act, a role, an article, or a specific situation.",
    },
    examples: { bg: "Примерни случаи", en: "Example cases" },
    fairness: { bg: "Един и същ модел · Един и същ въпрос", en: "Same model · Same question" },
    submit: { bg: "Сравни отговорите", en: "Compare responses" },
    pending: { bg: "Сравнението тече", en: "Comparison in progress" },
    controlTitle: { bg: "Стандартен модел", en: "Standard model" },
    expertTitle: { bg: "Специализиран асистент от ITT Digital Hub", en: "Specialist assistant from ITT Digital Hub" },
    controlNote: { bg: "Без специализираната нормативна база", en: "Without the specialized regulatory collection" },
    expertNote: { bg: "С нормативен текст и професионален контекст.", en: "With the regulation and professional context." },
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
    kindLaw: { bg: "Нормативен източник", en: "Regulation" },
    kindGuidance: { bg: "Официални насоки", en: "Official guidance" },
    kindEngineering: { bg: "Професионален контекст", en: "Professional context" },
    kindNote: { bg: "Обяснение на ITT Digital Hub", en: "ITT Digital Hub explanation" },
    disclosure: {
      bg: "Асистентът помага да се разбере и анализира Актът за изкуствения интелект. Той не замества правна консултация, когато такава е необходима.",
      en: "The assistant supports understanding and analysis of the Artificial Intelligence Act. It does not replace professional legal advice where that advice is required.",
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
