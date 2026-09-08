import type { L } from "@/lib/i18n";
import type { GovernanceFunction, Pillar, Stage } from "./types";

/* Source: CIT Action Plan BG — Мисия, Стълбове I–III, Стандартна методология,
   Структура и функциониране, Интегриран модел. Wine mandate — ASAESIS name. */

export const methodologyName = {
  acronym: "ASAESIS",
  full: {
    bg: "Алгоритмичен системен анализ и инженеринг на социално-институционални системи",
    en: "Algorithmic Systems Analysis and Engineering of Social-Institutional Systems",
  } satisfies L,
  programme: {
    bg: "Алгоритмизация на социалните процеси",
    en: "Algorithmization of Social Processes",
  } satisfies L,
};

/** The eight component classes of a designed social-institutional system. */
export const systemComponents: Array<{ code: string; title: L; hint: L }> = [
  {
    code: "C1",
    title: { bg: "Участници и институционални компоненти", en: "Actors and institutional components" },
    hint: { bg: "Кой е част от системата", en: "Who is part of the system" },
  },
  {
    code: "C2",
    title: { bg: "Разпределени роли и компетентности", en: "Distributed roles and competences" },
    hint: { bg: "Кой отговаря за какво", en: "Who is responsible for what" },
  },
  {
    code: "C3",
    title: { bg: "Формални и неформални правила", en: "Formal and informal rules" },
    hint: { bg: "По какви правила се действа", en: "Which rules govern action" },
  },
  {
    code: "C4",
    title: { bg: "Точки и процедури за вземане на решения", en: "Decision points and procedures" },
    hint: { bg: "Къде и как се решава", en: "Where and how decisions are made" },
  },
  {
    code: "C5",
    title: { bg: "Информационни потоци", en: "Information flows" },
    hint: { bg: "Какво знае системата и кога", en: "What the system knows and when" },
  },
  {
    code: "C6",
    title: { bg: "Стимули и ограничения", en: "Incentives and constraints" },
    hint: { bg: "Какво насочва поведението", en: "What steers behaviour" },
  },
  {
    code: "C7",
    title: { bg: "Механизми за контрол и обратна връзка", en: "Control and feedback mechanisms" },
    hint: { bg: "Как системата се коригира", en: "How the system corrects itself" },
  },
  {
    code: "C8",
    title: { bg: "Очаквани резултати и критерии за ефективност", en: "Expected outcomes and performance criteria" },
    hint: { bg: "Спрямо какво се измерва", en: "What performance is measured against" },
  },
];

/** Failure categories shared with engineered and algorithmic systems. */
export const failureModes: Array<{ code: string; title: L }> = [
  { code: "F01", title: { bg: "Неправилно дефинирани или противоречиви цели", en: "Ill-defined or contradictory goals" } },
  { code: "F02", title: { bg: "Неефективна системна архитектура", en: "Ineffective system architecture" } },
  { code: "F03", title: { bg: "Непълни или ненадеждни входни данни", en: "Incomplete or unreliable inputs" } },
  { code: "F04", title: { bg: "Лошо проектирани правила за вземане на решения", en: "Poorly designed decision rules" } },
  { code: "F05", title: { bg: "Тесни места и прекомерна сложност", en: "Bottlenecks and excessive complexity" } },
  { code: "F06", title: { bg: "Несъгласувани стимули", en: "Misaligned incentives" } },
  { code: "F07", title: { bg: "Слаба координация между компонентите", en: "Weak coordination between components" } },
  { code: "F08", title: { bg: "Дефекти в механизмите за обратна връзка", en: "Defective feedback mechanisms" } },
  { code: "F09", title: { bg: "Непредвидено поведение", en: "Unintended behaviour" } },
  { code: "F10", title: { bg: "Неефективно използване на ресурсите", en: "Inefficient use of resources" } },
  { code: "F11", title: { bg: "Неспособност за адаптация към промени в средата", en: "Inability to adapt to a changing environment" } },
];

