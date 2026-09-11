import type { L } from "@/lib/i18n";

export const home = {
  meta: {
    title: { bg: "ITT Digital Hub – приложен AI консултинг", en: "ITT Digital Hub — Applied AI Consultancy" },
    description: {
      bg: "От сложни работни процеси до работещи AI системи. Бизнес разбиране, системен поглед и AI инженерство.",
      en: "From complex workflows to working AI systems. Business understanding, systems thinking and AI engineering.",
    },
  },
  hero: {
    label: { bg: "Приложен AI консултинг", en: "Applied AI Consultancy" },
    headline: {
      bg: "От сложни работни процеси\nдо работещи AI системи.",
      en: "From complex workflows\nto working AI systems.",
    },
    lead: {
      bg: "Свързваме разбиране на бизнес процеси с практическо софтуерно инженерство, за да проектираме и изграждаме решения около реални операции, съществуващи системи и данни.",
      en: "We combine business process expertise and hands-on software engineering to design and build AI solutions around real operations, existing systems and data.",
    },
    primary: { bg: "Разгледайте работата ни", en: "Explore our work" },
    secondary: { bg: "Свържете се", en: "Get in touch" },
    proofLabel: { bg: "Нашите истории", en: "Our stories" },
  },
  experience: {
    heading: { bg: "Нашите партньори", en: "Our partners" },
    lead: {
      bg: "Организации с реални операции — търговия, производство, логистика и публични институции.",
      en: "Organisations with real operations — retail, manufacturing, logistics and public institutions.",
    },
  },
  featured: {
    label: { bg: "Работа", en: "Work" },
    heading: { bg: "Нашите истории", en: "Our stories" },
    lead: {
      bg: "Кратки истории за системи, които сме изграждали. Липсващите факти са маркирани, не са дописани.",
      en: "Short stories about systems we have built. Missing facts are marked, not invented.",
    },
    chainTitle: { bg: "Оперативен поток", en: "Operational flow" },
  },
  problems: {
    label: { bg: "Какво решаваме", en: "What we solve" },
    heading: { bg: "Проблеми, не каталог от услуги", en: "Problems, not a service catalogue" },
    lead: {
      bg: "AI, агенти, автоматизация и интеграции са средства. Започваме от класа проблем.",
      en: "AI, agents, automation and integrations are mechanisms. We start from the problem class.",
    },
  },
  judgement: {
    label: { bg: "Преценка", en: "Judgement" },
    heading: { bg: "AI не винаги е отговорът.", en: "AI isn’t always the answer." },
    lead: {
      bg: "Започваме от процеса, не от модела. В зависимост от проблема архитектурата може да включва AI агенти, детерминирана автоматизация, интеграции, класически софтуер, налични корпоративни инструменти, локален AI — или комбинация.",
      en: "We start with the process, not the model. Depending on the problem, the right architecture may involve AI agents, deterministic automation, integrations, conventional software, existing enterprise tools, local AI — or a combination.",
    },
  },
  approach: {
    label: { bg: "Как работим", en: "How we work" },
    heading: { bg: "Разбиране. Проектиране. Изграждане.", en: "Understand. Design. Build." },
    lead: {
      bg: "Хората, които разбират проблема, остават в проектирането и реализацията.",
      en: "The people who understand the problem remain involved in designing and building the solution.",
    },
  },
  people: {
    label: { bg: "Екип", en: "Team" },
    heading: { bg: "Двама допълващи се специалисти.", en: "Two complementary specialists." },
    subheading: { bg: "Един отговорен екип.", en: "One accountable team." },
    lead: {
      bg: "Директен контакт, допълваща експертиза, малко предавания, бързи решения — от разбирането на проблема до кода.",
      en: "Direct communication, complementary expertise, fewer handoffs, fast decisions — from understanding the problem through to implementation.",
    },
    axes: {
      left: { bg: "Бизнес / системи", en: "Business / systems" },
      right: { bg: "AI / инженерство", en: "AI / engineering" },
    },
  },
  work: {
    label: { bg: "Контакт", en: "Contact" },
    heading: { bg: "Имате проблем, който си струва да се реши?", en: "Have a problem worth solving?" },
    body: {
      bg: "Ако имате процес, операция или система, където AI може да има смисъл — покажете ни проблема.",
      en: "If you have a process, operation or system where AI might make sense, show us the problem.",
    },
  },
} as const;

