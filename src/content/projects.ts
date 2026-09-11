import type { Project, Stage } from "./types";
import { approachName, approachStages } from "./approach";

const sharedMethodIntro = {
  bg: "Подходът е разбиране на процеса, проектиране на подходящата архитектура и изграждане на работеща система. AI се включва само когато има смисъл.",
  en: "The approach is to understand the process, design the appropriate architecture, and build a working system. AI is used only where it makes sense.",
};

const atnCreatorMethodStages: Stage[] = [
  {
    code: "01",
    short: { bg: "Разбиране", en: "Understand" },
    title: { bg: "Разбиране", en: "Understand" },
    body: {
      bg: "Започваме от реалния процес на управление на криейтъри: как се избират партньори, каква информация е нужна, как се договарят сътрудничествата, как се следят доставките и как се оценява публикуваното съдържание. Бизнес моделът и моделът на данните предхождат избора на AI технология.",
      en: "Start from the real creator-management process: how creators are selected, what information is required, how collaborations are agreed, how deliverables are followed and how published content is evaluated. The business and data model comes before the choice of AI technology.",
    },
  },
  {
    code: "02",
    short: { bg: "Проектиране", en: "Design" },
    title: { bg: "Проектиране", en: "Design" },
    body: {
      bg: "Структурираният софтуер и детерминираните работни потоци държат записите, статусите и бизнес правилата. AI се използва избирателно там, където интерпретация, проучване, класификация, обобщение или препоръка могат да намалят ръчната работа, изискваща много знание. Човешкият контрол остава важен за търговските решения и отношенията с криейтърите.",
      en: "Use structured software and deterministic workflows for records, statuses and business rules. Use AI selectively where interpretation, research, classification, summarisation or recommendation can reduce knowledge-heavy manual work. Human control remains important for commercial decisions and creator relationships.",
    },
  },
  {
    code: "03",
    short: { bg: "Изграждане", en: "Build" },
    title: { bg: "Изграждане", en: "Build" },
    body: {
      bg: "Развитието е поетапно около проверени бизнес изисквания. Приоритет е полезна оперативна основа за управлявани криейтъри и сътрудничества, преди разширяване към по-широки възможности за интелигентност.",
      en: "Develop incrementally around verified business requirements. Prioritise a useful operational foundation for managed creators and collaborations before expanding into broader intelligence capabilities.",
    },
  },
];

