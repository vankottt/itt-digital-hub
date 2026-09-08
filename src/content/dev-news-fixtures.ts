import { DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX, devNewsFixturePhotos } from "./media";
import type { Insight } from "./types";

/**
 * Fictional editorial examples shown on the public News surface.
 * Not confirmed CIT news, completed research, real events, partnerships
 * or measured results. Overlay until an editor saves them from /admin.
 * Confirmed seed (`src/content/insights.ts` / `seedStore`) stays UASG-only.
 */

export const DEV_NEWS_FIXTURE_INSIGHT_ID_PREFIX = "insight-dev-fixture-";

export const DEV_NEWS_FIXTURE_SOURCE = {
  bg: "Демонстрационна фикстура за разработка. Не е потвърдена новина на Центъра и не описва реално събитие, партньорство или измерен резултат.",
  en: "Development demonstration fixture. This is not confirmed Center news and does not describe a real event, partnership or measured result.",
} as const;

export const DEV_NEWS_FIXTURE_SLUGS = [
  "data-for-a-more-resilient-black-sea",
  "from-classroom-to-real-world-systems",
  "wine-tourism-and-regional-value",
] as const;

const WINE_TOURISM_VIDEO = "https://www.youtube.com/watch?v=kuGllDpI0Y0";

export type DevNewsFixtureSlug = (typeof DEV_NEWS_FIXTURE_SLUGS)[number];

export function isDevNewsFixtureSlug(slug: string): boolean {
  return (DEV_NEWS_FIXTURE_SLUGS as readonly string[]).includes(slug);
}

export function isDevNewsFixtureInsightId(id: string): boolean {
  return id.startsWith(DEV_NEWS_FIXTURE_INSIGHT_ID_PREFIX);
}

export function isDevNewsFixtureMediaId(id: string): boolean {
  return id.startsWith(DEV_NEWS_FIXTURE_MEDIA_ID_PREFIX);
}