export const contactForm = {
  name: { bg: "Име", en: "Name" },
  company: { bg: "Фирма", en: "Company" },
  phone: { bg: "Телефон", en: "Phone" },
  problem: { bg: "Кратко описание на проблем", en: "Short description of the problem" },
  send: { bg: "Изпрати", en: "Send" },
  sending: { bg: "Изпращане…", en: "Sending…" },
  success: {
    bg: "Благодарим. Съобщението е прието — ще се свържем.",
    en: "Thank you. The message was received — we will be in touch.",
  },
  error: {
    bg: "Не успяхме да изпратим съобщението. Опитайте отново.",
    en: "We couldn’t send the message. Please try again.",
  },
  invalid: {
    bg: "Попълнете име и кратко описание на проблема.",
    en: "Please enter your name and a short description of the problem.",
  },
  privacy: {
    bg: "Данните се използват само за отговор на запитването. Вижте",
    en: "We use these details only to reply to the enquiry. See",
  },
} as const;

export const about = {
  meta: {
    title: { bg: "Какво решаваме", en: "What we solve" },
    description: {
      bg: "ITT Digital Hub работи по разпокъсани процеси, работа, натоварена със знание, и сложни операции — с AI само където има смисъл.",
      en: "ITT Digital Hub works on fragmented workflows, knowledge-heavy work and complex operations — using AI only where it makes sense.",
    },
  },
  heading: { bg: "Проблемът първо. Технологията второ.", en: "Problem first. Technology second." },
  lead: {
    bg: "Не продаваме готови AI пакети. Гледаме реалния процес и изграждаме това, което препоръчваме.",
    en: "We do not sell predefined AI packages. We look at the real process and build what we recommend.",
  },
} as const;

export const methodologyPage = {
  meta: {
    title: { bg: "Подход", en: "Approach" },
    description: {
      bg: "Разбиране, проектиране и изграждане — без шестетапна консултантска театралност.",
      en: "Understand, design and build — without a six-stage consulting theatre.",
    },
  },
  heading: { bg: "Разбиране. Проектиране. Изграждане.", en: "Understand. Design. Build." },
  lead: {
    bg: "Същите старши хора остават от първия разговор до работещата система.",
    en: "The same senior people stay from the first conversation through to the working system.",
  },
} as const;

