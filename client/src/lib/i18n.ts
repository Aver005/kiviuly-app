import { useApp, type Locale } from "@/store/app";

/**
 * All copy lives here, in two locales. `ru` is the source of truth; `en` is
 * type-checked against it so the structures can never drift apart.
 */

const ru = {
  nav: {
    brand: "KIVIULY",
    links: [
      { id: "manifest", label: "Манифест" },
      { id: "services", label: "Что делаем" },
      { id: "process", label: "Подход" },
      { id: "contact", label: "Контакт" },
    ],
    cta: "Обсудить проект",
    langLabel: "EN",
  },
  hero: {
    kicker: "Студия инженеров · с 2024",
    lineTop: "Мы строим",
    lineMid: "живые",
    lineBot: "системы",
    lead: "Маленькая дерзкая команда, что проектирует и собирает цельный софт — от первой искры идеи до системы, которая дышит в продакшене.",
    ctaPrimary: "Обсудить проект",
    ctaSecondary: "Что мы умеем",
    scroll: "листайте",
    coords: "59°56′ с.ш. · удалённо по всему миру",
  },
  manifesto: {
    kicker: "Манифест",
    quoteLead: "Мы знаем красоту",
    quoteAccent: "как точную инженерию",
    quoteTail: "— где сложное кажется простым, а каждая деталь стоит на своём месте.",
    body: "Kiviuly — это не фабрика фич. Мы относимся к коду как к ремеслу: проектируем системы, которые переживут свой первый релиз, и интерфейсы, в которые хочется возвращаться.",
  },
  services: {
    kicker: "01 — Что мы делаем",
    title: "Софт в разных плоскостях. Цельные системы, а не разрозненные куски.",
    items: [
      {
        n: "(а)",
        title: "Продукты и платформы",
        desc: "Веб-приложения, порталы, дашборды и внутренние системы, которые растут вместе с вами.",
        tags: ["Веб", "SaaS", "Дашборды"],
      },
      {
        n: "(б)",
        title: "Бэкенд и инфраструктура",
        desc: "API, базы данных, реалтайм и очереди. Архитектура, которой не страшна нагрузка.",
        tags: ["API", "Базы данных", "Realtime"],
      },
      {
        n: "(в)",
        title: "ИИ и автоматизация",
        desc: "LLM-агенты, пайплайны данных и интеграции, которые снимают рутину с людей.",
        tags: ["LLM-агенты", "Пайплайны", "Интеграции"],
      },
      {
        n: "(г)",
        title: "Интерфейсы и дизайн-системы",
        desc: "От прототипа до пиксель-перфекта. Дизайн, который работает, а не только красив.",
        tags: ["UI/UX", "Дизайн-системы", "Motion"],
      },
    ],
  },
  process: {
    kicker: "02 — Подход",
    title: "Четыре шага от искры до системы",
    steps: [
      { n: "01", title: "Разведка", desc: "Погружаемся в задачу, спорим, находим суть. Без брифов ради брифов." },
      { n: "02", title: "Архитектура", desc: "Проектируем скелет: данные, границы, контракты. Чертёж раньше бетона." },
      { n: "03", title: "Сборка", desc: "Пишем, тестируем, релизим маленькими шагами. Виден прогресс, а не обещания." },
      { n: "04", title: "Жизнь", desc: "Система растёт: метрики, поддержка, новые витки. Мы рядом." },
    ],
  },
  capabilities: {
    kicker: "03 — Инструменты",
    title: "Стек, которым мы говорим",
    stack: ["TypeScript", "Rust", "Go", "Bun", "React", "Postgres", "SQLite", "Docker", "Redis", "gRPC", "WebGL", "Motion", "Zod", "Kubernetes", "Python"],
    stats: [
      { value: "∞", label: "строк, которые не стыдно показать" },
      { value: "24/7", label: "система должна жить всегда" },
      { value: null, label: "обращений через эту форму" },
    ],
  },
  contact: {
    kicker: "04 — Контакт",
    titleTop: "Давайте",
    titleBot: "поговорим",
    lead: "Расскажите, что хотите построить. Ответим за пару дней — по-человечески, без воды.",
    labels: {
      name: "Как вас зовут",
      email: "Почта для ответа",
      company: "Компания (по желанию)",
      budget: "Масштаб задачи",
      message: "О проекте",
    },
    placeholders: {
      name: "Ваше имя",
      email: "you@example.com",
      company: "Название или ничего",
      message: "Пара слов о том, что задумали…",
    },
    budgets: {
      explore: "Прощупать идею",
      mvp: "MVP / прототип",
      product: "Продукт",
      platform: "Платформа",
    },
    optional: "необязательно",
    submit: "Отправить обращение",
    pow: {
      hint: "Перед отправкой браузер решит маленькую крипто-задачу — так мы ловим ботов без капчи.",
      fetching: "Получаем задачу…",
      solving: "Доказываем, что вы человек…",
      submitting: "Отправляем сигнал…",
      solved: "Доказательство найдено",
      attempts: "попыток",
      rate: "хеш/с",
      bits: "нулевых бит",
    },
    success: {
      title: "Сигнал принят",
      body: "Обращение {ref} у нас. Скоро напишем на {email}.",
      again: "Отправить ещё одно",
    },
    errors: {
      network: "Что-то пошло не так. Попробуйте ещё раз.",
      rate_limited: "Слишком часто. Передохните минутку и повторите.",
      validation: "Проверьте поля формы.",
      pow: "Проверка не прошла. Обновите страницу и попробуйте снова.",
    },
  },
  fields: {
    name: { min: "Минимум 2 символа", max: "Слишком длинно" },
    email: { email: "Похоже на опечатку в почте", max: "Слишком длинно" },
    company: { max: "Слишком длинно" },
    message: { min: "Хотя бы пара предложений", max: "Максимум 2000 символов" },
  } as Record<string, Record<string, string>>,
  footer: {
    word: "KIVIULY",
    tagline: "Студия, что строит системы.",
    nav: "Навигация",
    contacts: "Контакты",
    email: "hello@kiviuly.studio",
    social: "Сети",
    copyright: "© 2026 Kiviuly. Сделано с одержимостью.",
    back: "Наверх",
  },
};