export const projects: Project[] = [
  {
    slug: "ai-assisted-solar-operations",
    featured: true,
    status: "in-development",
    type: { bg: "Операционна система", en: "Operational system" },
    domain: { bg: "Възобновяема енергия", en: "Renewable energy" },
    methodologyName: approachName,
    title: { bg: "AI-подпомогнати слънчеви операции", en: "AI-Assisted Solar Operations" },
    standfirst: {
      bg: "Приложен AI в реална оперативна среда около слънчева инфраструктура: наблюдение, оперативни решения и автоматизация там, където са проверени.",
      en: "Applied AI in a real operational setting around solar infrastructure: monitoring, operational decision support and automation where they are verified.",
    },
    summary: {
      bg: "Проектът показва как софтуер и AI могат да подпомогнат физически операции, а не демо в изолация. Конкретната функционалност, статус и доказателства: TODO_VERIFY / TODO_ASSET.",
      en: "The project shows how software and AI can support physical operations, rather than a demo in isolation. Specific functionality, status and evidence: TODO_VERIFY / TODO_ASSET.",
    },
    systemProblem: {
      bg: [
        "Слънчевата инфраструктура съчетава физически активи, оперативни решения и софтуер. TODO_VERIFY: точният оперативен проблем, който се адресира.",
        "Публичното описание включва само проверена функционалност. Липсващите екрани и факти са маркирани, не са дописани.",
      ],
      en: [
        "Solar infrastructure combines physical assets, operational decisions and software. TODO_VERIFY: the exact operational problem being addressed.",
        "The public description includes only verified functionality. Missing screens and facts are marked, not invented.",
      ],
    },
    objective: {
      bg: ["Да се изгради полезна оперативна система около реални активи и данни — TODO_VERIFY за обхвата."],
      en: ["Build a useful operational system around real assets and data — TODO_VERIFY for scope."],
    },
    methodology: {
      intro: sharedMethodIntro,
      stages: approachStages,
    },
    dataEvidence: {
      bg: ["TODO_ASSET — табло, оперативен интерфейс, диаграма или работен поток."],
      en: ["TODO_ASSET — dashboard, operational UI, diagram or workflow."],
    },
    statusNote: {
      bg: "TODO_VERIFY — публичен статус (пилот / вътрешна разработка / продукция). Няма изфабрикувани метрики.",
      en: "TODO_VERIFY — public status (pilot / internal R&D / production). No fabricated metrics.",
    },
    sourceNote: {
      bg: "TODO_VERIFY — описанието ще се актуализира след потвърдени факти и материали.",
      en: "TODO_VERIFY — this description will be updated once facts and assets are confirmed.",
    },
  },
  {
    slug: "local-ai-orchestration",
    featured: false,
    status: "internal-rd",
    type: { bg: "Вътрешна разработка", en: "Internal R&D" },
    domain: { bg: "Локален AI / оркестрация", en: "Local AI / orchestration" },
    methodologyName: approachName,
    title: { bg: "Локална AI оркестрация", en: "Local AI Orchestration" },
    standfirst: {
      bg: "Модулна архитектура за координация на специализирани локални AI модели, инструменти и услуги чрез слой за оркестрация.",
      en: "A modular architecture for coordinating specialised local AI models, tools and services through an orchestration layer.",
    },
    summary: {
      bg: "Публичното представяне е технически сдържано. MCP и вътрешните компоненти се описват по-надолу само ако са уместни. Архитектурна визуализация: TODO_ASSET.",
      en: "The public presentation is technically restrained. MCP and internal components appear in deeper project content only where appropriate. Architecture visual: TODO_ASSET.",
    },
    systemProblem: {
      bg: [
        "Специализирани локални модели, инструменти и услуги трябва да работят заедно, без да се превръщат в един „универсален агент“.",
        "TODO_VERIFY — точен архитектурен обхват и какво е реално изградено към публичния текст.",
      ],
      en: [
        "Specialised local models, tools and services need to work together without collapsing into a single catch-all agent.",
        "TODO_VERIFY — exact architectural scope and what is actually built relative to this public text.",
      ],
    },
    objective: {
      bg: ["Координация на специализирани локални компоненти през оркестрационен слой."],
      en: ["Coordinate specialised local components through an orchestration layer."],
    },
    methodology: {
      intro: sharedMethodIntro,
      stages: approachStages,
    },
    targetArchitecture: {
      intro: {
        bg: "Работна концепция. Технически детайл като MCP се включва само при потвърждение.",
        en: "Working concept. Technical detail such as MCP is included only when confirmed.",
      },
      components: {
        bg: [
          "Локални модели и специализирани компоненти — TODO_VERIFY",
          "Инструменти и услуги — TODO_VERIFY",
          "Оркестрационен слой — TODO_VERIFY",
          "Свързаност към външни инструменти (напр. MCP), ако е част от реалната архитектура — TODO_VERIFY",
        ],
        en: [
          "Local models and specialised components — TODO_VERIFY",
          "Tools and services — TODO_VERIFY",
          "Orchestration layer — TODO_VERIFY",
          "Connectivity to external tools (e.g. MCP) if it is part of the real architecture — TODO_VERIFY",
        ],
      },
    },
    dataEvidence: {
      bg: ["TODO_ASSET — архитектурна схема или реален системен UI."],
      en: ["TODO_ASSET — architecture diagram or real system UI."],
    },
    statusNote: {
      bg: "Вътрешна разработка / прототип. Не е продукт за продажба.",
      en: "Internal R&D / prototype. Not a product being sold.",
    },
    sourceNote: {
      bg: "TODO_VERIFY — публичното име следва реалната архитектура.",
      en: "TODO_VERIFY — public naming should follow the real architecture.",
    },
  },
  {
    slug: "atn-warranty-portal",
    featured: false,
    status: "previous-professional",
    type: { bg: "Бизнес платформа", en: "Business platform" },
    domain: { bg: "Гаранции / следпродажбено обслужване", en: "Warranty / after-sales" },
    methodologyName: approachName,
    title: { bg: "Гаранционен портал ATN", en: "ATN Warranty Portal" },
    standfirst: {
      bg: "Дигитална платформа за гаранционна регистрация и оперативен работен процес — пример за разбиране на бизнес процес и изграждане на реален софтуер, без AI да е центърът на историята.",
      en: "A digital platform for warranty registration and operator workflow — an example of understanding a business process and shipping real software, without forcing AI into the story.",
    },
    summary: {
      bg: "Порталът покрива публична регистрация (сериен номер / продукт, касова бележка, данни за покупка) и вътрешни операторски опашки, включително преглед на случаи и търсене по номер на рекламация. Връзката с ITT Digital Hub: TODO_VERIFY. Не се твърди клиентска връзка, докато не бъде потвърдена.",
      en: "The portal covers public registration (serial / product, receipt, purchase data) and internal operator queues, including case review and RMA lookup. Relationship to ITT Digital Hub: TODO_VERIFY. No client relationship is claimed until confirmed.",
    },
    systemProblem: {
      bg: [
        "Гаранционната и следпродажбената работа често е разпръсната между хора, каталози, имейл и ръчна проверка.",
        "Целта тук е работещ оперативен процес, не AI демонстрация.",
      ],
      en: [
        "Warranty and after-sales work is often split across people, catalogues, email and manual checks.",
        "The point here is a working operational process, not an AI demonstration.",
      ],
    },
    objective: {
      bg: [
        "Дигитализиране на регистрацията и операторския преглед около реални продуктови и серийни данни.",
        "TODO_VERIFY — формална роля и разрешение за публично представяне.",
      ],
      en: [
        "Digitise registration and operator review around real product and serial data.",
        "TODO_VERIFY — formal role and permission for public presentation.",
      ],
    },
    methodology: {
      intro: sharedMethodIntro,
      stages: approachStages,
    },
    dataEvidence: {
      bg: [
        "Публичният портал е на warranty.atneu.com: регистрация по сериен номер, интерфейс на шест езика и тристъпков процес.",
        "Екраните по-долу са от живата система — без операторски опашки и без изфабрикувани данни.",
      ],
      en: [
        "The public portal is at warranty.atneu.com: serial-number registration, a six-language interface and a three-step flow.",
        "The screens below are from the live system — no operator queues and no fabricated data.",
      ],
    },
    statusNote: {
      bg: "Завършен проект. TODO_VERIFY за точен публичен статус и връзка с ITT.",
      en: "Completed project. TODO_VERIFY for the exact public status and relationship to ITT.",
    },
    sourceNote: {
      bg: "Описанието следва проверена функционалност на портала. Без обявена възвръщаемост, без брой потребители, без препоръки.",
      en: "The description follows verified portal behaviour. No ROI, user counts or endorsements.",
    },
  },
  {
    slug: "atn-creator-social-intelligence",
    featured: false,
    status: "in-development",
    type: { bg: "Бизнес платформа", en: "Business platform" },
    domain: { bg: "Криейтър маркетинг / социална интелигентност", en: "Creator marketing / social intelligence" },
    methodologyName: approachName,
    title: { bg: "Платформа ATN Creator & Social Intelligence", en: "ATN Creator & Social Intelligence Platform" },
    standfirst: {
      bg: "Бизнес платформа за управление на отношенията с криейтъри, сътрудничествата, съдържанието и представянето — проектирана около реалния оперативен процес зад криейтър маркетинга.",
      en: "A business platform for managing creator relationships, collaborations, content and performance — designed around the real operational workflow behind creator marketing.",
    },
    summary: {
      bg: "Бизнес платформа за управление на сътрудничества с криейтъри, съдържание и представяне — която превръща разпокъсаните социални и оперативни данни в структурирана интелигентност.",
      en: "A business platform for managing creator collaborations, content and performance — turning fragmented social and operational data into structured intelligence.",
    },
    proposition: {
      bg: "Съберете отношенията с криейтъри, сътрудничествата, доставките, съдържанието и данните за представяне в една структурирана оперативна платформа.",
      en: "Bring creator relationships, collaborations, deliverables, content and performance data into one structured operational platform.",
    },
    systemProblem: {
      bg: [
        "Операциите в криейтър маркетинга могат да се разпръснат между таблици, социални платформи, съобщения, файлове и знанието на отделни хора в екипа, което затруднява да се разбере какво е договорено, какво е доставено и какво е работило.",
        "Управлението на отношенията с криейтъри не е само проблем на анализ в социалните мрежи.",
        "Процесът започва с разбиране на отношението, записване на договореното, проследяване на продукти или възнаграждение, следване на очакваните доставки и свързване на публикуваното съдържание обратно към сътрудничеството.",
        "Тези дейности често са разпокъсани между таблици, съобщения, социални платформи, файлове и индивидуално знание в екипа.",
        "Това затруднява поддържането на единен оперативен изглед към всяко отношение, надеждното следване на ангажиментите, свързването на публикуваното съдържание със сътрудничеството, което го е произвело, и повторното използване на историческа информация при планиране на следваща работа.",
        "Целта не е още една обща база с инфлуенсъри. Целта е система около действителния работен процес за управление на криейтъри.",
      ],
      en: [
        "Creator marketing operations can become fragmented across spreadsheets, social platforms, messages, files and individual team knowledge, making it difficult to understand what was agreed, what was delivered and what performed.",
        "Managing creator relationships is not only a social-media analytics problem.",
        "The process begins with understanding the creator relationship, recording what has been agreed, tracking products or compensation, following expected deliverables and connecting the resulting published content back to the collaboration.",
        "These activities are often fragmented across spreadsheets, messages, social platforms, files and individual team knowledge.",
        "That makes it difficult to maintain a single operational view of each relationship, reliably follow commitments, connect published content to the collaboration that produced it and reuse historical information when planning future work.",
        "The objective is not to build another generic influencer database. It is to build a system around the actual creator-management workflow.",
      ],
    },
    objective: {
      bg: [
        "Структурирана оперативна платформа, която свързва криейтъри, социални профили, сътрудничества, доставки, продукти или възнаграждение, публикувано съдържание и свързаната информация за представяне.",
        "Първият продуктов фокус е управляваните криейтъри и сътрудничества.",
        "Намерението е да се свържат управлението на отношенията и анализът на представянето, вместо да се третират като отделни процеси.",
      ],
      en: [
        "A structured operational platform connecting creators, social profiles, collaborations, deliverables, products or compensation, published content and associated performance information.",
        "The first product focus is Managed Influencers and Collaborations.",
        "The intention is to connect relationship management and performance analysis instead of treating them as separate processes.",
      ],
    },
    scope: {
      intro: {
        bg: "Платформата се проектира около проследим оперативен поток за управлявани криейтъри и сътрудничества. Това е текущият продуктов фокус, а не описание на вече завършена система.",
        en: "The platform is being designed around a traceable operational flow for managed creators and collaborations. This is the current product focus, not a description of a finished system.",
      },
      chain: {
        bg: ["Криейтър", "Социални профили", "Сътрудничество", "Доставки", "Продукти / възнаграждение", "Публикувано съдържание", "Метрики", "Преглед и последващи действия"],
        en: ["Creator", "Social profiles", "Collaboration", "Deliverables", "Products / compensation", "Published content", "Metrics", "Review and follow-up"],
      },
      items: {
        bg: [
          "Записи за криейтъри и свързаните социални профили",
          "Сътрудничества с договорен обхват и статус",
          "Доставки, продукти и възнаграждение",
          "Публикувано съдържание, свързано към сътрудничеството",
        ],
        en: [
          "Creator records and associated social profiles",
          "Collaborations with agreed scope and status",
          "Deliverables, products and compensation",
          "Published content linked back to the collaboration",
        ],
      },
      note: {
        bg: "По-широки възможности като откриване на органично съдържание, откриване на криейтъри, интелигентност за съдържанието, конкурентна интелигентност, наблюдение на общности, сигнали и препоръки са бъдещи продуктови посоки и не се представят като вече изградена функционалност.",
        en: "Broader capabilities such as organic content discovery, creator discovery, content intelligence, competitor intelligence, community monitoring, alerts and recommendations are future product directions and must not be presented as already implemented.",
      },
    },
    methodology: {
      intro: {
        bg: "Бизнес разбирането и моделът на данните идват преди избора на AI. Софтуерът държи записите и правилата; AI се включва само където тълкуването намалява ръчната работа.",
        en: "Business understanding and the data model come before the choice of AI. Software holds the records and rules; AI is introduced only where interpretation reduces manual work.",
      },
      stages: atnCreatorMethodStages,
    },
    intelligence: {
      body: {
        bg: [
          "След оперативната основа същата структурирана връзка между криейтъри, сътрудничества и публикувано съдържание създава основа за анализ на представянето по криейтъри, формати на съдържание и сътрудничества.",
          "Този слой е предназначен да подпомогне по-ясно сравнение, отчетност и бъдещо вземане на решения, без анализът да се отделя от оперативния контекст, в който съдържанието е възникнало.",
        ],
        en: [
          "After the operational foundation, the same structured relationship between creators, collaborations and published content creates a foundation for analysing performance across creators, content formats and collaborations.",
          "This layer is intended to support clearer comparison, reporting and future decision-making without separating analytics from the operational context that produced the content.",
        ],
      },
    },
    followUp: {
      bg: [
        "След като оперативната основа е налична, платформата може да подкрепи допълнителни работни потоци за интелигентност. Те остават бъдещи продуктови посоки и зависят от продуктова валидация, наличност на данни, ограничения на платформени API, изисквания за поверителност и приоритети на реализацията.",
        "Откриване на органично съдържание — намиране на релевантно съдържание, свързано с марката, извън управляваните сътрудничества.",
        "Откриване на криейтъри — идентифициране на потенциални бъдещи партньори по определени изследователски критерии.",
        "Интелигентност за съдържанието — анализ на модели, формати, теми и представяне на съдържанието.",
        "Конкурентна интелигентност — структуриран изглед към релевантна криейтърска активност и съдържание на конкуренти.",
        "Интелигентност за общности — наблюдение на избрани онлайн общности, когато това носи легитимна бизнес стойност.",
        "Сигнали и препоръки — показване на ситуации, които изискват внимание, вместо потребителите да преглеждат повторно големи обеми данни.",
      ],
      en: [
        "Once the operational foundation is established, the platform may support additional intelligence workflows. These remain future product directions and are subject to product validation, data availability, platform API constraints, privacy requirements and implementation priorities.",
        "Organic content discovery — finding relevant brand-related content outside managed collaborations.",
        "Creator discovery — identifying potential future partners based on defined research criteria.",
        "Content intelligence — analysing content patterns, formats, topics and performance.",
        "Competitor intelligence — building a structured view of relevant competitor creator activity and content.",
        "Community intelligence — monitoring selected online communities where this provides legitimate business value.",
        "Alerts and recommendations — surfacing situations that require attention instead of requiring users to repeatedly inspect large volumes of data.",
      ],
    },
    targetArchitecture: {
      intro: {
        bg: "Продуктът не трябва да бъде организиран около една външна социална мрежа, CRM или трета платформа. CRM системи, социални API и други услуги могат да подпомагат части от процеса, но моделът на отношението с криейтъра и на сътрудничеството трябва да остане независим.",
        en: "The product should not be organised around one external social network, CRM or third-party platform. CRM systems, social APIs and other services may support parts of the workflow, but the creator relationship and collaboration model should remain independent.",
      },
      components: {
        bg: [
          "Собствен модел на криейтърското отношение и сътрудничеството",
          "Интеграции към съществуващи бизнес системи, без една външна услуга да става архитектурата на продукта",
          "Избирателно въвеждане на AI, без целият процес да зависи от един модел или агент",
        ],
        en: [
          "An independent creator-relationship and collaboration model",
          "Integration with existing business systems without turning one external service into the architecture of the product",
          "AI introduced selectively rather than making the complete workflow dependent on one model or agent",
        ],
      },
    },
    dataEvidence: {
      bg: [
        "Проектът е в активна продуктова разработка.",
        "Двата интерфейсни визуала на тази страница са концептуални прототипи, използвани за комуникация на продуктовата посока и потребителското изживяване. Те не са продукционни екрани. Имената, метриките, детайлите по сътрудничествата и възнаграждението във визуалите са илюстративни прототипни данни и не са реални проектни резултати.",
        "Реални доказателства от реализацията следва да заменят или допълнят тези визуали, когато функционалността стане налична и проверена.",
      ],
      en: [
        "The project is currently in active product development.",
        "The two interface visuals on this page are conceptual prototypes used to communicate the intended product direction and user experience. They are not production screenshots. The names, metrics, collaboration details and compensation shown inside the visuals are illustrative prototype data and must not be described as real project results.",
        "Real implementation evidence should replace or supplement these visuals later as product functionality becomes available.",
      ],
    },
    measuredAreas: {
      intro: {
        bg: "Показатели за представяне следва да се добавят едва когато изградената платформа може да се оцени спрямо смислена оперативна база.",
        en: "Performance measures should only be added when the implemented platform can be evaluated against a meaningful operational baseline.",
      },
      items: {
        bg: [
          "намаляване на ръчната администрация",
          "пълнота на записите за сътрудничества",
          "надеждност на проследяването на доставки",
          "време за подготовка на анализ на представянето на криейтъри",
        ],
        en: [
          "reduction in manual administration",
          "completeness of collaboration records",
          "deliverable tracking reliability",
          "time required to prepare creator-performance analysis",
        ],
      },
      note: {
        bg: "Това са области за измерване, а не текущи твърдения за представяне.",
        en: "These are measurement areas, not current performance claims.",
      },
    },
    statusNote: {
      bg: "Платформата е в разработка. Страницата описва потвърдения проблем, продуктовата посока и текущия обхват. Планираната функционалност не се представя като завършена. Текущият приоритет е основата за управлявани криейтъри и сътрудничества. По-широките възможности за криейтърска и социална интелигентност са следващи продуктови фази, а не приета функционалност на първото издание. Публичното описание ще се развива с изграждането и проверката на функционалността.",
      en: "The platform is currently in development. This page describes the confirmed problem, product direction and current scope. Planned functionality is not presented as completed functionality. The current priority is the Managed Influencers and Collaborations foundation. Broader creator and social intelligence capabilities are treated as later product phases rather than assumed functionality of the initial release. The public project description should evolve as functionality is implemented and verified.",
    },
    sourceNote: {
      bg: "Описанието следва потвърдения проблем и продуктова посока. Визуалите са концептуални прототипи с примерни данни. Без публикувани измерени резултати, без брой потребители, без препоръки.",
      en: "The description follows the confirmed problem and product direction. The visuals are conceptual prototypes with sample data. No published measured results, user counts or endorsements.",
    },
    seo: {
      documentTitle: {
        bg: "Платформа ATN Creator & Social Intelligence | ITT Digital Hub",
        en: "ATN Creator & Social Intelligence Platform | ITT Digital Hub",
      },
      description: {
        bg: "Платформа в разработка за управление на сътрудничества с криейтъри, съдържание, доставки и представяне, която полага основа за по-широка социална интелигентност.",
        en: "An in-development platform for managing creator collaborations, content, deliverables and performance while building a foundation for broader social intelligence.",
      },
      ogTitle: {
        bg: "Платформа ATN Creator & Social Intelligence",
        en: "ATN Creator & Social Intelligence Platform",
      },
      ogDescription: {
        bg: "От отношения с криейтъри и проследяване на сътрудничества до структурирана социална интелигентност — оперативна платформа, която се разработва около реални работни процеси в криейтър маркетинга.",
        en: "From creator relationships and collaboration tracking to structured social intelligence — an operational platform currently being developed around real creator-marketing workflows.",
      },
      image: "/stories/atn-creator-collaboration-workspace.png",
    },
  },
];

export const featuredProject = projects.find((p) => p.featured) ?? projects[0]!;
