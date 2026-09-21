import type { L } from "@/lib/i18n";
import type { AgentKitFileId } from "@/lib/ai-act/types";

export const aiActAgent = {
  meta: {
    title: { bg: "AI Act асистент", en: "AI Act assistant" },
    description: {
      bg: "Безплатен практически AI Act асистент за проектантски и инженерни екипи. Без юридически език и без нужда от опит с изкуствен интелект.",
      en: "A free, practical AI Act assistant for design and engineering teams. No legal jargon and no AI experience required.",
    },
  },
  useMeta: {
    title: { bg: "Ползвайте AI Act асистента", en: "Use the AI Act assistant" },
    description: {
      bg: "Задайте въпрос за реална работна ситуация и вижте как AI Act засяга работата ви.",
      en: "Ask about a real work situation and see how the AI Act affects your work.",
    },
  },
  buildMeta: {
    title: { bg: "Направете свой AI Act асистент", en: "Build your own AI Act assistant" },
    description: {
      bg: "Вижте от какво е направен асистентът и как да създадете свой вариант.",
      en: "See what the assistant is made of and how to create your own version.",
    },
  },
  provenance: { bg: "Практически ресурс от ITT Digital Hub", en: "A practical resource from ITT Digital Hub" },
  headline: { bg: "Разберете как AI Act засяга работата ви.", en: "Understand how the AI Act affects your work." },
  support: {
    bg: "Без юридически език. Без нужда от опит с изкуствен интелект.",
    en: "No legal jargon. No AI experience needed.",
  },
  descriptor: {
    bg: "Безплатен практически AI Act асистент за проектантски и инженерни екипи.",
    en: "A free, practical AI Act assistant for design and engineering teams.",
  },
  concept: { bg: "Ползвайте готовия. Или вижте как да изградите свой.", en: "Use the one that’s ready. Or see how to build your own." },
  backToChoice: { bg: "Към избора", en: "Back to the choice" },
  paths: {
    use: {
      title: { bg: "Искам да го ползвам", en: "I want to use it" },
      lead: {
        bg: "Задайте въпрос за реална работна ситуация.",
        en: "Ask about a real situation from your work.",
      },
      hint: { bg: "Готовият асистент", en: "The hosted assistant" },
    },
    build: {
      title: { bg: "Искам да си направя мой", en: "I want to make my own" },
      lead: {
        bg: "Вижте как се сглобява и създайте свой вариант.",
        en: "See how it is assembled and create your own version.",
      },
      hint: { bg: "Отворен комплект", en: "Open kit" },
    },
  },
  chat: {
    title: { bg: "AI Act асистент", en: "AI Act assistant" },
    empty: {
      bg: "Опишете ситуация от работата си. Например колко сте, какви инструменти ползвате и какво ви трябва да разберете.",
      en: "Describe a situation from your work. For example how many people you are, which tools you use, and what you need to understand.",
    },
    placeholder: { bg: "Опишете работната ситуация…", en: "Describe the work situation…" },
    send: { bg: "Изпрати", en: "Send" },
    sending: { bg: "Изпращане", en: "Sending" },
    generating: { bg: "Подготвя отговор…", en: "Preparing a reply…" },
    retry: { bg: "Опитайте отново", en: "Try again" },
    you: { bg: "Вие", en: "You" },
    assistant: { bg: "Асистент", en: "Assistant" },
    startersLabel: { bg: "Можете да започнете с", en: "You can start with" },
    remaining: {
      two: { bg: "Задайте до 2 въпроса без регистрация.", en: "Ask up to 2 questions without registration." },
      one: { bg: "Още един въпрос, после кратко представяне.", en: "One more question, then a short introduction." },
      none: { bg: "За да продължите, кажете ни с кого разговаряме.", en: "To continue, tell us who we are speaking with." },
      open: { bg: "Можете да продължите разговора.", en: "You can continue the conversation." },
    },
    notice: {
      bg: "При използваната конфигурация въведеното съдържание може да бъде използвано от AI доставчика за подобряване на услугите му. Не споделяйте лична, поверителна или чувствителна информация.",
      en: "With the configuration in use, entered content may be used by the AI provider to improve its services. Do not share personal, confidential or sensitive information.",
    },
    errors: {
      not_configured: {
        bg: "Асистентът още не е свързан към модела. Въпросът ви е запазен. Опитайте отново след малко.",
        en: "The assistant is not connected to a model yet. Your question is kept. Please try again in a moment.",
      },
      not_implemented: {
        bg: "Асистентът още не е свързан към модела. Въпросът ви е запазен. Опитайте отново след малко.",
        en: "The assistant is not connected to a model yet. Your question is kept. Please try again in a moment.",
      },
      rate_limited: {
        bg: "Временно има твърде много въпроси. Изчакайте малко и опитайте отново.",
        en: "There are too many questions right now. Please wait a moment and try again.",
      },
      provider_error: {
        bg: "Не успяхме да получим отговор. Опитайте отново.",
        en: "We could not get a reply. Please try again.",
      },
      timeout: {
        bg: "Отговорът отне твърде дълго. Въпросът ви е запазен. Опитайте отново.",
        en: "The reply took too long. Your question is kept. Please try again.",
      },
      network: {
        bg: "Няма връзка в момента. Въпросът ви е запазен. Опитайте отново.",
        en: "There is no connection right now. Your question is kept. Please try again.",
      },
      invalid: {
        bg: "Въпросът не може да бъде изпратен в този вид. Съкратете текста и опитайте отново.",
        en: "This question cannot be sent as it is. Shorten the text and try again.",
      },
      lead_required: {
        bg: "За да продължите, попълнете кратките данни по-долу.",
        en: "To continue, fill in the short details below.",
      },
      kit_not_ready: {
        bg: "Изтеглянето не успя. Опитайте отново.",
        en: "The download did not work. Please try again.",
      },
      generic: {
        bg: "Нещо се обърка. Опитайте отново.",
        en: "Something went wrong. Please try again.",
      },
    },
    starters: [
      {
        bg: "Имаме 7 служители и използваме ChatGPT. Какво трябва да направим?",
        en: "We have 7 employees and use ChatGPT. What do we need to do?",
      },
      {
        bg: "Какво означава член 4 за нашата фирма?",
        en: "What does Article 4 mean for our firm?",
      },
      {
        bg: "Мога ли да качвам проектна документация в ChatGPT?",
        en: "Can I upload project documentation to ChatGPT?",
      },
      {
        bg: "Трябва ли да имаме вътрешни правила за използване на AI?",
        en: "Do we need internal rules for using AI?",
      },
    ] satisfies Array<L>,
  },
  lead: {
    chatTitle: { bg: "Продължете разговора", en: "Continue the conversation" },
    chatBody: {
      bg: "След два въпроса искаме име, служебен имейл, фирма и роля. Така разбираме кои екипи имат полза от асистента. Не е условие за подаръка и не е продажба в този момент.",
      en: "After two questions we ask for a name, work email, company and role. That helps us see which teams the assistant is useful for. It is not a condition of the gift and not a sales step at this point.",
    },
    downloadTitle: { bg: "Преди изтеглянето", en: "Before the download" },
    downloadBody: {
      bg: "За да получите комплекта, кажете ни с кого разговаряме. Същите данни важат и за асистента, ако вече сте ги попълнили.",
      en: "To receive the kit, tell us who we are speaking with. The same details apply to the assistant if you have already provided them.",
    },
    name: { bg: "Име", en: "Name" },
    email: { bg: "Служебен имейл", en: "Work email" },
    company: { bg: "Компания", en: "Company" },
    role: { bg: "Роля", en: "Role" },
    consent: {
      bg: "Искам понякога да получавам полезни материали от ITT Digital Hub. Не е задължително, за да продължа.",
      en: "I would like to receive occasional useful material from ITT Digital Hub. This is not required to continue.",
    },
    submit: { bg: "Продължете", en: "Continue" },
    submitting: { bg: "Запазване…", en: "Saving…" },
    invalid: { bg: "Попълнете име, служебен имейл, компания и роля.", en: "Please fill in name, work email, company and role." },
    error: { bg: "Не успяхме да приемем данните. Опитайте отново.", en: "We could not accept the details. Please try again." },
    thanks: { bg: "Благодарим. Можете да продължите.", en: "Thank you. You can continue." },
  },
  build: {
    kicker: { bg: "Как се изгражда", en: "How it is built" },
    step1: {
      label: { bg: "Стъпка 1", en: "Step 1" },
      title: { bg: "Какво ще изградим?", en: "What will we build?" },
      lead: {
        bg: "Полезният асистент не е чат с един дълъг текст. Съчетава няколко части, които заедно държат задачата, източниците и проверката.",
        en: "A useful assistant is not a chat with one long piece of text. It combines several parts that together hold the task, the sources and the checks.",
      },
      result: { bg: "Вашият AI Act асистент", en: "Your AI Act assistant" },
      parts: [
        {
          title: { bg: "Системни инструкции", en: "System instructions" },
          body: { bg: "Как да се държи и на какъв език да обяснява.", en: "How it should behave and how it should explain." },
        },
        {
          title: { bg: "Надеждни източници", en: "Trusted sources" },
          body: { bg: "Документите, на които може да се опира, вместо да попълва от общо знание.", en: "The documents it can rely on, instead of filling gaps from general knowledge." },
        },
        {
          title: { bg: "Контекст на работата", en: "Domain context" },
          body: { bg: "За кого е: проектантски и инженерни екипи, често ВиК.", en: "Who it is for: design and engineering teams, often water and HVAC." },
        },
        {
          title: { bg: "Правила за поведение", en: "Behaviour rules" },
          body: { bg: "Какво може да каже, какво трябва да откаже и кога да попита.", en: "What it may say, what it must refuse, and when it should ask." },
        },
        {
          title: { bg: "Проверки", en: "Validation tests" },
          body: { bg: "Въпроси, с които се вижда дали наистина работи както трябва.", en: "Questions that show whether it actually behaves as intended." },
        },
      ],
    },
    step2: {
      label: { bg: "Стъпка 2", en: "Step 2" },
      title: { bg: "От какво е направен?", en: "What is it made of?" },
      heading: { bg: "Няма черна кутия.", en: "There is no black box." },
      lead: {
        bg: "Можете да видите инструкциите, източниците и тестовете, с които работи.",
        en: "You can see the instructions, sources and tests it works with.",
      },
      files: {
        readme: {
          title: { bg: "Откъде да започнете", en: "Where to start" },
          body: { bg: "Кратко обяснение на комплекта на нормален език.", en: "A short explanation of the kit in plain language." },
        },
        installer: {
          title: { bg: "Как да го дадете на ChatGPT", en: "How to give it to ChatGPT" },
          body: { bg: "Текстът, който казва на ChatGPT да следва пакета, а не да измисля свой.", en: "The text that tells ChatGPT to follow the package instead of inventing its own." },
        },
        system: {
          title: { bg: "Как да се държи", en: "How it should behave" },
          body: { bg: "Инструкциите, които държат асистента в ролята му.", en: "The instructions that keep the assistant in its role." },
        },
        config: {
          title: { bg: "Обхват и ограничения", en: "Scope and limits" },
          body: { bg: "За кого е, какво не прави и кога трябва да спре.", en: "Who it is for, what it does not do, and when it should stop." },
        },
        tests: {
          title: { bg: "Как да го проверите", en: "How to check it" },
          body: { bg: "Примерни въпроси и критерии, не заучен отговор.", en: "Sample questions and criteria, not a memorised answer." },
        },
        version: {
          title: { bg: "Коя е тази версия", en: "Which version this is" },
          body: { bg: "Маркер на комплекта, за да знаете с какво работите.", en: "A marker for the kit, so you know what you are working with." },
        },
        sources: {
          title: { bg: "Надеждните източници", en: "The trusted sources" },
          body: { bg: "Папка с официалните документи, на които асистентът трябва да се опира.", en: "A folder of official documents the assistant should rely on." },
        },
      } satisfies Record<AgentKitFileId, { title: L; body: L }>,
    },
    step3: {
      label: { bg: "Стъпка 3", en: "Step 3" },
      title: { bg: "Вземете комплекта", en: "Take the kit" },
      lead: {
        bg: "Пълният пакет е файловете по-горе в един архив. Изтеглянето използва същите данни като асистента, ако вече сте ги дали.",
        en: "The full package is the files above in one archive. The download uses the same details as the assistant if you have already given them.",
      },
      download: { bg: "Изтеглете комплекта", en: "Download the kit" },
      downloading: { bg: "Подготовка…", en: "Preparing…" },
      downloaded: { bg: "Комплектът е изтеглен. Продължете със стъпките по-долу.", en: "The kit has been downloaded. Continue with the steps below." },
      readyNote: {
        bg: "Данните са попълнени. Изтеглете комплекта и следвайте стъпките по-долу.",
        en: "Your details are in place. Download the kit and follow the steps below.",
      },
    },
    step4: {
      label: { bg: "Стъпка 4", en: "Step 4" },
      title: { bg: "Отворете ChatGPT", en: "Open ChatGPT" },
      lead: {
        bg: "Следващите стъпки са при вас. Сайтът не управлява вашия ChatGPT акаунт.",
        en: "The next steps happen on your side. This website does not control your ChatGPT account.",
      },
      steps: [
        { bg: "Отворете ChatGPT.", en: "Open ChatGPT." },
        { bg: "Дайте му комплекта.", en: "Give it the kit." },
        { bg: "Кажете му да създаде асистента по пакета.", en: "Tell it to create the assistant from the package." },
        { bg: "Оставете инструкциите и файловете да водят настройката.", en: "Let the instructions and files guide the setup." },
      ],
      promptLabel: { bg: "Текст за ChatGPT", en: "Text for ChatGPT" },
      copy: { bg: "Копирайте", en: "Copy" },
      copied: { bg: "Копирано", en: "Copied" },
    },
    step5: {
      label: { bg: "Стъпка 5", en: "Step 5" },
      title: { bg: "Вижте как се сглобява", en: "See how it is assembled" },
      lead: {
        bg: "Това е идеята на сглобяването при вас. Не е отдалечено управление на ChatGPT.",
        en: "This is the assembly idea on your side. It is not remote control of ChatGPT.",
      },
      stages: [
        { bg: "Източници", en: "Sources" },
        { bg: "Инструкции", en: "Instructions" },
        { bg: "Поведение", en: "Behaviour" },
        { bg: "Тестове", en: "Tests" },
      ],
      result: { bg: "AI Act асистент", en: "AI Act Assistant" },
    },
    step6: {
      label: { bg: "Стъпка 6", en: "Step 6" },
      title: { bg: "Проверете дали работи", en: "Check whether it works" },
      lead: {
        bg: "Не търсете заучен отговор. Гледайте дали асистентът се държи както трябва.",
        en: "Do not look for a memorised answer. Watch whether the assistant behaves as it should.",
      },
      questionLabel: { bg: "Примерен въпрос", en: "Sample question" },
      question: {
        bg: "Ние сме ВиК проектантска фирма със 7 служители. Използваме ChatGPT за текстове, справки и част от документацията. Какво означава член 4 за нас?",
        en: "We are a building-services design firm with 7 employees. We use ChatGPT for text, lookups and some documentation. What does Article 4 mean for us?",
      },
      copyTest: { bg: "Копирайте теста", en: "Copy the test" },
      criteriaLabel: { bg: "Какво трябва да прави добрият отговор", en: "What a good reply should do" },
      criteria: [
        { bg: "използва надеждни източници;", en: "uses trusted sources;" },
        { bg: "различава законово задължение от препоръка;", en: "distinguishes a legal duty from a recommendation;" },
        { bg: "не измисля изисквания;", en: "does not invent requirements;" },
        { bg: "обяснява практически;", en: "explains in practical terms;" },
        { bg: "посочва ограниченията си;", en: "states its limits;" },
        { bg: "търси допълнителен контекст, когато е необходим.", en: "asks for more context when it is needed." },
      ],
    },
    completion: {
      title: { bg: "Вие създадохте AI агент.", en: "You have created an AI agent." },
      lead: {
        bg: "Не просто чат с дълъг промпт, а система със задача, източници, инструкции, ограничения и тестове.",
        en: "Not just a chat with a long prompt, but a system with a task, sources, instructions, limits and tests.",
      },
      chain: [
        { bg: "Контекст", en: "Context" },
        { bg: "Инструкции", en: "Instructions" },
        { bg: "Знание", en: "Knowledge" },
        { bg: "Разсъждение", en: "Reasoning" },
        { bg: "Проверка", en: "Validation" },
      ],
      principle: {
        bg: "Това е принципът, по който ITT Digital Hub изгражда специализирани AI системи около реални бизнес процеси.",
        en: "This is the principle ITT Digital Hub uses to build specialised AI systems around real business processes.",
      },
    },
    next: {
      label: { bg: "Какво следва", en: "What next" },
      title: { bg: "От този комплект към вашата работа", en: "From this kit to your work" },
      items: [
        {
          title: { bg: "Добавете организацията си", en: "Add your organisation" },
          body: { bg: "Вътрешен контекст, правила и политики за ползване на AI.", en: "Internal context, rules and AI-use policies." },
        },
        {
          title: { bg: "Добавете знанието си", en: "Add your knowledge" },
          body: { bg: "Стандарти, процедури, вътрешни документи и експертиза.", en: "Standards, procedures, internal documents and expertise." },
        },
        {
          title: { bg: "Свържете системите си", en: "Connect your systems" },
          body: { bg: "Връзка на AI с реални работни потоци и бизнес системи.", en: "Connect AI with actual workflows and business systems." },
        },
      ],
      ctaLead: {
        bg: "Искате да приложите подобен подход във вашата организация?",
        en: "Want to apply a similar approach in your organisation?",
      },
      cta: { bg: "Обсъдете го с нас", en: "Discuss it with us" },
    },
  },
  buildGame: {
    progress: { bg: "Ниво", en: "Level" },
    levels: [
      { bg: "Състав", en: "Compose" },
      { bg: "Комплект", en: "Kit" },
      { bg: "Изтегляне", en: "Download" },
      { bg: "ChatGPT", en: "ChatGPT" },
      { bg: "Сглобяване", en: "Assembly" },
      { bg: "Тест", en: "Test" },
    ] satisfies L[],
    rewards: [
      { bg: "Разбрахте анатомията на агента", en: "You understand the agent’s anatomy" },
      { bg: "Събрахте всички части", en: "You collected all the parts" },
      { bg: "Комплектът е ваш", en: "The kit is yours" },
      { bg: "Готови за сглобяване", en: "Ready for assembly" },
      { bg: "Агентът е сглобен", en: "The agent is assembled" },
      { bg: "Мисията е изпълнена", en: "Mission complete" },
    ] satisfies L[],
    collected: { bg: "събрано", en: "collected" },
    completion: { bg: "Агентът е активен", en: "The agent is live" },
    hero: {
      badge: { bg: "Ниво 1", en: "Level 1" },
      title: { bg: "Създай своя AI агент", en: "Build your own AI agent" },
      subtitle: { bg: "Конструктор на агенти", en: "Agent constructor" },
      start: { bg: "Започни мисията", en: "Start the mission" },
      kit: { bg: "Виж комплекта", en: "View the kit" },
      progress: { bg: "Прогрес", en: "Progress" },
    },
  },
} as const;