export const projectsPage = {
  meta: {
    title: { bg: "Работа", en: "Work" },
    description: {
      bg: "Избрана работа на ITT Digital Hub: оперативни системи, локален AI и бизнес платформи — с честен статус.",
      en: "Selected work from ITT Digital Hub: operational systems, local AI and business platforms — with honest status.",
    },
  },
  heading: { bg: "Избрана работа", en: "Selected work" },
  lead: {
    bg: "Примери за способност, не продукти в каталог. Без изфабрикувани резултати.",
    en: "Examples of capability, not a product catalogue. No fabricated results.",
  },
  statusVocabTitle: { bg: "Речник на статусите", en: "Status vocabulary" },
  statusVocabNote: {
    bg: "Работен речник. Непотвърденото остава като TODO.",
    en: "Working vocabulary. Unconfirmed facts stay as TODO.",
  },
  statusVocab: {
    bg: [
      ["Продукция", "Работи в реална среда."],
      ["В разработка", "Изгражда се; обхватът може още да се уточнява."],
      ["Вътрешна разработка", "Вътрешна разработка или прототип, не оферта."],
      ["Завършен проект", "Изградена система; връзката с ITT се потвърждава отделно."],
      ["Клиентски проект", "Само при потвърдена клиентска връзка."],
    ],
    en: [
      ["Production", "Running in a real environment."],
      ["In development", "Being built; scope may still be confirmed."],
      ["Internal R&D", "Internal work or a prototype, not an offering."],
      ["Completed project", "A built system; the ITT relationship is confirmed separately."],
      ["Client project", "Only when a client relationship is confirmed."],
    ],
  },
  detail: {
    problem: { bg: "Проблемът", en: "The problem" },
    symptoms: { bg: "Наблюдавани фактори", en: "Observed factors" },
    question: { bg: "Въпросът", en: "The question" },
    objective: { bg: "Какво се изгражда", en: "What was built" },
    scope: { bg: "Обхват", en: "Scope" },
    methodology: { bg: "Роля на AI / софтуера", en: "Role of AI / software" },
    data: { bg: "Доказателства", en: "Evidence" },
    stakeholders: { bg: "Участници", en: "Actors" },
    architecture: { bg: "Архитектура", en: "Architecture" },
    architectureComponents: { bg: "Компоненти", en: "Components" },
    outputs: { bg: "Резултати", en: "Deliverables" },
    validation: { bg: "Валидиране", en: "Validation" },
    indicators: { bg: "Показатели", en: "Indicators" },
    success: { bg: "Критерий", en: "Success criterion" },
    successIntro: { bg: "Приоритет:", en: "Priority:" },
    variants: { bg: "Варианти", en: "Variants" },
    followUp: { bg: "Следваща фаза", en: "Follow-up" },
    proposedTo: { bg: "Предложено към", en: "Proposed to" },
    measured: { bg: "Измерени резултати", en: "Measured results" },
    measuredEmpty: { bg: "Няма публикувани измерени резултати.", en: "No published measured results." },
    statusNote: { bg: "Бележка за статуса", en: "Status note" },
    source: { bg: "Източник", en: "Source" },
    meta: { bg: "Данни за проекта", en: "Project data" },
    glance: { bg: "Накратко", en: "At a glance" },
    executive: { bg: "Резюме", en: "Executive layer" },
    detailed: { bg: "Подробности", en: "Detail" },
    proposition: { bg: "В едно изречение", en: "One-sentence proposition" },
    method: { bg: "Метод", en: "Method" },
    actors: { bg: "Участници", en: "Actors" },
    intended: { bg: "Предвидено", en: "Intended outputs" },
    expected: { bg: "Очаквано", en: "Expected outcomes" },
    contents: { bg: "Съдържание", en: "Contents" },
    intelligence: { bg: "Съдържание и интелигентност за представянето", en: "Content & performance intelligence" },
    measuredAreas: { bg: "Възможни бъдещи области за измерване", en: "Potential future measurement areas" },
  },
} as const;

export const insightsPage = {
  meta: {
    title: { bg: "Анализи", en: "Insights" },
    description: { bg: "ITT Digital Hub не поддържа публичен блог.", en: "ITT Digital Hub does not run a public blog." },
  },
  heading: { bg: "Анализи", en: "Insights" },
  lead: { bg: "Тази секция не е част от публичния сайт.", en: "This section is not part of the public site." },
} as const;

export const newsPage = {
  meta: {
    title: { bg: "Новини", en: "News" },
    description: { bg: "ITT Digital Hub не поддържа публични новини.", en: "ITT Digital Hub does not run a public news channel." },
  },
  heading: { bg: "Новини", en: "News" },
  lead: { bg: "Тази секция не е част от публичния сайт.", en: "This section is not part of the public site." },
  empty: { bg: "Няма публични новини.", en: "No public news." },
} as const;

export const peoplePage = {
  meta: {
    title: { bg: "За нас", en: "About" },
    description: {
      bg: "Двама допълващи се специалисти: бизнес системи и AI инженерство в един ангажимент.",
      en: "Two complementary specialists: business systems and AI engineering in the same engagement.",
    },
  },
  heading: { bg: "Двама допълващи се специалисти. Един отговорен екип.", en: "Two complementary specialists. One accountable team." },
  lead: {
    bg: "Малкият старши екип е предимство: директен разговор, по-малко предавания, непрекъснатост от проблема до реализацията.",
    en: "A small senior team is an advantage: direct conversation, fewer handoffs, continuity from the problem through to implementation.",
  },
  structure: { label: { bg: "Комбинация", en: "Combination" }, heading: { bg: "Бизнес разбиране × инженерно изпълнение", en: "Business understanding × engineering execution" } },
  structureNote: {
    bg: "Не са твърди силози. И двамата могат да работят напречно. Важното е, че разбирането и изпълнението са в един ангажимент.",
    en: "These are not rigid silos. Both contribute across areas. The point is that understanding and execution sit in the same engagement.",
  },
  disciplines: { label: { bg: "Експертиза", en: "Expertise" }, heading: { bg: "Къде се допълваме", en: "Where we complement each other" } },
  team: { label: { bg: "Хора", en: "People" }, heading: { bg: "Профили", en: "Profiles" } },
  teamEmpty: {
    bg: "Профилите се показват само с потвърдени имена.",
    en: "Profiles are shown only with confirmed names.",
  },
  teamsNote: {
    bg: "ITT Digital Hub не представя несъществуващ голям екип.",
    en: "ITT Digital Hub does not imply a larger invisible organisation.",
  },
  expertiseLabel: { bg: "Експертиза", en: "Expertise" },
} as const;