/** The Center's standard systems-engineering methodology — ten stages (Action Plan, Pillar III). */
export const stages: Stage[] = [
  {
    code: "01",
    short: { bg: "Цели", en: "Goals" },
    title: { bg: "Дефиниране на целите", en: "Defining the goals" },
    body: {
      bg: "Изясняване на предназначението на системата, очакванията на заинтересованите страни и измеримите резултати, спрямо които ще бъде оценявана.",
      en: "Clarifying the purpose of the system, the expectations of its stakeholders and the measurable outcomes against which it will be assessed.",
    },
  },
  {
    code: "02",
    short: { bg: "Граници и архитектура", en: "Boundaries & architecture" },
    title: { bg: "Граници и архитектура на системата", en: "System boundaries and architecture" },
    body: {
      bg: "Идентифициране на съответните институционални компоненти, участници, роли, правни компетентности, технологии и зависимости.",
      en: "Identifying the relevant institutional components, actors, roles, legal competences, technologies and dependencies.",
    },
  },
  {
    code: "03",
    short: { bg: "Процеси и алгоритми", en: "Processes & algorithms" },
    title: { bg: "Картографиране на процесите и алгоритмите", en: "Mapping processes and algorithms" },
    body: {
      bg: "Проследяване на последователностите при вземане на решения, информационните потоци, формалните процедури, неформалните практики, стимулите и поведенческите реакции.",
      en: "Tracing decision sequences, information flows, formal procedures, informal practices, incentives and behavioural responses.",
    },
  },
  {
    code: "04",
    short: { bg: "Данни и информация", en: "Data & information" },
    title: { bg: "Оценка на входните данни и информацията", en: "Assessing inputs and information" },
    body: {
      bg: "Анализ на качеството, пълнотата, навременността и надеждността на информацията, която системата използва при своите решения.",
      en: "Analysing the quality, completeness, timeliness and reliability of the information the system relies on for its decisions.",
    },
  },
  {
    code: "05",
    short: { bg: "Изпитване", en: "Performance testing" },
    title: { bg: "Изпитване на ефективността", en: "Performance testing" },
    body: {
      bg: "Оценяване на системата по показатели за резултатност, ефикасност, разходи, бързина, надеждност, справедливост, прозрачност, устойчивост, адаптивност и резултати за потребителите.",
      en: "Assessing the system against indicators of effectiveness, efficiency, cost, speed, reliability, fairness, transparency, resilience, adaptability and outcomes for users and stakeholders.",
    },
    items: {
      bg: ["Резултатност", "Ефикасност", "Разходи", "Бързина", "Надеждност", "Справедливост", "Прозрачност", "Устойчивост", "Адаптивност", "Резултати за потребителите и заинтересованите страни"],
      en: ["Effectiveness", "Efficiency", "Cost", "Speed", "Reliability", "Fairness", "Transparency", "Resilience", "Adaptability", "Outcomes for users and stakeholders"],
    },
  },
  {
    code: "06",
    short: { bg: "Дефекти и рискове", en: "Failures & risks" },
    title: { bg: "Анализ на дефектите и рисковете", en: "Failure and risk analysis" },
    body: {
      bg: "Идентифициране на архитектурни слабости, тесни места, противоречащи си правила, координационни дефекти, непредвидени стимули и уязвимости спрямо външната среда.",
      en: "Identifying architectural weaknesses, bottlenecks, conflicting rules, coordination defects, unintended incentives and vulnerabilities to the external environment.",
    },
  },
  {
    code: "07",
    short: { bg: "Препроектиране", en: "Redesign & simulation" },
    title: { bg: "Препроектиране и симулация", en: "Redesign and simulation" },
    body: {
      bg: "Разработване и изпитване на алтернативни институционални, регулаторни, организационни и технологични архитектури.",
      en: "Developing and testing alternative institutional, regulatory, organizational and technological architectures.",
    },
  },
  {
    code: "08",
    short: { bg: "Интегрирани препоръки", en: "Integrated recommendations" },
    title: { bg: "Интегрирани препоръки", en: "Integrated recommendations" },
    body: {
      bg: "Подготовка на съгласуван пакет от промени в политиките, регулаторни изменения, организационно препроектиране, оптимизация на процесите, поведенчески интервенции, дигитални и подпомагани от изкуствен интелект решения и подобрения в управлението, отчетността и контрола.",
      en: "Preparing a coherent package of policy changes, regulatory amendments, organizational redesign, process optimization, behavioural interventions, digital and AI-assisted solutions, and improvements in governance, accountability and control.",
    },
    items: {
      bg: ["Промени в публичните политики", "Регулаторни изменения", "Организационно препроектиране", "Оптимизация на процесите", "Поведенчески интервенции", "Дигитални решения и решения, подпомагани от изкуствен интелект", "Подобрения в управлението, отчетността и контрола"],
      en: ["Public-policy changes", "Regulatory amendments", "Organizational redesign", "Process optimization", "Behavioural interventions", "Digital and AI-assisted solutions", "Improvements in governance, accountability and control"],
    },
  },
  {
    code: "09",
    short: { bg: "Архитектура на изпълнението", en: "Implementation architecture" },
    title: { bg: "Архитектура на изпълнението", en: "Implementation architecture" },
    body: {
      bg: "Определяне на отговорностите, последователността, необходимите ресурси, точките за вземане на решения, етапите и механизмите за управление на риска.",
      en: "Defining responsibilities, sequencing, required resources, decision points, milestones and risk-management mechanisms.",
    },
  },
  {
    code: "10",
    short: { bg: "Наблюдение и адаптация", en: "Monitoring & adaptation" },
    title: { bg: "Непрекъснато наблюдение и адаптация", en: "Continuous monitoring and adaptation" },
    body: {
      bg: "Създаване на механизми за обратна връзка и показатели за ефективност, така че препроектираната система да може да бъде изпитвана и коригирана при промяна на условията.",
      en: "Establishing feedback mechanisms and performance indicators so that the redesigned system can be tested and corrected as conditions change.",
    },
  },
];

