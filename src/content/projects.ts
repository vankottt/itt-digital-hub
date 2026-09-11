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
      image: "/stories/warranty-relation-cover.png",
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
      image: "/stories/creator-studio-cover.jpg",
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
    type: { bg: "Вътрешна разработка", en: "Internal R&D" },
    domain: { bg: "ИИ архитектура", en: "AI architecture" },
    methodologyName: approachName,
    title: {
      bg: "Локална ИИ оркестрация с интелигентно използване на облака",
      en: "Local-First AI Orchestration with Selective Cloud Escalation",
    },
    standfirst: {
      bg: "Хибридна ИИ архитектура, която разпределя задачите между локални модели, инструменти и облачни услуги според сложността, чувствителността на данните и необходимото качество на резултата.",
      en: "A hybrid AI architecture that routes work across local models, tools and cloud services according to task complexity, data sensitivity and required output quality.",
    },
    summary: {
      bg: "Локалните модели вършат работата по подразбиране. Облакът се използва само когато добавя реална стойност.",
      en: "Local models handle the work by default. The cloud is used only when it adds real value.",
    },
    tags: {
      bg: ["Локални модели", "Оркестрация", "MCP", "Защита на данните", "Динамично маршрутизиране"],
      en: ["Local models", "Orchestration", "MCP", "Data protection", "Dynamic routing"],
    },
    proofPoint: {
      bg: "При вътрешни натоварвания архитектурата намалява използването на облачни токени с около 60-80% при сравнимо качество на крайния резултат.",
      en: "Across internal workloads, the architecture reduces cloud token usage by around 60-80% while maintaining comparable output quality.",
    },
    cta: discussProject,
    proposition: {
      bg: "Не използваме най-големия модел за всяка задача. Използваме правилната интелигентност за правилната работа.",
      en: "We do not use the largest model for every task. We use the right intelligence for the right work.",
    },
    story: {
      challenge: {
        heading: { bg: "Предизвикателството", en: "The challenge" },
        body: {
          bg: [
            "Не всяка задача изисква най-големия и най-скъп облачен модел. Изпращането на всяко натоварване към големи външни модели увеличава потреблението на облачни токени, извежда повече данни извън локалната инфраструктура, създава зависимост от конкретни доставчици и харчи скъп капацитет за задачи, които могат да се решат локално.",
          ],
          en: [
            "Not every task requires the largest and most expensive cloud model. Sending every workload to large external models increases cloud token consumption, sends more data outside local infrastructure, creates dependency on specific vendors and wastes expensive model capacity on tasks that can be handled locally.",
          ],
        },
      },
      built: {
        heading: { bg: "Какво изградихме", en: "What we built" },
        body: {
          bg: [
            "Изградихме вътрешна хибридна архитектура, която по подразбиране изпълнява работата с локални модели и прехвърля към облака само когато това носи реална стойност.",
            "Оркестрационният слой управлява анализ на задачата, разбиване, избор на модел, паралелно изпълнение, междинна оценка, повторни опити, пренасочване и ескалация. MCP не е оркестраторът. MCP дава стандартизиран достъп до инструменти, файлове, данни, услуги и външни системи.",
          ],
          en: [
            "We built an internal hybrid architecture that runs work on local models by default and moves to the cloud only when that adds real value.",
            "The orchestration layer manages task analysis, decomposition, model selection, parallel execution, intermediate evaluation, retries, rerouting and escalation. MCP is not the orchestrator. MCP provides standardised access to tools, files, data, services and external systems.",
          ],
        },
      },
      howItWorks: {
        heading: { bg: "Локално по подразбиране", en: "Local-first by default" },
        body: {
          bg: [
            "Локалните модели вършат работата по подразбиране. Облакът се използва само когато добавя реална стойност. Това не е позиция срещу облака. Архитектурата съчетава локална и облачна интелигентност осмислено.",
            "Слоят за защита на данните и маршрутизиране може да задържи чувствителния контекст изцяло в локалната инфраструктура. Когато е нужен външен модел, системата може да ограничи каква информация напуска локалната среда. Където доставчиците го поддържат, се използват и принципи на нулево съхранение. Поверителността е част от архитектурата за маршрутизиране, а не разчитане само на политика на доставчика.",
            "Пулът от локални и облачни модели се променя непрекъснато. Модели могат да се добавят, заменят или премахват според качество, производителност, цена и пригодност към задачата. Системата не е заключена към един ИИ доставчик.",
          ],
          en: [
            "Local models handle the work by default. The cloud is used only when it adds real value. This is not an anti-cloud position. The architecture combines local and cloud intelligence deliberately.",
            "A data protection and routing layer can keep sensitive context entirely within local infrastructure. When an external model is required, the system can restrict what information is allowed to leave the local environment. Where supported by providers, zero-retention principles are also used. Privacy is part of the routing architecture, not a claim that zero retention alone keeps sensitive data from leaving the system.",
            "The local and cloud model pool changes continuously. Models can be added, replaced or removed according to quality, performance, cost and task suitability. The system is not locked to one AI provider.",
          ],
        },
      },
      value: {
        heading: { bg: "Къде се прилага", en: "Where it is applied" },
        body: {
          bg: [
            "Архитектурата се използва при вътрешни натоварвания като софтуерно инженерство и анализ на код, изследователска и знаниева работа, анализ на документи и данни, както и автономни бизнес процеси с множество инструменти и стъпки на изпълнение.",
            "При вътрешни натоварвания наблюдаваме около 60-80% по-ниско използване на облачни токени спрямо подход, който разчита основно на големи облачни модели. Това е наблюдение върху потреблението на облачни токени, а не твърдение за същото намаление на общите разходи.",
          ],
          en: [
            "The architecture is used on internal workloads such as software engineering and code analysis, research and knowledge work, document and data analysis, and autonomous business workflows that use multiple tools and execution steps.",
            "Across internal workloads, we observe around 60-80% lower cloud token usage compared with an approach that relies primarily on large cloud models. This is a token-usage observation, not a claim of the same reduction in total cost.",
          ],
        },
        items: {
          bg: [
            "Софтуерно инженерство и анализ на код",
            "Изследователска и знаниева работа",
            "Анализ на документи и данни",
            "Автономни бизнес процеси с множество инструменти",
          ],
          en: [
            "Software engineering and code analysis",
            "Research and knowledge work",
            "Document and data analysis",
            "Autonomous business workflows with multiple tools",
          ],
        },
      },
      outcome: {
        heading: { bg: "Резултат", en: "Outcome" },
        body: {
          bg: [
            "Не използваме най-големия модел за всяка задача. Използваме правилната интелигентност за правилната работа.",
          ],
          en: [
            "We do not use the largest model for every task. We use the right intelligence for the right work.",
          ],
        },
      },
    },
    seo: {
      documentTitle: {
        bg: "Локална ИИ оркестрация с интелигентно използване на облака | ITT Digital Hub",
        en: "Local-First AI Orchestration with Selective Cloud Escalation | ITT Digital Hub",
      },
      description: {
        bg: "Хибридна ИИ архитектура, която по подразбиране работи локално и използва облака избирателно. Около 60-80% по-ниско използване на облачни токени при вътрешни натоварвания.",
        en: "A hybrid AI architecture that runs locally by default and uses the cloud selectively. Around 60-80% lower cloud token usage across internal workloads.",
      },
      ogTitle: {
        bg: "Локална ИИ оркестрация с интелигентно използване на облака",
        en: "Local-First AI Orchestration with Selective Cloud Escalation",
      },
      ogDescription: {
        bg: "Локалните модели вършат работата по подразбиране. Облакът се използва само когато добавя реална стойност.",
        en: "Local models handle the work by default. The cloud is used only when it adds real value.",
      },
      image: "/stories/local-orchestration-cover.webp",
    },
  },
];

export const featuredProject = projects.find((p) => p.featured) ?? projects[0]!;