export const workPage = {
  meta: {
    title: { bg: "Контакт", en: "Contact" },
    description: {
      bg: "Продължете разговора с ITT Digital Hub — кратка форма за запитване, без пакети.",
      en: "Continue the conversation with ITT Digital Hub — a short enquiry form, without packages.",
    },
  },
  heading: { bg: "Имате проблем, който си струва да се реши?", en: "Have a problem worth solving?" },
  lead: {
    bg: "Ако имате процес, операция или система, където AI може да има смисъл, покажете ни проблема.",
    en: "If you have a process, operation or system where AI might make sense, show us the problem.",
  },
  routes: { label: { bg: "Контакт", en: "Contact" }, heading: { bg: "Нисък праг", en: "Low friction" } },
  routeFields: {
    audience: { bg: "За кого", en: "Who" },
    problems: { bg: "Типични проблеми", en: "Typical problems" },
    modes: { bg: "Форми", en: "Forms" },
    partnerBrings: { bg: "Какво носите вие", en: "What you bring" },
    weBring: { bg: "Какво правим ние", en: "What we do" },
  },
  path: { label: { bg: "Как протича", en: "How it unfolds" }, heading: { bg: "От разговор до система", en: "From conversation to system" } },
  pathBody: {
    bg: "Кратък разговор за проблема. После — дали изобщо има смисъл да се строи, и какво точно.",
    en: "A short conversation about the problem. Then — whether anything should be built, and what.",
  },
  independence: { label: { bg: "Принцип", en: "Principle" }, heading: { bg: "Процесът първо", en: "Process first" } },
  independenceBody: {
    bg: "Не предлагаме AI там, където по-добре работи обикновен софтуер, интеграция или промяна на процеса.",
    en: "We do not push AI where ordinary software, an integration or a process change is the better answer.",
  },
  contact: { label: { bg: "Контакт", en: "Contact" }, heading: { bg: "Запитване", en: "Enquiry" } },
} as const;

export const privacyPage = {
  meta: {
    title: { bg: "Поверителност", en: "Privacy" },
    description: { bg: "Информация за обработването на данни на този уебсайт.", en: "Information about data processing on this website." },
  },
  heading: { bg: "Поверителност", en: "Privacy" },
  back: { bg: "Назад", en: "Back" },
  body: {
    bg: [
      "Този уебсайт представя ITT Digital Hub и не изисква регистрация.",
      "Контактната форма събира име, фирма, телефон и кратко описание на проблем, за да отговорим на запитването. Не използваме тези данни за маркетинг.",
      "Сайтът може да използва Vercel Analytics – измерване без рекламни бисквитки и без идентификация на отделни посетители.",
      "Хостинг доставчикът може да обработва технически данни (например IP адрес и данни за заявката) в сървърни журнали за сигурност и стабилност, съгласно собствените си правила.",
      "Имейл за доставка на формата и график: TODO_CONTENT. При промяна в обработването тази страница ще бъде актуализирана.",
    ],
    en: [
      "This website presents ITT Digital Hub and does not require registration.",
      "The contact form collects name, company, phone and a short description of the problem so we can reply to the enquiry. We do not use these details for marketing.",
      "The site may use Vercel Analytics — measurement without advertising cookies and without identifying individual visitors.",
      "The hosting provider may process technical data (such as IP address and request data) in server logs for security and stability, under its own policies.",
      "Inbox for form delivery and scheduling: TODO_CONTENT. If data processing changes, this page will be updated.",
    ],
  },
} as const;

export type Localized = L;