/** Validation loop used in applied work (Wine × Tourism teaser, §8). */
export const validationLoop: L<string[]> = {
  bg: ["Проектиране", "Внедряване", "Измерване", "Изпитване", "Адаптиране"],
  en: ["Design", "Implement", "Measure", "Test", "Adapt"],
};

export const pillars: Pillar[] = [
  {
    code: "I",
    slug: "education",
    title: { bg: "Образование", en: "Education" },
    short: { bg: "Развива аналитичен и проектантски капацитет", en: "Builds analytical and design capacity" },
    purpose: {
      bg: "Подготовка на специалисти, способни да разбират, проектират, изпитват и управляват сложни социално-институционални системи. Програмите разглеждат институциите, организациите и публичните политики като проектирани системи, изградени около ясни цели, измерими резултати и механизми за непрекъсната адаптация.",
      en: "Preparing specialists able to understand, design, test and manage complex social-institutional systems. Programmes treat institutions, organizations and public policies as designed systems built around clear goals, measurable outcomes and mechanisms for continuous adaptation.",
    },
    activities: {
      bg: [
        "Бакалавърски, магистърски, докторски и следдипломни програми",
        "Интердисциплинарно обучение: системна архитектура на институциите, инженеринг на социално-институционални системи, алгоритмизация на социалните процеси, интелигентно управление, изкуствен интелект и общество, статистическо моделиране, институционален и регулаторен дизайн, поведенчески системи, оценяване на системи, дигитална трансформация",
        "Програми за ръководители, публични служители, регулатори и бизнес лидери",
        "Съвместни курсове и квалификации между университетите партньори",
        "Участие на студенти в практически проекти за картографиране, изпитване и препроектиране на системи",
        "Семинари, работни срещи, летни школи и международни лекции",
      ],
      en: [
        "Bachelor's, master's, doctoral and postgraduate programmes",
        "Interdisciplinary teaching: institutional systems architecture, engineering of social-institutional systems, algorithmization of social processes, intelligent governance, AI and society, statistical modelling, institutional and regulatory design, behavioural systems, systems evaluation, digital transformation",
        "Programmes for executives, public servants, regulators and business leaders",
        "Joint courses and qualifications with partner universities",
        "Student participation in practical projects mapping, testing and redesigning systems",
        "Seminars, workshops, summer schools and international lectures",
      ],
    },
    expected: {
      bg: ["Интердисциплинарни академични програми", "Професионално обучение по институционално и системно проектиране", "Съвместни образователни инициативи между университетите партньори", "Ново поколение специалисти, свързващи инженерните науки, технологиите, икономиката, публичните политики и човешкото поведение"],
      en: ["Interdisciplinary academic programmes", "Professional training in institutional and systems design", "Joint educational initiatives with partner universities", "A new generation of specialists connecting engineering, technology, economics, public policy and human behaviour"],
    },
  },
  {
    code: "II",
    slug: "research",
    title: { bg: "Академични изследвания", en: "Academic research" },
    short: { bg: "Създава концепции, методологии и доказателства", en: "Creates concepts, methods and evidence" },
    purpose: {
      bg: "Разпознаваема научноизследователска програма за архитектурата, поведението, ефективността и адаптацията на социално-институционалните системи. Водещата програма – „Алгоритмизация на социалните процеси“ – изследва как създадените от човека системи функционират чрез взаимосвързани правила, институционални компоненти, последователности на решения и поведенчески реакции, и как могат да бъдат изпитвани спрямо целите, за които са създадени.",
      en: "A recognizable research programme on the architecture, behaviour, performance and adaptation of social-institutional systems. The leading programme — Algorithmization of Social Processes — studies how human-designed systems operate through interconnected rules, institutional components, decision sequences and behavioural responses, and how they can be tested against the goals they were created to serve.",
    },
    activities: {
      bg: [
        "Системна архитектура на публичните институции",
        "Инженеринг на политики и регулаторни системи",
        "Алгоритмизация на социалните процеси",
        "Интелигентно управление",
        "Статистическо моделиране на институционалната ефективност",
        "Системи за вземане на решения с участие на човек и изкуствен интелект",
        "Организационни и поведенчески механизми за обратна връзка",
        "Институционална устойчивост и адаптивност",
        "Дигитална трансформация",
        "Икономически и административни системи",
        "Прилагане и оценка на публични политики",
        "Анализ на откази и дефекти в социално-институционалните системи",
      ],
      en: [
        "Systems architecture of public institutions",
        "Policy and regulatory systems engineering",
        "Algorithmization of social processes",
        "Intelligent governance",
        "Statistical modelling of institutional performance",
        "Human–AI decision systems",
        "Organizational and behavioural feedback mechanisms",
        "Institutional resilience and adaptability",
        "Digital transformation",
        "Economic and administrative systems",
        "Public-policy implementation and evaluation",
        "Failure and defect analysis in social-institutional systems",
      ],
    },
    expected: {
      bg: ["Академични публикации и работни доклади", "Модели на системна архитектура", "Методологии за диагностика и оценяване на ефективността", "Статистически показатели и инструменти за сравнителен анализ", "Симулационни и сценарийни модели", "Научни проекти по национални и европейски програми", "Международни академични партньорства и конференции"],
      en: ["Academic publications and working papers", "Systems-architecture models", "Diagnostic and performance-evaluation methodologies", "Statistical indicators and benchmarking tools", "Simulation and scenario models", "Research projects under national and European programmes", "International academic partnerships and conferences"],
    },
  },
  {
    code: "III",
    slug: "applied",
    title: { bg: "Приложна наука", en: "Applied science" },
    short: { bg: "Изпитва методите върху реални системи", en: "Tests the methods on real systems" },
    purpose: {
      bg: "Прилагане на научни методи за диагностика, изпитване, препроектиране и адаптиране на системи за публични политики, институции, предприятия и други сложни организации. Всяка организация, политика или регулаторна област се разглежда като социално-институционална система с определени цели, архитектура, процеси, резултати и критерии за ефективност. Приложните проекти връщат данни, практически казуси и нови научни въпроси към изследванията и обучението.",
      en: "Applying scientific methods to diagnose, test, redesign and adapt public policies, institutions, enterprises and other complex organizations. Every organization, policy or regulatory field is treated as a social-institutional system with defined goals, architecture, processes, outcomes and performance criteria. Applied projects return data, practical cases and new research questions to research and teaching.",
    },
    activities: {
      bg: [
        "Диагностика на институционални системи",
        "Преглед на архитектурата на политики и регулации",
        "Програми за организационно препроектиране",
        "Анализ на процеси и потоци на решения",
        "Стратегии за изкуствен интелект и дигитална трансформация",
        "Оценка на резултатността и ефикасността",
        "Оценка на въздействието на регулациите",
        "Анализ на поведенчески и стимулиращи системи",
        "Планове за изпълнение и системи за мониторинг и оценяване",
        "Стратегическо консултиране на ръководители и професионално обучение",
      ],
      en: [
        "Diagnostics of institutional systems",
        "Policy and regulatory architecture review",
        "Organizational redesign programmes",
        "Process and decision-flow analysis",
        "AI and digital-transformation strategies",
        "Effectiveness and efficiency assessment",
        "Regulatory impact assessment",
        "Behavioural and incentive-system analysis",
        "Implementation plans and monitoring and evaluation systems",
        "Strategic advice to executives and professional training",
      ],
    },
    expected: {
      bg: ["Изпитани върху реални системи методологии", "Данни, казуси и нови изследователски въпроси за научната програма", "Доказателства от наблюдението на приложените препоръки за последваща адаптация"],
      en: ["Methodologies tested on real systems", "Data, cases and new research questions for the research programme", "Evidence from monitoring implemented recommendations for further adaptation"],
    },
  },
];

