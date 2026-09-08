import { analysisInsightPhotos } from "./media";
import type { Insight } from "./types";

/**
 * Three Insights analyses supplied for the public /insights surface.
 * Overlay until an editor saves them from /admin. Not in confirmed seed
 * (`src/content/insights.ts`). They are concept notes, not research publications
 * or measured results.
 */

export const ANALYSIS_INSIGHT_ID_PREFIX = "insight-analysis-";

export const ANALYSIS_INSIGHT_SLUGS = [
  "why-public-policies-fail",
  "governance-and-systems-engineering",
  "algorithmic-institutional-design",
] as const;

export type AnalysisInsightSlug = (typeof ANALYSIS_INSIGHT_SLUGS)[number];

export function isAnalysisInsightSlug(slug: string): boolean {
  return (ANALYSIS_INSIGHT_SLUGS as readonly string[]).includes(slug);
}

export function isAnalysisInsightId(id: string): boolean {
  return id.startsWith(ANALYSIS_INSIGHT_ID_PREFIX);
}

export function isAnalysisMediaId(id: string): boolean {
  return id.startsWith("media-analysis-");
}

/** Whole-line YouTube URLs placed at about one-third and two-thirds of each analysis body. */
export const ANALYSIS_BODY_VIDEOS: Record<AnalysisInsightSlug, readonly [string, string]> = {
  "why-public-policies-fail": [
    "https://www.youtube.com/watch?v=OzJzjCj8kI4",
    "https://www.youtube.com/watch?v=YY6TGM_OKW4",
  ],
  "governance-and-systems-engineering": [
    "https://www.youtube.com/watch?v=_IrQWx1hfKM",
    "https://www.youtube.com/watch?v=934vxuc2zb4",
  ],
  "algorithmic-institutional-design": [
    "https://www.youtube.com/watch?v=3cindBF1lEM",
    "https://www.youtube.com/watch?v=RWwuXM_JRHk",
  ],
};

