import type { Project } from "./types";
import { approachName, approachStages } from "./approach";

const sharedMethodIntro = {
  bg: "Подходът е разбиране на процеса, проектиране на подходящата архитектура и изграждане на работеща система. AI се включва само когато има смисъл.",
  en: "The approach is to understand the process, design the appropriate architecture, and build a working system. AI is used only where it makes sense.",
};

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
];

export const featuredProject = projects.find((p) => p.featured) ?? projects[0]!;