export const devNewsFixtures: Insight[] = [
  {
    slug: "data-for-a-more-resilient-black-sea",
    type: "news",
    devFixture: true,
    date: "2026-03-12",
    heroMediaId: devNewsFixturePhotos.coastalWaterSampling.id,
    title: {
      bg: "Данни за по-устойчиво Черноморие",
      en: "Data for a More Resilient Black Sea",
    },
    summary: {
      bg: "Как наблюдението на крайбрежната среда, системният анализ и свързването на различни източници на данни могат да подпомогнат по-добрите решения за развитието на Черноморските региони.",
      en: "How environmental monitoring, systems analysis and connected data sources can support better decisions for the development of Black Sea regions.",
    },
    body: {
      bg: [
        "Крайбрежните територии са пример за система, в която природни процеси, инфраструктура, туризъм, градско развитие и икономическа активност се влияят взаимно. Промените в една част от тази система често създават ефекти далеч извън първоначалния проблем.",
        "Затова устойчивото управление на крайбрежието изисква повече от отделни измервания. Необходимо е данните за вода, климат, земеползване, инфраструктура, туристически потоци и местна икономика да бъдат разглеждани като части от обща система.",
        "Една такава рамка може да започне с наблюдение на конкретни показатели и постепенно да ги свърже със системна карта на участниците, процесите и решенията. Това позволява да се проследи не само какво се случва, но и къде възникват зависимости, забавяния и потенциални точки за намеса.",
        "AI и автоматизираната обработка на данни могат да подпомогнат тази работа чрез откриване на модели, комбиниране на разнородни източници и ранно идентифициране на отклонения. Човешката експертиза обаче остава ключова за интерпретацията на резултатите и за превръщането им в реални управленски решения.",
        "Подобен подход би могъл да бъде използван за изследване на крайбрежни общини, инфраструктурни системи и туристически региони, когато има достатъчно надеждни данни и ясно дефиниран практически проблем.",
        "За Центъра това е пример за типа приложни задачи, при които системният анализ, данните и интелигентните технологии могат да бъдат комбинирани в общ изследователски и практически процес.",
      ],
      en: [
        "Coastal regions are a clear example of systems in which natural processes, infrastructure, tourism, urban development and economic activity continuously influence one another. A change in one part of the system can often create effects far beyond the original issue.",
        "For this reason, resilient coastal management requires more than isolated measurements. Data on water quality, climate, land use, infrastructure, visitor flows and local economic activity need to be understood as parts of a connected system.",
        "Such an approach can begin with monitoring specific indicators and gradually connect them to a wider system map of actors, processes and decision points. This makes it possible to examine not only what is happening, but also where dependencies, delays and potential intervention points emerge.",
        "AI and automated data processing can support this work by identifying patterns, combining heterogeneous sources and detecting anomalies earlier. Human expertise, however, remains essential for interpreting the evidence and turning it into meaningful decisions.",
        "A similar framework could be applied to coastal municipalities, infrastructure systems and tourism regions where reliable data and a clearly defined practical problem are available.",
        "For the Center, this illustrates the type of applied challenge in which systems analysis, data and intelligent technologies can become part of one integrated research and implementation process.",
      ],
    },
    topics: {
      bg: ["Черноморие", "Данни", "Крайбрежни системи"],
      en: ["Black Sea", "Data", "Coastal systems"],
    },
    source: {
      bg: DEV_NEWS_FIXTURE_SOURCE.bg,
      en: DEV_NEWS_FIXTURE_SOURCE.en,
    },
  },
  {
    slug: "from-classroom-to-real-world-systems",
    type: "news",
    devFixture: true,
    date: "2026-02-28",
    heroMediaId: devNewsFixturePhotos.coastalResilienceClassroom.id,
    title: {
      bg: "От аудиторията към реалните системи",
      en: "From the Classroom to Real-World Systems",
    },
    summary: {
      bg: "Как обучението може да свърже теорията, данните и реалните обществени предизвикателства чрез работа върху конкретни системи и практически казуси.",
      en: "How education can connect theory, data and real societal challenges through practical work on complex systems and applied cases.",
    },
    body: {
      bg: [
        "Една от възможните роли на Центъра за интелигентни технологии е да създаде по-пряка връзка между академичното знание и проблемите, с които институции, бизнес и обществото се сблъскват ежедневно.",
        "Вместо обучението да приключва с усвояване на отделни методи, студентите могат да работят върху реални системи: градска мобилност, водна инфраструктура, регионален туризъм, административни процеси или управление на ресурси.",
        "Работата може да започне с формулиране на проблем, след което да премине през събиране на данни, идентифициране на участниците, картографиране на процесите и анализ на местата, в които системата не постига желаните резултати.",
        "Този модел позволява различни дисциплини да работят върху един и същ проблем. Инженерният анализ може да се комбинира с икономика, управление, поведенчески науки, статистика и AI, без една от тях да бъде представяна като универсално решение.",
        "Ролята на интелигентните технологии е практична: обработване на документи, анализ на данни, подпомагане на изследването, моделиране на сценарии и автоматизиране на повтаряеми задачи. Крайните решения обаче трябва да остават разбираеми, проверими и под човешки контрол.",
        "Подобен подход превръща обучението в среда за приложно изследване. Студентите не просто изучават системите, а се учат да ги описват, анализират, тестват и подобряват.",
      ],
      en: [
        "One potential role of the Center for Intelligent Technologies is to create a stronger connection between academic knowledge and the problems that institutions, businesses and society face in practice.",
        "Instead of ending with the study of individual methods, education can involve work on real systems: urban mobility, water infrastructure, regional tourism, administrative processes or resource management.",
        "The process can begin by defining a problem and then move through data collection, stakeholder identification, process mapping and analysis of the points where the system fails to achieve the intended outcomes.",
        "This model also makes it possible for different disciplines to work on the same challenge. Engineering analysis can be combined with economics, governance, behavioural science, statistics and AI without treating any one discipline as a universal solution.",
        "The role of intelligent technologies is practical: processing documents, analysing data, supporting research, modelling scenarios and automating repetitive tasks. Final decisions, however, should remain understandable, testable and under human oversight.",
        "This approach turns education into an environment for applied research. Students do not simply study systems; they learn how to describe, analyse, test and improve them.",
      ],
    },
    topics: {
      bg: ["Обучение", "Приложни казуси", "Системен анализ"],
      en: ["Education", "Applied cases", "Systems analysis"],
    },
    source: {
      bg: DEV_NEWS_FIXTURE_SOURCE.bg,
      en: DEV_NEWS_FIXTURE_SOURCE.en,
    },
  },
  {
    slug: "wine-tourism-and-regional-value",
    type: "news",
    devFixture: true,
    date: "2026-02-15",
    heroMediaId: devNewsFixturePhotos.goldenHourVineyard.id,
    title: {
      bg: "Вино, туризъм и регионална стойност",
      en: "Wine, Tourism and Regional Value",
    },
    summary: {
      bg: "Как свързването на винопроизводство, туризъм, местна идентичност и данни може да бъде изследвано като една обща регионална система.",
      en: "How wine production, tourism, local identity and data can be examined as one connected regional system.",
    },
    body: {
      bg: [
        "Българското вино и българският туризъм обикновено се разглеждат като отделни отрасли. Но от гледна точка на системния анализ те са част от много по-широка мрежа от производители, туристически услуги, местни общности, инфраструктура, културно наследство и регионални пазари.",
        "Именно тази взаимосвързаност стои в основата на пилотната концепция „Българско вино × Български туризъм“.",
        "Целта не е просто да се създаде още един туристически продукт. По-интересният въпрос е как изглежда цялата система: как посетителят открива даден регион, как избира място за посещение, как местните производители достигат до него, как информацията се движи между участниците и къде се губи потенциална стойност.",
        "ASAESIS позволява подобен казус да бъде разгледан последователно — чрез карта на системата, процесите и участниците, анализ на слабите места, формулиране на целева архитектура и определяне на измерими показатели.",
        WINE_TOURISM_VIDEO,
        "Данните и AI могат да имат конкретна роля в този процес: анализ на туристическо търсене, структуриране на информация за производители и маршрути, персонализирани препоръки, подпомагане на съдържанието и наблюдение на ключови показатели.",
        "Но технологията е само част от решението. Устойчивият резултат зависи от това дали стимулите, процесите и ролите в системата са подредени така, че да създават стойност едновременно за посетителите, местния бизнес и регионите.",
        "Пилотната концепция е възможност методологията да бъде тествана върху реален секторен проблем и постепенно да се превърне в модел, който може да бъде адаптиран и към други области.",
      ],
      en: [
        "Bulgarian wine and Bulgarian tourism are often treated as separate sectors. From a systems perspective, however, they are part of a much broader network of producers, tourism services, local communities, infrastructure, cultural heritage and regional markets.",
        "This interconnectedness is at the heart of the Bulgarian Wine × Bulgarian Tourism pilot concept.",
        "The objective is not simply to create another tourism product. The more interesting question is how the complete system works: how visitors discover a region, how they choose where to go, how local producers reach them, how information moves between participants and where potential value is lost.",
        "ASAESIS provides a way to examine such a challenge systematically — through system and stakeholder mapping, process analysis, identification of failure points, development of a target architecture and definition of measurable indicators.",
        WINE_TOURISM_VIDEO,
        "Data and AI can play a practical role in this process: analysing tourism demand, structuring information about producers and routes, supporting personalised recommendations, assisting content creation and monitoring key indicators.",
        "Technology, however, is only one part of the solution. Sustainable outcomes depend on whether incentives, processes and roles across the system are aligned in a way that creates value for visitors, local businesses and regions at the same time.",
        "The pilot concept provides an opportunity to test the methodology on a real sectoral challenge and gradually develop an approach that can later be adapted to other domains.",
      ],
    },
    topics: {
      bg: ["Вино", "Туризъм", "Регионални системи"],
      en: ["Wine", "Tourism", "Regional systems"],
    },
    source: {
      bg: DEV_NEWS_FIXTURE_SOURCE.bg,
      en: DEV_NEWS_FIXTURE_SOURCE.en,
    },
  },
];