export const analysisInsights: Insight[] = [
  {
    slug: "why-public-policies-fail",
    type: "concept-note",
    heroMediaId: analysisInsightPhotos.feedbackLoopBg.id,
    title: {
      bg: "Защо публичните политики се провалят: Илюзията за линейни решения в сложни обществени системи",
      en: "Why Public Policies Fail: The Illusion of Linear Solutions in Complex Social Systems",
    },
    summary: {
      bg: "Всяка година държавните институции и публичните органи произвеждат стотици регулации, предназначени да решат конкретни проблеми — от облекчаване на трафика и административната тежест до справяне с корупцията. Въпреки това, голяма част от тези реформи пропадат или дори влошават първоначалния проблем. Причината се крие в системна фундаментална грешка: третирането на сложните обществени системи като линейни вериги от тип „причина – следствие“.",
      en: "Every year, government institutions and public authorities produce hundreds of regulations designed to tackle specific issues—ranging from traffic congestion and administrative burden to corruption. However, a significant portion of these reforms fail or end up exacerbating the original problem. The root cause lies in a fundamental structural flaw: treating complex social systems as simple linear cause-and-effect chains.",
    },
    body: {
      bg: [
        "ASAESIS — Етап 05: Моделиране и симулиране · Етап 10: Адаптация.",
        "## Линейните мислени модели срещу системната реалност",
        "Както посочва проф. Джон Стърман (John D. Sterman, MIT Sloan School of Management) в своя фундаментален труд „All models are wrong: reflections on system dynamics“, хората вземат решения въз основа на опростени „мислени модели“ (Mental Models). При решаване на публични проблеми администрацията обикновено предполага, че:",
        ANALYSIS_BODY_VIDEOS["why-public-policies-fail"][0],
        "Проблем X → Регулация Y → Решение Z",
        "В реалността обаче институциите и обществено-икономическата среда са сложни динамични системи с вътрешни цикли на обратна връзка (Feedback Loops) и времеви закъснения (Delays). Когато въведете нова регулация Y, участниците в системата (граждани, бизнес, администратори) променят поведенческите си стратегии, за да я заобиколят или да максимизират личната си изгода. Това ражда явлението Policy Resistance (Съпротива на политиката) — реакция на системата, която неутрализира намерението на реформата.",
        "## Системният инженеринг на ЦИТ",
        "Чрез 10-стъпковата методология ASAESIS, ЦИТ адресира този провал още в началната фаза:",
        ANALYSIS_BODY_VIDEOS["why-public-policies-fail"][1],
        "- Преминаване от симптоми към обратни връзки: На Етап 03 процесите не се описват просто като формална процедура, а като динамична мрежа от стимули и реактивни поведения.",
        "- Дигитални симулационни среди: На Етап 05 предложените реформи не се прилагат директно в закона, а се подлагат на компютърно симулиране на сценарии, за да се открият неочакваните странични ефекти преди тяхното реално внедряване.",
      ],
      en: [
        "ASAESIS — Stage 05: Modeling & Simulation · Stage 10: Adaptation.",
        "## Linear Mental Models vs. Systemic Reality",
        "As Prof. John D. Sterman (MIT Sloan School of Management) highlights in his seminal work “All models are wrong: reflections on system dynamics”, decision-makers inevitably rely on simplified “mental models.” When addressing public issues, administrations typically assume a linear progression:",
        ANALYSIS_BODY_VIDEOS["why-public-policies-fail"][0],
        "Problem X → Regulation Y → Solution Z",
        "In reality, institutions and socio-economic environments are complex dynamic systems governed by internal feedback loops and time delays. Introducing a new regulation Y prompts actors within the system (citizens, businesses, administrators) to alter their behavioral strategies in order to bypass constraints or maximize personal utility. This triggers Policy Resistance—a system-level response that counteracts and neutralizes the reform's original intent.",
        "## The CIT Systems Engineering Approach",
        "Through the 10-step ASAESIS framework, the Center for Intelligent Technologies (CIT / UASG) addresses policy failure at its core:",
        ANALYSIS_BODY_VIDEOS["why-public-policies-fail"][1],
        "- Shifting from Symptoms to Feedback Loops: At Stage 03, processes are mapped not as static bureaucratic steps, but as a dynamic network of incentives and behavioral reactions.",
        "- Digital Simulation Environments: At Stage 05, proposed reforms are not implemented directly into law. Instead, they are subjected to computer-based scenario simulation to identify unintended side effects prior to real-world deployment.",
      ],
    },
    topics: {
      bg: ["Системна динамика", "Публични политики", "ASAESIS"],
      en: ["System dynamics", "Public policy", "ASAESIS"],
    },
    source: {
      bg: "Концептуална бележка по Sterman, J. D., „All models are wrong: reflections on system dynamics“, и методологията ASAESIS. Не е научна публикация на Центъра.",
      en: "Concept note drawing on Sterman, J. D., “All models are wrong: reflections on system dynamics”, and the ASAESIS methodology. Not a Center research publication.",
    },
  },
  {
    slug: "governance-and-systems-engineering",
    type: "concept-note",
    heroMediaId: analysisInsightPhotos.hierarchyNetworkBg.id,
    title: {
      bg: "Разминаването между Governance и Системен Инженеринг в държавната администрация",
      en: "The Mismatch Between Public Governance and Systems Engineering in Public Administration",
    },
    summary: {
      bg: "Внедряването на нови системи в държавните институции (напр. електронно управление, нови градоустройствени платформи или интегрирани регистри) масово пропада не поради липса на софтуер или финансиране, а поради структурен сблъсък между рамката за управление (Project Governance) и системната архитектура (Systems Engineering).",
      en: "The implementation of modern systems in public institutions (e.g., e-government portals, urban planning platforms, or integrated registers) frequently fails not due to software bugs or financial deficits, but due to a structural conflict between project governance and systems engineering.",
    },
    body: {
      bg: [
        "ASAESIS — Етап 02: Архитектура · Етап 03: Точки за решения · Етап 06: Редизайн.",
        "## Сблъсъкът на двете парадигми (SEBoK Рамка)",
        "В международния стандарт за системен инженеринг (SEBoK – Systems Engineering Body of Knowledge) ясно се описва критичното напрежение между две основни функции:",
        ANALYSIS_BODY_VIDEOS["governance-and-systems-engineering"][0],
        "- Project Management / Administrative Governance: Фокусира се върху йерархия, бюджетни рамки, крайни срокове, формално съответствие с нормативните актове и разпределение на политическа/административна отговорност.",
        "- Systems Engineering: Фокусира се върху системната логика, функционалната интеграция, правилния обмен на данни и постигането на крайната цел на системата.",
        "В публичния сектор административната йерархия традиционно смазва системния инженеринг. Точките за вземане на решения (Decision Points) се разпределят не според това къде се намира необходимата информация или експертиза, а според формалния чин или длъжностна характеристика. Резултатът са „кухи“ системи, които формално покриват отчетите за изпълнение, но функционално не работят.",
        "## Препроектиране на точките за решение през ASAESIS",
        "В методологията ASAESIS този проблем се решава чрез синхронизация:",
        ANALYSIS_BODY_VIDEOS["governance-and-systems-engineering"][1],
        "- Картографиране на компетентностите (Етап 02): Преразглеждат се правните компетентности и формалните роли, за да се премахне разминаването между органа, който взема решение, и органа, който носи системната отговорност.",
        "- Алгоритмизиране на точките за решение (Етап 03): Всяко бюрократично решение се превръща в изричен алгоритмичен възел с ясни входове, критерии и вграден качествен контрол.",
      ],
      en: [
        "ASAESIS — Stage 02: System Architecture · Stage 03: Decision Points · Stage 06: Redesign.",
        "## The Clash of Two Paradigms (SEBoK Framework)",
        "The International Systems Engineering Body of Knowledge (SEBoK) delineates a critical tension between two primary functions:",
        ANALYSIS_BODY_VIDEOS["governance-and-systems-engineering"][0],
        "- Project Management / Administrative Governance: Focuses on hierarchy, budgetary limits, deadlines, formal regulatory compliance, and the allocation of political/administrative accountability.",
        "- Systems Engineering: Focuses on systemic logic, functional integration, proper data interoperability, and ensuring the system achieves its operational purpose.",
        "In the public sector, administrative hierarchy traditionally dominates systems engineering. Decision Points are assigned based on formal rank or position rather than information availability or technical expertise. The result is empty, rigid systems that meet reporting metrics on paper but fail operationally.",
        "## Redesigning Decision Points via ASAESIS",
        "Under the ASAESIS framework, CIT reconciles this misalignment:",
        ANALYSIS_BODY_VIDEOS["governance-and-systems-engineering"][1],
        "- Competency Mapping (Stage 02): Realigns legal authority and formal roles to eliminate discrepancies between decision-making bodies and system caretakers.",
        "- Algorithmic Decision Mapping (Stage 03): Transforms bureaucratic approvals into explicit algorithmic nodes featuring clean inputs, objective criteria, and embedded quality control loops.",
      ],
    },
    topics: {
      bg: ["Институционален инженеринг", "Управление", "ASAESIS"],
      en: ["Institutional engineering", "Governance", "ASAESIS"],
    },
    source: {
      bg: "Концептуална бележка по SEBoK (Systems Engineering Body of Knowledge) и методологията ASAESIS. Не е научна публикация на Центъра.",
      en: "Concept note drawing on SEBoK (Systems Engineering Body of Knowledge) and the ASAESIS methodology. Not a Center research publication.",
    },
  },
  {
    slug: "algorithmic-institutional-design",
    type: "concept-note",
    heroMediaId: analysisInsightPhotos.decisionTreeBg.id,
    title: {
      bg: "Алгоритмизация на институциите: Картографиране на правила, роли и стимули през IAD и ASAESIS",
      en: "Algorithmic Institutional Design: Mapping Rules, Roles, and Incentives via IAD and ASAESIS",
    },
    summary: {
      bg: "Публичните институции, регулаторните среди и пазарите не са стихийни или абстрактни явления. Те представляват проектирани системи с алгоритмична структура. За да бъде една институция препроектирана така, че да работи ефективно, нейните невидими правила, неформални практики и скрити стимули трябва да бъдат картографирани с математическа и инженерна точност.",
      en: "Public institutions, regulatory regimes, and markets are neither spontaneous nor abstract phenomena. They are engineered systems with an algorithmic structure. To redesign an institution for operational efficiency, its underlying rules, informal practices, and hidden incentives must be mapped with mathematical and engineering precision.",
    },
    body: {
      bg: [
        "ASAESIS — Етап 01: Цели · Етап 03: Процеси и алгоритми · Етап 07: Изпитване.",
        "## Граматиката на правилата: Връзката с IAD Рамката",
        "За да разглобим една институция на нейните съставни елементи, ние стъпваме върху рамката за институционален анализ IAD (Institutional Analysis and Development), развита от Нобеловия лауреат Елинор Остром (Ostrom Workshop).",
        "Всеки институционален процес се състои от т.нар. Action Arenas (арени за действие), на които участниците взаимодействат под влиянието на 7 типа правила:",
        ANALYSIS_BODY_VIDEOS["algorithmic-institutional-design"][0],
        "- Position rules (Кой каква роля заема);",
        "- Boundary rules (Кой има достъп до системата);",
        "- Choice rules (Какви действия са позволени или задължителни);",
        "- Aggregation rules (Как се вземат съвместни решения);",
        "- Information rules (Какво знае всеки участник и кога);",
        "- Payoff rules (Какви са санкциите и възнагражденията/стимулите);",
        "- Scope rules (Какви са допустимите крайни резултати).",
        "## Превръщане на законодателството в алгоритъм през ASAESIS",
        "Методологията ASAESIS взема суровия правен текст (закони, наредби, устройствени правилници) и го превежда на езика на системното проектиране:",
        ANALYSIS_BODY_VIDEOS["algorithmic-institutional-design"][1],
        "- Етап 01 & 02: Дефинират се измеримите цели и границите на системата.",
        "- Етап 03: Извлича се „алгоритъмът“ на нормативния акт — определят се входовете (подадени заявления, данни), процесите на обработка, информационната асиметрия и стимулите за заобикаляне на правилата.",
        "- Етап 07 & 08: Новата институционална архитектура се тества първо в регулаторна „пясъчник“ (Regulatory Sandbox) и пилотна среда, преди да бъде окончателно кодифицирана в закон.",
      ],
      en: [
        "ASAESIS — Stage 01: System Purpose · Stage 03: Processes & Algorithms · Stage 07: Testing & Piloting.",
        "## The Grammar of Rules: Integrating the IAD Framework",
        "To deconstruct an institution into its fundamental components, CIT utilizes the Institutional Analysis and Development (IAD) framework created by Nobel laureate Elinor Ostrom (Ostrom Workshop).",
        "Every institutional process unfolds within Action Arenas, where participants interact under the influence of 7 rule types:",
        ANALYSIS_BODY_VIDEOS["algorithmic-institutional-design"][0],
        "- Position rules: Define the roles within the system;",
        "- Boundary rules: Regulate access and eligibility;",
        "- Choice rules: Specify mandatory, allowed, or forbidden actions;",
        "- Aggregation rules: Govern collective decision-making;",
        "- Information rules: Control information channels and transparency;",
        "- Payoff rules: Structure sanctions, rewards, and economic incentives;",
        "- Scope rules: Define allowable outcomes.",
        "## Translating Legal Text into Executable Code via ASAESIS",
        "The ASAESIS methodology converts unstructured legal text (laws, decrees, internal regulations) into systematic engineering specifications:",
        ANALYSIS_BODY_VIDEOS["algorithmic-institutional-design"][1],
        "- Stages 01 & 02: Establish measurable system objectives and structural boundaries.",
        "- Stage 03: Extracts the operational algorithm of the regulation—identifying data inputs, processing steps, information asymmetries, and evasion incentives.",
        "- Stages 07 & 08: The redesigned institutional architecture is tested within a controlled Regulatory Sandbox and pilot environment before full legislative codification.",
      ],
    },
    topics: {
      bg: ["Архитектура", "Методология", "IAD", "ASAESIS"],
      en: ["System architecture", "Methodology", "IAD", "ASAESIS"],
    },
    source: {
      bg: "Концептуална бележка по рамката IAD на Елинор Остром (Ostrom Workshop) и методологията ASAESIS. Не е научна публикация на Центъра.",
      en: "Concept note drawing on Elinor Ostrom’s IAD framework (Ostrom Workshop) and the ASAESIS methodology. Not a Center research publication.",
    },
  },
];
