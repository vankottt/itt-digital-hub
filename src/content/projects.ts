import type { L } from "@/lib/i18n";
import type { Project } from "./types";
import { approachName } from "./approach";

const discussProject = {
  bg: "Обсъдете проекта си",
  en: "Discuss your project",
} satisfies L;

const discussCreator = {
  bg: "Обсъдете вашата програма със създатели на съдържание",
  en: "Discuss your creator programme",
} satisfies L;

export const projects: Project[] = [
  {
    slug: "atn-warranty-portal",
    featured: true,
    status: "production",
    type: { bg: "Бизнес платформа", en: "Business platform" },
    domain: { bg: "Следпродажбено обслужване", en: "After-sales" },
    methodologyName: approachName,
    title: {
      bg: "Платформа за директна връзка между производител и краен клиент",
      en: "Manufacturer-to-Customer Warranty Platform",
    },
    standfirst: {
      bg: "Многоезична дигитална платформа, която свързва производителя директно с крайния клиент, автоматизира гаранционната регистрация с помощта на ИИ и превръща натрупаните данни в полезна бизнес и пазарна информация.",
      en: "A multilingual digital platform that connects manufacturers directly with end customers, automates warranty verification with AI and turns registrations into actionable customer and market insight.",
    },
    summary: {
      bg: "Директна дигитална връзка между производител и краен клиент, с автоматична гаранционна проверка с ИИ и собствена пазарна информация.",
      en: "A direct digital relationship between manufacturer and customer, with AI-assisted warranty verification and first-party market insight.",
    },
    tags: {
      bg: ["ИИ автоматизация", "Управление на процеси", "Собствени клиентски данни", "Бизнес анализ"],
      en: ["AI-assisted verification", "Workflow automation", "First-party data", "Business intelligence"],
    },
    cta: discussProject,
    proposition: {
      bg: "Удължената гаранция е входът към директна връзка с крайния клиент, без да се променя дистрибуционният модел.",
      en: "Extended warranty is the entry point into a direct customer relationship, without changing the distribution model.",
    },
    story: {
      challenge: {
        heading: { bg: "Предизвикателството", en: "The challenge" },
        body: {
          bg: [
            "Физическият продукт минава през дистрибутори и търговци, преди да стигне до крайния клиент. Производителят често губи видимост към това кой реално притежава продукта, къде е закупен и как се използва след продажбата.",
            "Гаранционната регистрация обикновено е разпръсната между документи, ръчна проверка и отделни екипи. Това забавя потвърждението и оставя малко структурирана информация за реалната пазарна активност.",
          ],
          en: [
            "The physical product still passes through distributors and retailers before it reaches the end customer. The manufacturer often loses sight of who actually owns the product, where it was bought and how it is used after the sale.",
            "Warranty registration is usually split across documents, manual checks and separate teams. That slows confirmation and leaves little structured information about real market activity.",
          ],
        },
      },
      built: {
        heading: { bg: "Какво изградихме", en: "What we built" },
        body: {
          bg: [
            "Изградихме многоезична платформа, която превръща гаранционната регистрация във вход към директна дигитална връзка между производителя и крайния клиент.",
            "Клиентът идентифицира продукта, въвежда данни за покупката и качва касова бележка или фактура. ИИ прочита документа, извлича датата на покупка и я сравнява с ръчно въведената дата, след което проверява условието за допустимост.",
            "Когато всичко съвпада, процесът продължава автоматично. Когато нещо липсва или е несъгласувано, клиентът е информиран и автоматично се създава случай за човешка проверка. Операторите работят през структурирана система за обработка на случаи на настолен и мобилен уеб.",
          ],
          en: [
            "We built a multilingual platform that turns warranty registration into an entry point for a direct digital relationship between the manufacturer and the end customer.",
            "The customer identifies the product, enters purchase details and uploads a receipt or invoice. AI reads the document, extracts the purchase date, compares it with the date entered by the customer and checks the eligibility condition.",
            "When everything matches, the process continues automatically. When something is incomplete or inconsistent, the customer is informed and a case is created for human review. Operators manage those exceptions through a structured case-management system on desktop and mobile web.",
          ],
        },
        quote: {
          bg: "ИИ обработва рутинната проверка. Хората се намесват при изключенията.",
          en: "AI handles routine verification. People handle exceptions.",
        },
      },
      howItWorks: {
        heading: { bg: "Как работи", en: "How it works" },
        body: {
          bg: [
            "Клиентското пътуване покрива ключови европейски пазари на 6 езика. Продуктовите данни се синхронизират автоматично със системите на производителя, така че новодобавените продукти да стават налични без повтаряща се ръчна поддръжка.",
            "Съгласието за маркетинг се обработва отделно от гаранционната регистрация. Ако клиентът даде съгласие, се използва отделен процес за потвърждение. Проследимостта и изискванията на GDPR са вградени в процеса.",
          ],
          en: [
            "The customer-facing journey supports 6 languages for key European markets. Product data is synchronised with the manufacturer's systems, so newly added products can become available without repetitive manual maintenance.",
            "Marketing consent is handled separately from warranty registration. If the customer opts in, a separate confirmation process is used. Traceability and GDPR requirements are built into the process.",
          ],
        },
        steps: {
          bg: [
            "Идентифициране на продукта",
            "Данни за клиента и покупката",
            "Качване на касова бележка или фактура",
            "ИИ прочита документа и извлича датата",
            "Сравнение с въведената дата и проверка на допустимостта",
            "Автоматично продължаване или случай за човешка проверка",
            "Потвърждение на гаранцията",
            "Отделно съгласие за комуникация",
          ],
          en: [
            "Identify the product",
            "Enter customer and purchase details",
            "Upload the receipt or invoice",
            "AI reads the document and extracts the date",
            "Compare dates and check eligibility",
            "Continue automatically, or open a human review case",
            "Warranty confirmation",
            "Separate marketing consent",
          ],
        },
      },
      value: {
        heading: { bg: "Директна връзка и пазарна видимост", en: "Direct relationship and market visibility" },
        body: {
          bg: [
            "Дистрибуционният модел остава непроменен: производител, дистрибутори, търговци, клиент. Платформата добавя паралелна директна връзка: производител, дигитална платформа, клиент.",
            "Производителят получава собствена видимост към реалните регистрации и клиентската активност: водещи държави и пазари, търговци и дистрибутори, регистрирани продукти, тенденции, обем на случаи, отворени и решени случаи, изключения и аудитория за комуникация със съгласие.",
            "Това показва къде реалната клиентска активност е най-силна и къде има смисъл да се насочат маркетинг, партньорска работа и търговско внимание. Клиентите, които изрично дадат съгласие, създават пряк канал към проверени собственици на продукта за новини, кампании и релевантна комуникация, без да се разчита единствено на дистрибутори и търговци.",
          ],
          en: [
            "The distribution model remains intact: manufacturer, distributors, retailers, customer. The platform adds a parallel direct relationship: manufacturer, digital platform, customer.",
            "The manufacturer gains first-party visibility into actual registrations and customer activity: leading countries and markets, retailers and distributors, registered products, trends, case volumes, open and resolved cases, exceptions and the consent-based communication audience.",
            "This shows where real customer activity is strongest and where marketing, partner work and commercial attention should go. Customers who explicitly opt in create a direct channel to verified product owners for product news, campaigns and relevant communication, without relying entirely on distributors or retailers.",
          ],
        },
        items: {
          bg: [
            "Водещи държави и пазари",
            "Водещи търговци и дистрибутори",
            "Най-регистрирани продукти",
            "Тенденции в регистрациите",
            "Обем, статус и изключения по случаи",
            "Аудитория за комуникация със съгласие",
          ],
          en: [
            "Top countries and markets",
            "Top retailers and distributors",
            "Top registered products",
            "Registration trends",
            "Case volumes, status and exceptions",
            "Consent-based communication audience",
          ],
        },
      },
      outcome: {
        heading: { bg: "Резултат", en: "Outcome" },
        body: {
          bg: [
            "За клиентите: проста многоезична регистрация. За операциите: по-малко ненужна ръчна проверка. За производителя: директни клиентски отношения, собствена пазарна видимост и структурирана основа за по-умно следпродажбено взаимодействие.",
          ],
          en: [
            "For customers: simple multilingual registration. For operations: less unnecessary manual review. For the manufacturer: direct customer relationships, first-party market visibility and a structured foundation for smarter after-sales engagement.",
          ],
        },
      },
    },
    seo: {
      documentTitle: {
        bg: "Платформа за директна връзка между производител и краен клиент | ITT Digital Hub",
        en: "Manufacturer-to-Customer Warranty Platform | ITT Digital Hub",
      },
      description: {
        bg: "Многоезична платформа, която свързва производителя с крайния клиент, автоматизира гаранционната проверка с ИИ и създава собствена пазарна информация.",
        en: "A multilingual platform that connects manufacturers with end customers, automates warranty verification with AI and creates first-party market insight.",
      },
      ogTitle: {
        bg: "Платформа за директна връзка между производител и краен клиент",
        en: "Manufacturer-to-Customer Warranty Platform",
      },
      ogDescription: {
        bg: "Удължената гаранция като вход към директна клиентска връзка, автоматична проверка и бизнес информация.",
        en: "Extended warranty as the entry point to a direct customer relationship, automated verification and business insight.",
      },
      image: "/stories/warranty-journey.jpg",
    },
  },
  {
    slug: "atn-creator-social-intelligence",
    featured: false,
    status: "production",
    type: { bg: "Бизнес платформа", en: "Business platform" },
    domain: { bg: "Създатели на съдържание", en: "Creator marketing" },
    methodologyName: approachName,
    title: {
      bg: "Управление и анализ на създатели на съдържание",
      en: "Creator & Social Intelligence",
    },
    standfirst: {
      bg: "Свързана система за целия жизнен цикъл на работата със създатели на съдържание: откриване, оценка, сътрудничество, проследяване, измерване и учене.",
      en: "A connected system for the full creator relationship lifecycle: discover, evaluate, collaborate, track, measure and learn.",
    },
    summary: {
      bg: "От разпокъсано управление на създатели на съдържание към една структурирана система за отношения, доставки, съдържание и представяне.",
      en: "From fragmented creator management to one structured system for relationships, deliverables, content and performance.",
    },
    tags: {
      bg: ["Операции със създатели", "Сътрудничества", "Анализ на представянето", "Откриване"],
      en: ["Creator operations", "Collaborations", "Performance analysis", "Discovery"],
    },
    cta: discussCreator,
    proposition: {
      bg: "Съберете отношенията, сътрудничествата, доставките, съдържанието и представянето в една оперативна система.",
      en: "Bring creator relationships, collaborations, deliverables, content and performance into one operational system.",
    },
    story: {
      challenge: {
        heading: { bg: "Предизвикателството", en: "The challenge" },
        body: {
          bg: [
            "Работата със създатели на съдържание често се разпръсква между таблици, съобщения, имейли, социални платформи, файлове и знанието на отделни хора в екипа.",
            "Това затруднява да се разбере с кого работи компанията, какво е договорено, какви продукти или възнаграждение са предоставени, какво съдържание трябва да бъде доставено, какво е публикувано, как е работило и кои създатели се представят най-добре за конкретни продукти или категории.",
          ],
          en: [
            "Creator marketing operations often become fragmented across spreadsheets, messages, emails, social platforms, files and individual team knowledge.",
            "That makes it difficult to understand who the company works with, what was agreed, what products or compensation were provided, what content should be delivered, what was actually published, how it performed and which creators perform best for specific products or categories.",
          ],
        },
      },
      built: {
        heading: { bg: "Какво изградихме", en: "What we built" },
        body: {
          bg: [
            "Изградихме платформа, която събира отношенията със създатели на съдържание, сътрудничествата, доставките, съдържанието и представянето в една свързана оперативна система.",
            "Публикуваното съдържание остава свързано със създателя, сътрудничеството, продукта, договорените доставки, възнаграждението или продуктовия обмен и с данните за представяне. Целта е да се запази бизнес контекстът зад всяка публикация.",
          ],
          en: [
            "We built a platform that brings creator relationships, collaborations, deliverables, content and performance into one connected operational system.",
            "Published content remains linked to the creator, the collaboration, the product, the agreed deliverables, compensation or product exchange and performance. The goal is to preserve the business context behind each piece of content.",
          ],
        },
        items: {
          bg: [
            "Профили на създатели и социални профили",
            "Управление на сътрудничества",
            "Доставки, продукти и възнаграждение",
            "Публикувано съдържание в бизнес контекст",
            "История на отношението и сравнение",
          ],
          en: [
            "Creator profiles and social profiles",
            "Collaboration management",
            "Deliverables, products and compensation",
            "Published content in business context",
            "Relationship history and comparison",
          ],
        },
      },
      howItWorks: {
        heading: { bg: "Как работи", en: "How it works" },
        body: {
          bg: [
            "Работният поток следва жизнения цикъл на отношението: откриване, оценка, сътрудничество, проследяване, измерване и учене.",
            "Платформата може да идентифицира създатели извън съществуващата партньорска мрежа, които вече се представят силно около релевантни продуктови категории. Това помага екипите да откриват бъдещи партньори по доказана релевантност и представяне, а не само по брой последователи.",
            "ИИ подпомага анализ на релевантност, откриване, сравнение, анализ на съдържание, класификация, обобщение, откриване на закономерности и препоръки. Центърът на историята остава по-добрите операции и по-добрите решения, а не самият модел.",
          ],
          en: [
            "The workflow follows the relationship lifecycle: discover, evaluate, collaborate, track, measure and learn.",
            "The platform can identify creators outside the existing partner network who already perform strongly around relevant product categories. This helps teams discover potential future partners based on demonstrated relevance and performance, not simply follower count.",
            "AI supports relevance analysis, discovery, comparison, content analysis, classification, summarisation, pattern detection and recommendations. The centre of the story remains better creator marketing operations and better decisions, not the model itself.",
          ],
        },
        steps: {
          bg: ["Откриване", "Оценка", "Сътрудничество", "Проследяване", "Измерване", "Учене"],
          en: ["Discover", "Evaluate", "Collaborate", "Track", "Measure", "Learn"],
        },
      },
      value: {
        heading: { bg: "Пет свързани възможности", en: "Five connected capabilities" },
        body: {
          bg: [
            "Системата премества компанията от разпокъсано управление на създатели на съдържание към структуриран източник на оперативна и социална интелигентност.",
          ],
          en: [
            "The system moves the company from fragmented creator management to a structured source of creator and social intelligence.",
          ],
        },
        items: {
          bg: [
            "Един изглед към отношенията със създатели на съдържание",
            "Контрол върху сътрудничествата и доставките",
            "Връзка между публикуваното съдържание и неговия бизнес контекст",
            "Анализ на представянето по създатели, продукти и сътрудничества",
            "Откриване на нови релевантни създатели",
          ],
          en: [
            "One view of creator relationships",
            "Control over collaborations and deliverables",
            "Connection between published content and its business context",
            "Performance analysis across creators, products and collaborations",
            "Discovery of new relevant creators",
          ],
        },
        quote: {
          bg: "С кого да работим, какво договорихме, какво беше доставено, какво сработи и къде да инвестираме следващия път?",
          en: "Who should we work with, what did we agree, what was delivered, what worked and where should we invest next?",
        },
      },
      outcome: {
        heading: { bg: "Резултат", en: "Outcome" },
        body: {
          bg: [
            "Екипите получават свързан оперативен изглед към програмата със създатели на съдържание: отношения, договорености, доставки, публикувано съдържание и представяне на едно място, с основа за по-добри следващи решения.",
          ],
          en: [
            "Teams get a connected operational view of the creator programme: relationships, agreements, deliverables, published content and performance in one place, with a foundation for better next decisions.",
          ],
        },
      },
    },
    seo: {
      documentTitle: {
        bg: "Управление и анализ на създатели на съдържание | ITT Digital Hub",
        en: "Creator & Social Intelligence | ITT Digital Hub",
      },
      description: {
        bg: "Платформа за откриване, сътрудничество, доставки, съдържание и представяне на създатели на съдържание в една свързана оперативна система.",
        en: "A platform for creator discovery, collaboration, deliverables, content and performance in one connected operational system.",
      },
      ogTitle: {
        bg: "Управление и анализ на създатели на съдържание",
        en: "Creator & Social Intelligence",
      },
      ogDescription: {
        bg: "От разпокъсано управление към структурирана интелигентност за създатели на съдържание.",
        en: "From fragmented creator management to structured creator and social intelligence.",
      },
      image: "/stories/creator-content-library.jpg",
    },
  },
  {
    slug: "ai-assisted-solar-operations",
    featured: false,
    status: "production",
    type: { bg: "Операционна система", en: "Operational system" },
    domain: { bg: "Възобновяема енергия", en: "Renewable energy" },
    methodologyName: approachName,
    title: {
      bg: "Пазарно оптимизирано управление на соларни паркове",
      en: "Market Optimised Solar Park Management",
    },
    standfirst: {
      bg: "Софтуерна система за управление на фотоволтаични централи и батерийни системи, която свързва производството с пазарните цени на електроенергията и помага активите да работят за по-добър икономически резултат, а не просто за максимално производство.",
      en: "A software platform for managing photovoltaic plants and battery systems by connecting energy production with electricity market prices, helping assets operate for stronger economic performance rather than simply maximum output.",
    },
    summary: {
      bg: "Управление на соларни паркове и батерии според пазарните цени, а не само според максималното производство.",
      en: "Solar park and battery control driven by market prices, not maximum output alone.",
    },
    tags: {
      bg: ["Управление на ФЕЦ", "Батерийни системи", "Пазарна оптимизация", "Мониторинг в реално време"],
      en: ["Solar plant control", "Battery systems", "Market optimisation", "Real time monitoring"],
    },
    proofPoint: {
      bg: "Внедрена в над 30 соларни парка",
      en: "Deployed across more than 30 solar parks",
    },
    cta: discussProject,
    proposition: {
      bg: "Целта не е максимално производство. Целта е максимална икономическа ефективност.",
      en: "The goal is not maximum production. The goal is maximum economic efficiency.",
    },
    story: {
      challenge: {
        heading: { bg: "Предизвикателството", en: "The challenge" },
        body: {
          bg: [
            "Максималното производство не винаги означава максимална печалба. Цените на електроенергията се променят динамично. В неблагоприятни или отрицателни ценови периоди допълнителното производство може да намали финансовия резултат.",
            "Системата затова гледа не само колко може да произведе централата, но и дали има икономически смисъл да произвежда точно сега.",
          ],
          en: [
            "Maximum production does not always mean maximum profit. Electricity prices change dynamically. During unfavourable or negative price periods, producing additional electricity can reduce the financial result.",
            "The system therefore considers not only how much the plant can produce, but whether it makes economic sense to produce it right now.",
          ],
        },
      },
      built: {
        heading: { bg: "Какво изградихме", en: "What we built" },
        body: {
          bg: [
            "Изградихме софтуерна платформа за наблюдение и управление на фотоволтаични централи и батерийни системи. Тя свързва физическите енергийни активи с пазарна информация от IBEX, независимата българска енергийна борса.",
            "Системата следи производството и състоянието на централата, свързаните батерийни системи и пазарните цени. Използва предварително дефинирани ценови и оперативни правила, може да адаптира производството автоматично, да го ограничава или временно да го спира, когато това е икономически обосновано, и изчислява приходите спрямо цените на IBEX.",
            "Финансовото представяне се проследява на интервали от 15 минути спрямо пазарните цени на IBEX.",
          ],
          en: [
            "We built a software platform for monitoring and controlling photovoltaic plants and battery systems. It connects physical energy assets with market information from IBEX, the Independent Bulgarian Energy Exchange.",
            "The system monitors production and plant status, connected battery systems and market prices. It uses predefined price and operational rules, can adapt production automatically, curtail it or temporarily stop it where that is economically appropriate, and calculates revenues against IBEX prices.",
            "Financial performance is tracked in 15 minute intervals against IBEX market prices.",
          ],
        },
      },
      howItWorks: {
        heading: { bg: "Как работи", en: "How it works" },
        body: {
          bg: [
            "Фотоволтаичното производство и батерийното съхранение се управляват като свързани енергийни активи, които реагират на технически и пазарни условия.",
            "Системата не зависи от ИИ, за да работи. ИИ е допълнителен слой, който постепенно подобрява анализа и подпомага оптимизационните решения. Заедно с детерминираната логика за управление се обучава специализиран ИИ модел върху натрупани оперативни и пазарни данни, за да подпомага по-добра оптимизация с времето.",
          ],
          en: [
            "Photovoltaic production and battery storage are managed as connected energy assets responding to technical and market conditions.",
            "The platform does not depend on AI to operate. AI acts as an additional learning layer that progressively improves analysis and supports optimisation decisions. Alongside the deterministic control logic, a specialised AI model is being trained on accumulated operational and market data, so optimisation can improve as more real operating data becomes available.",
          ],
        },
        quote: {
          bg: "Целта не е максимално производство. Целта е максимална икономическа ефективност.",
          en: "The goal is not maximum production. The goal is maximum economic efficiency.",
        },
      },
      value: {
        heading: { bg: "Икономическа ефективност", en: "Economic efficiency" },
        body: {
          bg: [
            "Операторите получават по-малко нужда от постоянно ръчно наблюдение и реакция. Собствениците получават по-ясна видимост към реалното представяне на активите и възможност да управляват производството според икономическия резултат, а не само според техническия капацитет.",
          ],
          en: [
            "Operators spend less time on constant manual monitoring and reaction. Owners gain clearer visibility into actual asset performance and the ability to manage production according to economic outcome, not technical capacity alone.",
          ],
        },
        items: {
          bg: [
            "Наблюдение на производството и състоянието на централата",
            "Управление на свързани батерийни системи",
            "Пазарни цени от IBEX",
            "Автоматична адаптация, ограничаване или спиране на производството",
            "Проследяване на приходи на 15 минути",
          ],
          en: [
            "Production and plant status monitoring",
            "Connected battery system management",
            "Market prices from IBEX",
            "Automatic adaptation, curtailment or stop",
            "Revenue tracking every 15 minutes",
          ],
        },
      },
      outcome: {
        heading: { bg: "Резултат", en: "Outcome" },
        body: {
          bg: [
            "Соларният парк вече не просто произвежда енергия. Той реагира на пазара и постепенно става по-добър в това.",
          ],
          en: [
            "The solar park no longer simply generates electricity. It responds to the market and becomes better at doing so over time.",
          ],
        },
      },
    },
    seo: {
      documentTitle: {
        bg: "Пазарно оптимизирано управление на соларни паркове | ITT Digital Hub",
        en: "Market Optimised Solar Park Management | ITT Digital Hub",
      },
      description: {
        bg: "Софтуер за управление на фотоволтаични централи и батерии според пазарните цени на IBEX. Внедрена в над 30 соларни парка.",
        en: "Software for managing photovoltaic plants and batteries against IBEX market prices. Deployed across more than 30 solar parks.",
      },
      ogTitle: {
        bg: "Пазарно оптимизирано управление на соларни паркове",
        en: "Market Optimised Solar Park Management",
      },
      ogDescription: {
        bg: "Производство, което реагира на пазара. Внедрена в над 30 соларни парка.",
        en: "Production that responds to the market. Deployed across more than 30 solar parks.",
      },
      image: "/stories/solar-batteries-cover.jpg",
    },
  },
  {
    slug: "local-ai-orchestration",
    featured: false,
    status: "internal-rd",
    type: { bg: "Архитектура за изпълнение", en: "Execution architecture" },
    domain: { bg: "ИИ системи", en: "AI systems" },
    methodologyName: approachName,
    title: {
      bg: "Локално ориентирана ИИ оркестрация",
      en: "Local-First AI Orchestration",
    },
    standfirst: {
      bg: "Архитектура за контролирано ИИ изпълнение, която извършва основната част от работата локално, управлява сложни многостъпкови задачи и използва облачни модели само когато те действително добавят стойност.",
      en: "A controlled AI execution architecture that keeps most work local, coordinates complex multi-step tasks and uses cloud intelligence only when it genuinely adds value.",
    },
    summary: {
      bg: "Локално ориентирано ИИ изпълнение, което координира сложна работа, проверява резултата и използва облака само когато добавя стойност.",
      en: "Local-first AI execution that coordinates complex work, verifies completion and uses the cloud only when it adds value.",
    },
    tags: {
      bg: ["Локални модели", "Оркестрация", "MCP", "Защита на данните", "Устойчиво изпълнение"],
      en: ["Local models", "Orchestration", "MCP", "Data protection", "Durable execution"],
    },
    cta: discussProject,
    proposition: {
      bg: "Не използваме най-големия модел за всяка задача. Използваме правилния начин на изпълнение за правилната работа.",
      en: "We do not use the largest model for every task. We use the right execution path for the right work.",
    },
    story: {
      challenge: {
        heading: { bg: "Предизвикателството", en: "The challenge" },
        body: {
          bg: [
            "Не всяка ИИ задача изисква най-големия и най-скъп облачен модел. Изпращането на всяка задача към голям външен модел увеличава използването на облака, извежда повече проектен контекст извън локалната среда и прави процесите зависими от конкретни доставчици.",
            "Скъпият капацитет за разсъждение се харчи за работа, която може да се свърши локално. Надеждната ИИ работа се нуждае и от оркестрация, възстановяване, достъп до инструменти, проектно знание, проверка и ясен краен резултат. Само изборът на модел не решава това.",
          ],
          en: [
            "Not every AI task requires the largest and most expensive cloud model. Sending every task to a large external model increases cloud usage, moves more project context outside the local environment and makes workflows dependent on specific providers.",
            "Expensive reasoning capacity is then spent on work that can be handled locally. Reliable AI work also needs orchestration, recovery, tool access, project knowledge, verification and a clear final result. A model router alone does not solve this.",
          ],
        },
      },
      built: {
        heading: { bg: "Какво изградихме", en: "What we built" },
        body: {
          bg: [
            "Изградихме локално ориентиран слой за ИИ изпълнение и оркестрация, който координира клиентски заявки, инструменти, локални работници, модели и контролирано използване на облачни услуги.",
            "Оркестрационният слой анализира задачата, прилага политика за изпълнение, разбива работата, разпределя локални работници, оценява междинни резултати, повтаря опитите при нужда и възстановява изпълнението след прекъсване.",
            "Многостъпковата работа запазва състояние, така че вече завършените части не се рестартират безразборно. MCP осигурява контролиран достъп до инструменти, файлове, данни и външни услуги. Оркестрационният слой остава отговорен за изпълнението.",
          ],
          en: [
            "We built a local-first AI execution and orchestration layer that coordinates clients, tools, local workers, model runtimes and approved cloud escalation.",
            "The orchestration layer analyses the task, applies an execution policy, decomposes work, dispatches local workers, evaluates intermediate results, retries where needed and recovers after interruption.",
            "Multi-step work keeps durable state, so already completed units are not blindly restarted. MCP provides controlled access to tools, files, data and external services. The orchestration layer remains responsible for execution.",
          ],
        },
        items: {
          bg: [
            "Анализ на задачата и политика за изпълнение",
            "Устойчива многостъпкова работа",
            "Разпределение към локални работници",
            "Крайна проверка",
            "Избирателно използване на облака",
          ],
          en: [
            "Task analysis and execution policy",
            "Durable multi-step work",
            "Local worker dispatch",
            "Final verification",
            "Selective cloud use",
          ],
        },
        quote: {
          bg: "MCP осигурява достъп. Оркестрацията управлява изпълнението.",
          en: "MCP provides access. The orchestration layer owns execution.",
        },
      },
      howItWorks: {
        heading: { bg: "Как работи", en: "How it works" },
        body: {
          bg: [
            "Локалното изпълнение е предпочитаният път. Облачни модели се използват само когато добавят реална стойност и политиката за изпълнение го позволява.",
            "Многостъпковата работа може да спре и да продължи. Системата запазва състоянието на задачата, така че прекъсване или рестарт не връща вече свършената работа в началото.",
            "Системата е проектирана да проверява дали работата действително е изпълнена, вместо да приема отговора на модела като достатъчно доказателство. Работниците получават нужния проектен контекст: структура, инструкции, умения и текущо състояние на работното пространство.",
          ],
          en: [
            "Local execution is the default. Cloud intelligence is used only when it adds real value and when policy permits it.",
            "Multi-step work can pause and resume. The system preserves task state, so a disconnect or restart does not send already completed work back to the beginning.",
            "The system is designed to verify that work actually completed, rather than treating model output alone as proof of success. Workers receive the project context they need: structure, instructions, skills and current workspace state.",
          ],
        },
        quote: {
          bg: "Локалното изпълнение е предпочитаният път. Облачни модели се използват само когато добавят реална стойност.",
          en: "Local execution is the default. Cloud intelligence is used only when it adds real value.",
        },
      },
      extras: [
        {
          heading: { bg: "Повече от избор на модел", en: "More than model routing" },
          body: {
            bg: [
              "Простата система за маршрутизиране избира модел и връща отговор. Тази архитектура управлява пътя на изпълнение: политика, оркестрация, локални работници, инструменти, оценка, проверка и резултат.",
              "Чувствителният контекст може да остане локален. Външните модели получават само необходимия контекст. Достъпът до работното пространство е ограничен, а използването на облака се определя от политика.",
              "Моделите и средите за изпълнение могат да се сменят според качество, производителност, цена и пригодност към задачата. Клиентите и процесите не трябва да се препроектират при всеки нов доставчик.",
            ],
            en: [
              "A simple routing system chooses a model and returns an answer. This architecture owns the execution path: policy, orchestration, local workers, tools, evaluation, verification and a result.",
              "Sensitive context can remain local. External models receive only the context that is necessary. Workspace access is scoped, and cloud use is policy-controlled.",
              "Models and runtimes can change according to quality, performance, cost and task suitability. Clients and workflows do not need to be redesigned around every new provider.",
            ],
          },
          items: {
            bg: [
              "По-малко излишно използване на облака",
              "Повече чувствителен контекст остава локален",
              "Сложните задачи могат да продължат след прекъсване",
              "Работата се проверява, а не се приема на доверие",
              "Различни модели без зависимост от един доставчик",
              "Проектното знание може да се използва повторно",
              "Локална и облачна интелигентност се комбинират съзнателно",
            ],
            en: [
              "Less unnecessary cloud usage",
              "More sensitive context stays local",
              "Complex tasks can continue after interruptions",
              "Work is verified instead of blindly trusted",
              "Different models can be used without vendor lock-in",
              "Project knowledge can be reused",
              "Local and cloud intelligence can be combined intentionally",
            ],
          },
        },
      ],
      value: {
        heading: { bg: "Къде се използва", en: "Where it is used" },
        body: {
          bg: [
            "Архитектурата се прилага върху вътрешни натоварвания в четири области.",
            "При измерени вътрешни натоварвания локално ориентираното изпълнение може значително да намали използването на облачни токени на ниво задача спрямо подходи, които разчитат основно на големи облачни модели. Това не е твърдение за същото намаление на общите оперативни разходи.",
          ],
          en: [
            "The architecture is applied to internal workloads in four areas.",
            "In measured internal workloads, local-first execution can substantially reduce task-level cloud-token usage compared with approaches that rely primarily on large cloud models. This is not a claim of the same reduction in total operating cost.",
          ],
        },
        items: {
          bg: [
            "Разработка и анализ на софтуер",
            "Проучване и работа със знания",
            "Анализ на документи и данни",
            "Автономни многостъпкови бизнес процеси",
          ],
          en: [
            "Software engineering and code analysis",
            "Research and knowledge work",
            "Document and data analysis",
            "Multi-step autonomous business workflows",
          ],
        },
      },
      outcome: {
        heading: { bg: "Резултат", en: "Outcome" },
        body: {
          bg: [
            "Резултатът не е просто по-малко използване на облачни модели. Получаваме по-контролиран начин за ИИ изпълнение, който е локално ориентиран, възстановим, наблюдаем, независим от доставчик, работи с проектен контекст и проверява дали задачата действително е изпълнена.",
            "Не използваме най-големия модел за всяка задача. Използваме правилния начин на изпълнение за правилната работа.",
            "Могат ли вашите ИИ процеси да работят по-ефективно? Проектираме архитектури, които комбинират локални модели, облачна интелигентност, проектен контекст, инструменти и автоматизация според реалните бизнес изисквания.",
          ],
          en: [
            "The result is not simply lower cloud usage. It is a more controlled AI execution model that is local-first, recoverable, observable, provider-independent, context-aware and designed to verify that work actually completed.",
            "We do not use the largest model for every task. We use the right execution path for the right work.",
            "Could your AI workflows operate more efficiently? We design architectures that combine local models, cloud intelligence, project context, tools and automation around real business requirements.",
          ],
        },
      },
    },
    seo: {
      documentTitle: {
        bg: "Локално ориентирана ИИ оркестрация | ITT Digital Hub",
        en: "Local-First AI Orchestration | ITT Digital Hub",
      },
      description: {
        bg: "Архитектура за контролирано ИИ изпълнение, която работи локално по подразбиране, управлява сложни задачи и използва облака само когато добавя реална стойност.",
        en: "A controlled AI execution architecture that works locally by default, coordinates complex tasks and uses the cloud only when it adds real value.",
      },
      ogTitle: {
        bg: "Локално ориентирана ИИ оркестрация",
        en: "Local-First AI Orchestration",
      },
      ogDescription: {
        bg: "Локално ориентирано изпълнение, устойчива оркестрация и облачна интелигентност само когато добавя стойност.",
        en: "Local-first execution, durable orchestration and cloud intelligence only when it adds value.",
      },
      image: "/stories/local-orchestration-cover.webp",
    },
  },
];

export const featuredProject = projects.find((p) => p.featured) ?? projects[0]!;