/** The integrated operating model — six relations (Action Plan, Интегриран модел на функциониране). */
export const integratedModel: L<string[]> = {
  bg: [
    "Образованието развива аналитичен и проектантски капацитет.",
    "Академичните изследвания създават концепции, методологии и доказателствена основа.",
    "Приложната наука изпитва тези методологии върху реални социално-институционални системи.",
    "Приложните проекти генерират данни, практически казуси и нови научни въпроси.",
    "Научните резултати се интегрират в учебните и професионалните програми.",
    "Наблюдението на приложените препоръки предоставя доказателства за последваща адаптация на системите.",
  ],
  en: [
    "Education builds analytical and design capacity.",
    "Academic research creates concepts, methodologies and an evidence base.",
    "Applied science tests those methodologies on real social-institutional systems.",
    "Applied projects generate data, practical cases and new research questions.",
    "Research results are integrated into academic and professional programmes.",
    "Monitoring implemented recommendations provides evidence for the further adaptation of systems.",
  ],
};

/** Planned governance functions — no appointees (Action Plan, Структура и функциониране). */
export const governance: GovernanceFunction[] = [
  {
    code: "G1",
    title: { bg: "Директор", en: "Director" },
    body: {
      bg: "Осигурява стратегическо и научно ръководство, определя интелектуалната насоченост на Центъра и го представлява пред университетите партньори, публичните институции, бизнеса и международните организации.",
      en: "Provides strategic and scientific leadership, sets the Center's intellectual direction and represents it before partner universities, public institutions, business and international organizations.",
    },
  },
  {
    code: "G2",
    title: { bg: "Ръководител на звеното", en: "Head of unit" },
    body: {
      bg: "Отговаря за оперативното управление, координацията на проектите, бюджетирането, графиците, контрола на качеството и изпълнението на годишната програма.",
      en: "Responsible for operational management, project coordination, budgeting, scheduling, quality control and delivery of the annual programme.",
    },
  },
  {
    code: "G3",
    title: { bg: "Научен и програмен съвет", en: "Scientific and Programme Council" },
    body: {
      bg: "Интердисциплинарен орган с представители на инженерните науки, статистиката, икономиката, изкуствения интелект, публичните политики и социалните науки.",
      en: "An interdisciplinary body with representatives of engineering, statistics, economics, artificial intelligence, public policy and the social sciences.",
    },
    items: {
      bg: ["Одобрява научноизследователските приоритети", "Оценява проектните предложения", "Гарантира научното качество", "Координира участието на университетите партньори", "Преглежда годишните резултати"],
      en: ["Approves research priorities", "Evaluates project proposals", "Safeguards scientific quality", "Coordinates the participation of partner universities", "Reviews annual results"],
    },
  },
  {
    code: "G4",
    title: { bg: "Проектни екипи", en: "Project teams" },
    body: {
      bg: "Гъвкави интердисциплинарни екипи за всяка образователна, научноизследователска или консултантска задача – преподаватели, изследователи, докторанти, магистри и външни експерти, а след потвърдени споразумения и представители на институции партньори.",
      en: "Flexible interdisciplinary teams for each educational, research or advisory task — faculty, researchers, doctoral and master's students and external experts, and, once agreements are confirmed, representatives of partner institutions.",
    },
  },
  {
    code: "G5",
    title: { bg: "Външен консултативен съвет", en: "External Advisory Board" },
    body: {
      bg: "Може да включва представители на държавната администрация, бизнеса, международни организации и академичната общност. Подпомага стратегическото ориентиране, външните партньорства, финансирането и идентифицирането на практически проблеми, които изискват научен анализ.",
      en: "May include representatives of public administration, business, international organizations and academia. Supports strategic orientation, external partnerships, funding and the identification of practical problems that require scientific analysis.",
    },
  },
];

