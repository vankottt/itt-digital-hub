import {
  asaesisMethodIllustration,
  constructionGameEditorial,
  constructionGameInfographic,
  socialSystemsIllustration,
  testingInsteadIllustration,
  testingModelIllustration,
} from "./media";
import type { Insight } from "./types";

/* Concept notes restating the Center's working framework — not research
   findings. News items in this file are confirmed external or institutional
   materials, republished with source; they are not CIT project results.
   Fictional News samples live in `dev-news-fixtures.ts` and overlay in memory
   on the public site. Insights analyses live in `analysis-insights.ts` and
   overlay the same way. Neither is part of this confirmed seed. */

const UASG_CONSTRUCTION_GAME_VIDEO = "https://www.youtube.com/watch?v=kfV3dGGHO5s";
const UASG_CONSTRUCTION_GAME_SOURCE =
  "https://www.uacg.bg/public/news/kogato-praktikata-vleze-v-universiteta-treto-izdanie-na-blgarska-stroitelna-igra";

export const insights: Insight[] = [
  {
    slug: "why-social-systems-behave-like-algorithms",
    type: "concept-note",
    heroMediaId: socialSystemsIllustration.id,
    title: {
      bg: "Защо социалните системи се държат като алгоритми",
      en: "Why social systems behave like algorithms",
    },
    summary: {
      bg: "Публичните институции, регулаторните режими, пазарите и организациите не действат произволно. Те работят чрез повтарящи се последователности – събиране на информация, класифициране, решение, прилагане, реакция, обратна връзка – и затова могат да се разглеждат като архитектура от взаимодействащи формални и неформални алгоритми.",
      en: "Public institutions, regulatory regimes, markets and organizations do not act at random. They work through recurring sequences — gathering information, classifying, deciding, applying, reacting, feeding back — and can therefore be seen as an architecture of interacting formal and informal algorithms.",
    },
    body: {
      bg: [
        "Социалните системи не са естествено възникнали механизми. Публичните институции, регулаторните режими, предприятията, пазарите, административните процеси и организираните форми на колективно поведение са създадени от човека системи, предназначени да постигат определени човешки цели.",
        "## Повтарящи се последователности",
        "Тези системи действат чрез повтарящи се последователности на:",
        "- събиране на информация;",
        "- класифициране и интерпретиране;",
        "- вземане на решения;",
        "- разпределяне на правомощия и ресурси;",
        "- прилагане на правила;",
        "- взаимодействие между институционални участници;",
        "- икономически и поведенчески реакции;",
        "- наблюдение и обратна връзка;",
        "- корекция или липса на корекция.",
        "Тези последователности имат по същество алгоритмична структура. Те преобразуват входни елементи – информация, капитал, труд, законодателство, стимули и потребителско търсене – в решения, действия и измерими икономически или обществени резултати.",
        "## Същите категории дефекти",
        "Както при техническите и изчислителните системи, дефектите във функционирането могат да произтичат от неправилно определени или противоречащи си цели, дефектна архитектура, непълни или закъснели входни данни, несъгласувани правила за вземане на решения, неправилно разпределени отговорности, несъвместими стимули, недостатъци в координацията, липсващи механизми за обратна връзка, прекомерна процедурна сложност, непредвидени резултати и неспособност за реакция при промени във външната среда.",
        "## Какво следва от това",
        "Ако една социално-институционална система може да бъде представена като архитектура от алгоритми, тя може да бъде картографирана, измервана, изпитвана спрямо целите, за които е създадена, и препроектирана – по аналогия със сложна инженерна система. Това е изходната постановка на научната програма на Центъра „Алгоритмизация на социалните процеси“ и на неговата оперативна методология ASAESIS.",
      ],
      en: [
        "Social systems are not naturally occurring mechanisms. Public institutions, regulatory regimes, enterprises, markets, administrative processes and organized forms of collective behaviour are human-designed systems intended to achieve particular human goals.",
        "## Recurring sequences",
        "These systems operate through recurring sequences of:",
        "- gathering information;",
        "- classifying and interpreting;",
        "- making decisions;",
        "- allocating authority and resources;",
        "- applying rules;",
        "- interaction between institutional actors;",
        "- economic and behavioural responses;",
        "- monitoring and feedback;",
        "- correction, or the absence of correction.",
        "These sequences have an essentially algorithmic structure. They transform inputs — information, capital, labour, legislation, incentives and consumer demand — into decisions, actions and measurable economic or social results.",
        "## The same categories of defect",
        "As with technical and computational systems, malfunctions can stem from ill-defined or contradictory goals, defective architecture, incomplete or delayed inputs, uncoordinated decision rules, misallocated responsibilities, incompatible incentives, weak communication and coordination, missing feedback mechanisms, excessive procedural complexity, unintended results and an inability to respond to changes in the environment.",
        "## What follows",
        "If a social-institutional system can be represented as an architecture of algorithms, it can be mapped, measured, tested against the goals it was created for, and redesigned — by analogy with a complex engineered system. This is the starting premise of the Center's research programme, Algorithmization of Social Processes, and of its operational methodology, ASAESIS.",
      ],
    },
    topics: {
      bg: ["Алгоритмизация на социалните процеси", "Системна архитектура", "Институционален дизайн"],
      en: ["Algorithmization of social processes", "Systems architecture", "Institutional design"],
    },
    relatedProjects: ["wine-sector-system-architecture"],
    source: {
      bg: "По стратегическия план на Центъра и научната рамка на предложението за първи приложен проект.",
      en: "Based on the Center's strategic plan and the scientific framework of the first applied-project proposal.",
    },
  },
  {
    slug: "asaesis-from-framework-to-method",
    type: "concept-note",
    heroMediaId: asaesisMethodIllustration.id,
    title: {
      bg: "ASAESIS: от теоретична рамка към възпроизводим метод",
      en: "ASAESIS: from theoretical framework to reproducible method",
    },
    summary: {
      bg: "Алгоритмизацията на социалните процеси обяснява алгоритмичния характер на създадените от човека системи. ASAESIS – Алгоритмичен системен анализ и инженеринг на социално-институционални системи – превръща това обяснение във възпроизводима последователност от изследователски и инженерни стъпки.",
      en: "The algorithmization of social processes explains the algorithmic character of human-designed systems. ASAESIS — Algorithmic Systems Analysis and Engineering of Social-Institutional Systems — turns that explanation into a reproducible sequence of research and engineering steps.",
    },
    body: {
      bg: [
        "Една теоретична рамка е полезна дотолкова, доколкото може да бъде приложена по един и същ начин към различни системи и да даде сравними резултати. Затова Центърът отделя теорията – алгоритмизацията на социалните процеси – от метода – ASAESIS.",
        "## Какво прави методът",
        "ASAESIS разглежда една система като адаптивна алгоритмична архитектура от взаимосвързани подсистеми – производствени, пазарни, регулаторни, институционални, финансови, информационни и поведенчески – и преминава през ясно определени етапи: от дефинирането на целите и границите, през картографирането на архитектурата и алгоритмите, оценката на данните и измерването на резултатите, до анализа на отказите, моделирането на алтернативи, интегрираното препроектиране и адаптивното изпълнение.",
        "## Защо етапите имат значение",
        "Повечето съществуващи анализи разглеждат проблема секторно: земеделието анализира производството, туризмът – туристическия продукт, маркетингът – рекламата, икономистите – цените, администрацията – процедурите. Всеки от тези анализи може да бъде правилен сам по себе си, но оптимизирането на отделен компонент не гарантира оптимално функциониране на цялата система.",
        "Възпроизводимата последователност принуждава анализа да премине през цялата система, преди да предложи интервенция, и прави всяка препоръка проследима до конкретен установен дефект.",
        "## Стандартната методология на Центъра",
        "Публичната методология на Центъра следва десет етапа – от дефинирането на целите до непрекъснатото наблюдение и адаптация. Приложните проекти могат да я детайлизират според своята област, но не заобикалят нейната логика.",
      ],
      en: [
        "A theoretical framework is useful to the extent that it can be applied in the same way to different systems and yield comparable results. That is why the Center separates the theory — the algorithmization of social processes — from the method — ASAESIS.",
        "## What the method does",
        "ASAESIS treats a system as an adaptive algorithmic architecture of interconnected subsystems — production, market, regulatory, institutional, financial, information and behavioural — and moves through clearly defined stages: from defining goals and boundaries, through mapping the architecture and algorithms, assessing data and measuring results, to analysing failures, modelling alternatives, integrated redesign and adaptive implementation.",
        "## Why the stages matter",
        "Most existing analyses look at a problem sector by sector: agriculture analyses production, tourism the tourist product, marketing the advertising, economists the prices, administration the procedures. Each of these analyses may be correct on its own, but optimizing a single component does not guarantee that the whole system performs well.",
        "A reproducible sequence forces the analysis to traverse the entire system before proposing an intervention, and makes every recommendation traceable to a specific identified defect.",
        "## The Center's standard methodology",
        "The Center's public methodology follows ten stages — from defining goals to continuous monitoring and adaptation. Applied projects may detail it for their domain, but they do not bypass its logic.",
      ],
    },
    topics: {
      bg: ["ASAESIS", "Методология", "Системно инженерство"],
      en: ["ASAESIS", "Methodology", "Systems engineering"],
    },
    relatedProjects: ["wine-sector-system-architecture", "bulgarian-wine-bulgarian-tourism"],
    source: {
      bg: "По предложението за първи приложен научноизследователски проект и концепцията за пилотен проект.",
      en: "Based on the first applied research project proposal and the pilot project concept.",
    },
  },
  {
    slug: "testing-instead-of-assuming",
    type: "concept-note",
    heroMediaId: testingInsteadIllustration.id,
    title: {
      bg: "Проверка вместо предположение",
      en: "Testing instead of assuming",
    },
    summary: {
      bg: "Експертната препоръка сама по себе си не е доказателство, че системата ще функционира по-добре. Предложеният модел трябва да бъде проверен в реална среда – с базово измерване преди внедряването и същите показатели след него.",
      en: "An expert recommendation is not, by itself, evidence that a system will work better. The proposed model has to be tested in a real setting — with a baseline measured before implementation and the same indicators measured afterwards.",
    },
    body: {
      bg: [
        "Основна характеристика на методологията на Центъра е, че експертната препоръка сама по себе си не се приема за доказателство, че системата ще функционира по-добре.",
        "## Затворен цикъл",
        "Затова след основния анализ следва пилотна фаза. Преди внедряването се измерва базово състояние. След внедряването се измерват същите показатели. Методът следва затворен цикъл:",
        "- Проектиране",
        "- Внедряване",
        "- Измерване",
        "- Изпитване",
        "- Адаптиране",
        "Резултатът не е статична стратегия, а адаптивен модел, който може да бъде коригиран според измереното реално поведение на системата.",
        testingModelIllustration.id,
        "## Какво означава това за проектите",
        "Първите приложни проекти на Центъра трябва да търсят видими и сравнително бързи резултати, а не само дългосрочни структурни ефекти. Приоритет получават решения, които могат да бъдат внедрени практически, създават измерим резултат, могат да бъдат пилотно проверени, използват по-добре съществуващи ресурси и намаляват системни и административни загуби. Това не изключва по-дълбоки реформи, когато анализът покаже, че именно те са необходимата предпоставка за устойчив резултат.",
        "## Очаквано не означава постигнато",
        "Същият принцип определя и начина, по който Центърът описва работата си публично: концепции, планирани дейности, активни пилоти, очаквани резултати и измерени резултати се разграничават ясно. Очакването никога не се представя като постижение.",
      ],
      en: [
        "A defining feature of the Center's methodology is that an expert recommendation is not, in itself, accepted as proof that the system will work better.",
        "## A closed loop",
        "That is why the main analysis is followed by a pilot phase. A baseline is measured before implementation. The same indicators are measured afterwards. The method follows a closed loop:",
        "- Design",
        "- Implement",
        "- Measure",
        "- Test",
        "- Adapt",
        "The result is not a static strategy but an adaptive model that can be corrected against the system's measured real behaviour.",
        testingModelIllustration.id,
        "## What this means for projects",
        "The Center's first applied projects should seek visible and relatively quick results, not only long-term structural effects. Priority goes to solutions that can be implemented in practice, create a measurable result, can be piloted, make better use of existing resources and reduce systemic and administrative losses. This does not exclude deeper reforms where the analysis shows they are the necessary precondition for a sustainable result.",
        "## Expected is not achieved",
        "The same principle governs how the Center describes its work publicly: concepts, planned activities, active pilots, expected outcomes and measured results are kept clearly distinct. An expectation is never presented as an achievement.",
      ],
    },
    topics: {
      bg: ["Валидиране", "Пилотни проекти", "Измерване"],
      en: ["Validation", "Pilot projects", "Measurement"],
    },
    relatedProjects: ["bulgarian-wine-bulgarian-tourism"],
    source: {
      bg: "По концепцията за пилотен проект „Българско вино × Български туризъм“, раздел „Проверка вместо предположение“.",
      en: "Based on the pilot project concept \"Bulgarian Wine × Bulgarian Tourism\", section \"Testing instead of assuming\".",
    },
  },
  {
    slug: "kogato-praktikata-vleze-v-universiteta",
    type: "news",
    heroMediaId: constructionGameEditorial.id,
    title: {
      bg: "Когато практиката влезе в университета: Трето издание на „Българска строителна игра“",
      en: "When practice enters the university: Third edition of the Bulgarian Construction Game",
    },
    summary: {
      bg: "На 28 ноември 2025 г. УАСГ отново събра образованието и бизнеса. Студенти от Хидротехническия факултет и Факултета по транспортно строителство преминаха през цялостен инвестиционен процес – от първия подпис до финалния отчет – в третото издание на „Българска строителна игра“.",
      en: "On 28 November 2025 UASG again brought education and business together. Students from the Faculty of Hydraulic Engineering and the Faculty of Transportation Engineering went through a complete investment process — from the first signature to the final report — in the third edition of the Bulgarian Construction Game.",
    },
    body: {
      bg: [
        "На 28.11.2025 г. УАСГ отново събра образованието и бизнеса на едно място. Студентите от Хидротехнически факултет и Факултета по транспортно строителство преживяха цялостен инвестиционен процес от първия подпис до финалния отчет.",
        "## Фокус върху инфраструктурата",
        "Фокусът на тазгодишното издание беше инфраструктурата. Участниците симулираха общинска инвестиционна програма по строителството и контрол при реализирането на най-масовите обществени инвестиции, а именно строителството на нова улична мрежа със съпътстваща водоснабдителна и канализационна инфраструктура, както и реконструкцията на съществуващи улици и водопроводи.",
        "Участниците формираха екипи, в които извършваха типични дейности за възложителите, строителните компании и фирмите, осъществяващи строителен надзор. Поетапно различните екипи трябваше да определят необходимите за договаряне количества СМР, да се формират анализни цени и да се остойности дейността по контрол на строителния процес. Последва договаряне между участниците и сключване на споразумения. По време на процеса не липсваха и изненади, като увеличение на горивата вследствие на международната политика, което се отрази на разходите за механизация и част от строителните продукти. Накрая обектите бяха издадени качествено и в срок с необходимата документация, което позволи те да бъдат официално открити.",
        constructionGameInfographic.id,
        UASG_CONSTRUCTION_GAME_VIDEO,
        "## Експертна подкрепа от бизнеса и институциите",
        "За да бъде процесът най-реалистичен, екипите имаха своите инструктори.",
        "За напътствия на екипите-възложители ценни насоки даваха експертите инж. Деница Дечева, инж. Йовка Минкова и инж. Гергана Михайлова от община Стара Загора, които са и възпитаници на двата факултета.",
        "Строителните екипи почерпиха от опита на втората по големина строителна компания в Европа – ЩРАБАГ, които бяха и спонсор на събитието. За да дадат ценни насоки в инструкторския екип се включиха инж. Пламен Антонов - групов технически ръководител, г-н Божидар Костадинов - групов икономически ръководител, инж. Иван Петров - ръководител отдел „Калкулации“, инж. Виктория Дамянова - технически контрол и инж. Лидия Ковачка - управление на договори.",
        "За да бъде процесът реален, качествен и ясно протоколиран, екипите, осъществяващи строителен надзор разчитаха на опита на инж. Евгени Цветанов от фирма “EQE-Control”.",
        "Всички участници имаха възможност да участват в инструктаж по контролирано използване на съвременни технологии в помощ на участниците в строителството. Инж. Иван Тодоров демонстрира подход за работа с AI асистенти, базиран на ясно дефинирани роли, инструкции и контекст. Фокусът не бе върху „готов AI“, който върши задачите вместо студентите, а върху изграждането на контролиран и предвидим процес. Това е инструмент за по-ясно мислене, анализ и работа по инженерни задачи в среда на бързо развиващи се технологии.",
        "И тази година консултанти в играта бяха преподавателите от катедра „Управление“ в УНСС, гл. ас. Васил Марчев и Светла Ценова.",
        "Ценна помощ в реализацията на събитието оказа и инж. Симеон Бояджиев от \"Университетски център за комуникации и студентски политики\".",
        "Създател и организатор на събитието за трета поредна година беше д-р инж. Станислав Дарачев.",
        "Благодарим на „Национално сдружение на общините в Република България-НСОРБ“ за оказаното съдействие при популяризиране на събитието.",
        "Началото беше дадено от проф. Жулиета Манчева, заместник-ректор на УАСГ по учебни дейности и докторантури. А след успешното реализиране на общинската инвестиционна програма, протоколът беше спазен и обектът бе символично открит с тържествено прерязване на лентата.",
        "Игровизацията на процеса е пряко свързана с дисциплините, водени в катедра „Организация и управление на строителството“ към Строителен факултет на УАСГ.",
      ],
      en: [
        "On 28 November 2025, UASG again brought education and business together in one place. Students from the Faculty of Hydraulic Engineering and the Faculty of Transportation Engineering went through a complete investment process from the first signature to the final report.",
        "## Focus on infrastructure",
        "This year's edition focused on infrastructure. Participants simulated a municipal investment programme for construction and for control in delivering the most common public investments: the construction of a new street network with accompanying water-supply and sewerage infrastructure, and the reconstruction of existing streets and water mains.",
        "Participants formed teams that carried out typical work of clients, construction companies and construction-supervision firms. In stages, the different teams had to determine the construction and assembly quantities to be contracted, form analytical unit prices, and cost the activity of controlling the construction process. Negotiation between the participants followed, and agreements were signed. The process also included surprises, such as a fuel-price increase driven by international policy, which affected mechanisation costs and some construction products. In the end the works were handed over to quality and on time, with the required documentation, which made it possible to open them officially.",
        constructionGameInfographic.id,
        UASG_CONSTRUCTION_GAME_VIDEO,
        "## Expert support from business and institutions",
        "To make the process as realistic as possible, the teams had instructors.",
        "Guidance for the client teams came from Eng. Denitsa Decheva, Eng. Yovka Minkova and Eng. Gergana Mihaylova of Stara Zagora Municipality, who are also alumni of the two faculties.",
        "The construction teams drew on the experience of the second-largest construction company in Europe — STRABAG — who were also a sponsor of the event. The instructor team included Eng. Plamen Antonov, group technical manager; Mr Bozhidar Kostadinov, group economic manager; Eng. Ivan Petrov, head of the Calculations department; Eng. Viktoria Damyanova, technical control; and Eng. Lidiya Kovachka, contract management.",
        "To keep the process real, of high quality and clearly recorded, the construction-supervision teams relied on the experience of Eng. Evgeni Tsvetanov of EQE-Control.",
        "All participants had the opportunity to take part in a briefing on the controlled use of contemporary technologies in support of construction participants. Eng. Ivan Todorov demonstrated an approach to working with AI assistants based on clearly defined roles, instructions and context. The focus was not on a “ready-made AI” that does the students' tasks for them, but on building a controlled and predictable process. This is a tool for clearer thinking, analysis and work on engineering tasks in an environment of rapidly developing technologies.",
        "This year the game's consultants were again teaching staff from the Department of Management at UNWE: Chief Assist. Prof. Vasil Marchev and Svetla Tsenova.",
        "Valuable help in delivering the event also came from Eng. Simeon Boyadzhiev of the University Centre for Communications and Student Policies.",
        "The creator and organiser of the event for the third consecutive year was Dr Eng. Stanislav Darachev.",
        "We thank the National Association of Municipalities in the Republic of Bulgaria (NAMRB) for assistance in promoting the event.",
        "The opening was given by Prof. Zhulieta Mancheva, Vice-Rector of UASG for academic affairs and doctoral studies. After the municipal investment programme had been successfully carried out, protocol was observed and the site was symbolically opened with a ribbon-cutting.",
        "The gamification of the process is directly linked to the courses taught in the Department of Construction Organization and Management at the Faculty of Structural Engineering of UASG.",
      ],
    },
    topics: {
      bg: ["УАСГ", "Образование", "Инфраструктура"],
      en: ["UASG", "Education", "Infrastructure"],
    },
    date: "2025-12-02",
    source: {
      bg: `Университетска новина на uacg.bg, 2 декември 2025. ${UASG_CONSTRUCTION_GAME_SOURCE}`,
      en: `University news on uacg.bg, 2 December 2025. ${UASG_CONSTRUCTION_GAME_SOURCE}`,
    },
  },
];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((i) => i.slug === slug);
}