type Dict = typeof ru;

const en: Dict = {
  nav: {
    brand: "KIVIULY",
    links: [
      { id: "manifest", label: "Manifesto" },
      { id: "services", label: "What we do" },
      { id: "process", label: "Approach" },
      { id: "contact", label: "Contact" },
    ],
    cta: "Start a project",
    langLabel: "RU",
  },
  hero: {
    kicker: "An engineering studio · since 2024",
    lineTop: "We build",
    lineMid: "living",
    lineBot: "systems",
    lead: "A small, audacious team that designs and ships whole software — from the first spark of an idea to a system that breathes in production.",
    ctaPrimary: "Start a project",
    ctaSecondary: "See what we do",
    scroll: "scroll",
    coords: "59°56′ N · remote, worldwide",
  },
  manifesto: {
    kicker: "Manifesto",
    quoteLead: "We know beauty",
    quoteAccent: "as precise engineering",
    quoteTail: "— where the complex feels simple and every detail sits exactly where it should.",
    body: "Kiviuly is not a feature factory. We treat code as craft: we design systems that outlive their first release, and interfaces worth coming back to.",
  },
  services: {
    kicker: "01 — What we do",
    title: "Software across planes. Whole systems, not scattered pieces.",
    items: [
      {
        n: "(a)",
        title: "Products & platforms",
        desc: "Web apps, portals, dashboards and internal systems that scale as you grow.",
        tags: ["Web", "SaaS", "Dashboards"],
      },
      {
        n: "(b)",
        title: "Backend & infrastructure",
        desc: "APIs, databases, realtime and queues. Architecture that isn't afraid of load.",
        tags: ["API", "Databases", "Realtime"],
      },
      {
        n: "(c)",
        title: "AI & automation",
        desc: "LLM agents, data pipelines and integrations that take routine off people.",
        tags: ["LLM agents", "Pipelines", "Integrations"],
      },
      {
        n: "(d)",
        title: "Interfaces & design systems",
        desc: "From prototype to pixel-perfect. Design that works, not just looks pretty.",
        tags: ["UI/UX", "Design systems", "Motion"],
      },
    ],
  },
  process: {
    kicker: "02 — Approach",
    title: "Four steps from spark to system",
    steps: [
      { n: "01", title: "Recon", desc: "We dive in, argue, find the essence. No briefs for the sake of briefs." },
      { n: "02", title: "Architecture", desc: "We design the skeleton: data, boundaries, contracts. Blueprint before concrete." },
      { n: "03", title: "Build", desc: "We write, test and ship in small steps. Progress you can see, not promises." },
      { n: "04", title: "Life", desc: "The system grows: metrics, support, new loops. We stay close." },
    ],
  },
  capabilities: {
    kicker: "03 — Tooling",
    title: "The stack we speak in",
    stack: ["TypeScript", "Rust", "Go", "Bun", "React", "Postgres", "SQLite", "Docker", "Redis", "gRPC", "WebGL", "Motion", "Zod", "Kubernetes", "Python"],
    stats: [
      { value: "∞", label: "lines we're not ashamed to show" },
      { value: "24/7", label: "a system should always live" },
      { value: null, label: "messages through this form" },
    ],
  },
  contact: {
    kicker: "04 — Contact",
    titleTop: "Let's",
    titleBot: "talk",
    lead: "Tell us what you want to build. We answer within a couple of days — like humans, no fluff.",
    labels: {
      name: "Your name",
      email: "Email for the reply",
      company: "Company (optional)",
      budget: "Scope",
      message: "About the project",
    },
    placeholders: {
      name: "Your name",
      email: "you@example.com",
      company: "Name or nothing",
      message: "A few words about what you have in mind…",
    },
    budgets: {
      explore: "Explore an idea",
      mvp: "MVP / prototype",
      product: "Product",
      platform: "Platform",
    },
    optional: "optional",
    submit: "Send the message",
    pow: {
      hint: "Before sending, your browser solves a tiny crypto puzzle — that's how we catch bots without a captcha.",
      fetching: "Fetching a challenge…",
      solving: "Proving you're human…",
      submitting: "Sending the signal…",
      solved: "Proof found",
      attempts: "attempts",
      rate: "hash/s",
      bits: "leading zero bits",
    },
    success: {
      title: "Signal received",
      body: "Message {ref} is with us. We'll write to {email} soon.",
      again: "Send another one",
    },
    errors: {
      network: "Something went wrong. Please try again.",
      rate_limited: "Too often. Take a minute and retry.",
      validation: "Please check the form fields.",
      pow: "The check failed. Refresh the page and try again.",
    },
  },
  fields: {
    name: { min: "At least 2 characters", max: "Too long" },
    email: { email: "Looks like a typo in the email", max: "Too long" },
    company: { max: "Too long" },
    message: { min: "At least a sentence or two", max: "Max 2000 characters" },
  },
  footer: {
    word: "KIVIULY",
    tagline: "A studio that builds systems.",
    nav: "Navigation",
    contacts: "Contacts",
    email: "hello@kiviuly.studio",
    social: "Social",
    copyright: "© 2026 Kiviuly. Made with obsession.",
    back: "Back to top",
  },
};

export const dictionaries: Record<Locale, Dict> = { ru, en };
export type { Dict };

/** Active dictionary for the current locale. Re-renders on locale change. */
export function useT(): Dict {
  const locale = useApp((s) => s.locale);
  return dictionaries[locale];
}

/** Localized field-error lookup used by the contact form. */
export function fieldError(locale: Locale, field: string, code: string): string {
  return dictionaries[locale].fields[field]?.[code] ?? dictionaries[locale].contact.errors.validation;
}