/** Disciplines the Center combines (Action Plan, Мисия). */
export const disciplines: L<string[]> = {
  bg: ["Системна архитектура", "Системно инженерство", "Статистика", "Икономика", "Изкуствен интелект", "Поведенчески анализ", "Изследвания на публичните политики"],
  en: ["Systems architecture", "Systems engineering", "Statistics", "Economics", "Artificial intelligence", "Behavioural analysis", "Public-policy research"],
};

/** Implementation priorities — a plan, not achievements (Action Plan, Приоритети за изпълнение). */
export const roadmap: Array<{ code: string; title: L; items: L<string[]> }> = [
  {
    code: "Y1",
    title: { bg: "Година 1 – Учредяване", en: "Year 1 — Establishment" },
    items: {
      bg: ["Финализиране на междууниверситетското споразумение", "Назначаване на ръководните и управленските органи", "Формализиране на методологията за алгоритмизация на социалните процеси", "Определяне на стандартите за системно инженерство и аналитичните шаблони", "Стартиране на първоначални образователни и семинарни дейности", "Избор на две или три пилотни социално-институционални системи за анализ", "Подготовка на кандидатури за национално и европейско финансиране"],
      en: ["Finalizing the inter-university agreement", "Appointing the leadership and management bodies", "Formalizing the methodology for the algorithmization of social processes", "Defining systems-engineering standards and analytical templates", "Launching initial educational and seminar activities", "Selecting two or three pilot social-institutional systems for analysis", "Preparing applications for national and European funding"],
    },
  },
  {
    code: "Y2",
    title: { bg: "Година 2 – Консолидация", en: "Year 2 — Consolidation" },
    items: {
      bg: ["Стартиране на съвместни академични и управленски програми", "Завършване на пилотни проекти за диагностика и препроектиране", "Публикуване на първите методологични и академични резултати", "Разработване на портфолио от консултантски услуги", "Установяване на партньорства с публични институции и бизнес организации"],
      en: ["Launching joint academic and executive programmes", "Completing pilot diagnostic and redesign projects", "Publishing the first methodological and academic results", "Developing a portfolio of advisory services", "Establishing partnerships with public institutions and business organizations"],
    },
  },
  {
    code: "Y3",
    title: { bg: "Година 3 – Разширяване", en: "Year 3 — Expansion" },
    items: {
      bg: ["Утвърждаване като национална референтна структура за архитектура и инженеринг на социално-институционални системи", "Разширяване на международното научно сътрудничество", "Балансиран портфейл от университетско, държавно, европейско, частно и търговско финансиране", "Дългосрочни програми за трансформация, наблюдение и адаптация"],
      en: ["Establishing the Center as a national reference structure for the architecture and engineering of social-institutional systems", "Expanding international research cooperation", "A balanced portfolio of university, state, European, private and commercial funding", "Long-term programmes for transformation, monitoring and adaptation"],
    },
  },
];
