import type { LucideIcon } from "lucide-react";
import {
  Activity,
  BookOpen,
  Brain,
  ClipboardList,
  FileBadge,
  FlaskConical,
  GraduationCap,
  Laptop,
  Lock,
  School,
  Shield,
  ShieldCheck,
  Users,
} from "lucide-react";
import { MENTOR_MODES, type MentorModeId } from "@/lib/ai/mentor-ui/modes";

/** Маркетинговые якоря главной (синхрон с nav-config). */
export const LANDING_HERO_TRUST_NOTES = [
  { icon: FlaskConical, label: "Практика" },
  { icon: Brain, label: "AI-наставник" },
  { icon: FileBadge, label: "Сертификат" },
  { icon: Shield, label: "Безопасная платформа" },
] as const;

export const LANDING_HERO_ROADMAP = [
  { order: 1, title: "Основы ИБ", status: "done" as const },
  { order: 2, title: "Фишинг и социнженерия", status: "active" as const },
  { order: 3, title: "Анализ URL", status: "upcoming" as const },
] as const;

export const LANDING_SECTION_IDS = {
  program: "program",
  practice: "labs",
  mentor: "ai-mentor",
  certificate: "certificate",
  reviews: "reviews",
  security: "security",
  faq: "faq",
  howItWorks: "how-it-works",
  audience: "for-whom",
} as const;

export type LandingTrustItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const LANDING_TRUST_ITEMS: LandingTrustItem[] = [
  {
    icon: FlaskConical,
    title: "Практические лаборатории",
    description: "SOC-сценарии в браузере — без установки ПО.",
  },
  {
    icon: Brain,
    title: "AI-наставник",
    description: "Подсказки и объяснения без готовых ответов на тесты.",
  },
  {
    icon: FileBadge,
    title: "Сертификат",
    description: "PDF, уникальный ID и публичная проверка.",
  },
  {
    icon: Shield,
    title: "Безопасная платформа",
    description: "RBAC, CSRF, rate limits и аудит событий.",
  },
];

export type LandingAudienceItem = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const LANDING_AUDIENCES: LandingAudienceItem[] = [
  {
    icon: School,
    title: "Студентам",
    description: "Структурированный трек, практика и сертификат для портфолио и учебных проектов.",
  },
  {
    icon: Laptop,
    title: "Начинающим специалистам",
    description: "База ИБ перед углублением в SOC, GRC или разработку — без перегруза на старте.",
  },
  {
    icon: Users,
    title: "Преподавателям",
    description: "Готовая программа, проверка работ и админка для учебной группы на одной платформе.",
  },
  {
    icon: GraduationCap,
    title: "Всем, кто хочет понять основы ИБ",
    description: "От модели угроз до учебных инцидентов — понятным языком, с практикой по ходу.",
  },
];

export type LandingStepItem = {
  n: number;
  title: string;
  description: string;
  icon: LucideIcon;
};

export const LANDING_HOW_IT_WORKS: LandingStepItem[] = [
  {
    n: 1,
    title: "Урок",
    description: "Изучаете короткий модуль с примерами и ключевыми понятиями.",
    icon: BookOpen,
  },
  {
    n: 2,
    title: "Тест",
    description: "Проверяете понимание темы через серверную проверку ответов.",
    icon: ClipboardList,
  },
  {
    n: 3,
    title: "Практика",
    description: "Разбираете сценарий: письмо, ссылку, лог или мини-инцидент.",
    icon: FlaskConical,
  },
  {
    n: 4,
    title: "Проверка",
    description: "Получаете результат, комментарии и рекомендации по слабым темам.",
    icon: ShieldCheck,
  },
  {
    n: 5,
    title: "Сертификат",
    description: "После завершения курса получаете сертификат с проверкой подлинности.",
    icon: FileBadge,
  },
];

/** Формат модуля в маркетинговом превью программы. */
export const LANDING_PROGRAM_MODULE_FORMAT = "Урок + тест + практика" as const;

export type LandingProgramModule = {
  orderNumber: number;
  title: string;
  description: string;
  skill: string;
  estimatedTime: string;
  formatPreview: typeof LANDING_PROGRAM_MODULE_FORMAT;
};

/** Маркетинговое превью программы (без служебных данных курса). */
export const LANDING_PROGRAM_MODULES: LandingProgramModule[] = [
  {
    orderNumber: 1,
    title: "Основы информационной безопасности",
    description: "Модель угроз, CIA, риски и базовая гигиена защиты в повседневной работе.",
    skill: "понимать угрозы, риски и базовые принципы защиты",
    estimatedTime: "~3–4 ч",
    formatPreview: LANDING_PROGRAM_MODULE_FORMAT,
  },
  {
    orderNumber: 2,
    title: "Фишинг и социальная инженерия",
    description: "Разбор писем, заголовков, вложений и типичных приёмов манипуляции.",
    skill: "распознавать подозрительные письма и манипуляции",
    estimatedTime: "~3 ч",
    formatPreview: LANDING_PROGRAM_MODULE_FORMAT,
  },
  {
    orderNumber: 3,
    title: "Анализ URL и веб-угроз",
    description: "Оценка доменов, редиректов и признаков опасных сайтов без перехода на боевые ресурсы.",
    skill: "проверять ссылки, домены и признаки опасных сайтов",
    estimatedTime: "~3 ч",
    formatPreview: LANDING_PROGRAM_MODULE_FORMAT,
  },
  {
    orderNumber: 4,
    title: "Криптография и защита данных",
    description: "Хеши, шифрование, подписи и безопасное хранение секретов в учебных задачах.",
    skill: "понимать хеширование, шифрование и хранение секретов",
    estimatedTime: "~4 ч",
    formatPreview: LANDING_PROGRAM_MODULE_FORMAT,
  },
  {
    orderNumber: 5,
    title: "Логи и реагирование на инциденты",
    description: "Корреляция событий в журналах и оформление учебного разбора инцидента.",
    skill: "читать события, находить аномалии и описывать инцидент",
    estimatedTime: "~4–5 ч",
    formatPreview: LANDING_PROGRAM_MODULE_FORMAT,
  },
];

/** Статус лаборатории в маркетинговом превью. */
export const LANDING_PRACTICE_LAB_STATUS = "Практика" as const;

export type LandingPracticeLabDifficulty = "Начальный" | "Средний" | "Продвинутый";

export type LandingPracticeLab = {
  id: string;
  title: string;
  scenario: string;
  goal: string;
  difficulty: LandingPracticeLabDifficulty;
  estimatedTime: string;
  skill: string;
  statusPreview: typeof LANDING_PRACTICE_LAB_STATUS;
  /** Строки псевдо-терминала без ответов и флагов. */
  terminalPreview: readonly string[];
};

export const LANDING_PRACTICE_LABS: LandingPracticeLab[] = [
  {
    id: "lab-phish",
    title: "Анализ фишингового письма",
    scenario: "Учебный почтовый ящик: письмо «о блокировке счёта» с вложением и подозрительной ссылкой.",
    goal: "найти признаки социальной инженерии",
    difficulty: "Начальный",
    estimatedTime: "~30 мин",
    skill: "распознавание фишинга и манипуляций в письмах",
    statusPreview: LANDING_PRACTICE_LAB_STATUS,
    terminalPreview: [
      "$ mailctl inspect --sandbox",
      "from: display-name ≠ envelope",
      "links: 2 · attachments: 1",
      "verdict: [анализ в процессе]",
    ],
  },
  {
    id: "lab-url",
    title: "Проверка подозрительной ссылки",
    scenario: "Карточка с цепочкой редиректов и доменом, похожим на известный сервис — без перехода на боевые сайты.",
    goal: "определить риск по домену, HTTPS и структуре URL",
    difficulty: "Средний",
    estimatedTime: "~25 мин",
    skill: "оценка домена, TLS и структуры URL",
    statusPreview: LANDING_PRACTICE_LAB_STATUS,
    terminalPreview: [
      "$ urlscan --no-follow --training",
      "host: ████.invalid",
      "tls: cert mismatch · hops: 3",
      "risk_score: [ожидает оценку]",
    ],
  },
  {
    id: "lab-logs",
    title: "Разбор инцидента по логам",
    scenario: "Поток auth / web / firewall в учебной SOC-среде за последний час.",
    goal: "найти подозрительные события и описать возможную атаку",
    difficulty: "Средний",
    estimatedTime: "~40 мин",
    skill: "корреляция событий и описание инцидента",
    statusPreview: LANDING_PRACTICE_LAB_STATUS,
    terminalPreview: [
      "$ logtail --window 1h --sandbox",
      "events: 847 · sources: 3",
      "anomaly: spike auth failures",
      "timeline: [сборка цепочки]",
    ],
  },
  {
    id: "lab-ctf",
    title: "Мини CTF-задание",
    scenario: "Короткий челлендж в изолированной учебной среде — один сценарий, один флаг.",
    goal: "применить знания в коротком практическом сценарии",
    difficulty: "Продвинутый",
    estimatedTime: "~20 мин",
    skill: "синтез знаний модуля в практике",
    statusPreview: LANDING_PRACTICE_LAB_STATUS,
    terminalPreview: [
      "$ ctf mount --module review",
      "challenge: active · env: isolated",
      "flag: CE{████████}",
      "submit: disabled in preview",
    ],
  },
];

/** Описание секции AI-наставника на лендинге. */
export const LANDING_MENTOR_INTRO =
  "AI-наставник помогает понять сложные темы, объясняет материал простыми словами, задаёт вопросы для самопроверки и даёт подсказки без раскрытия готовых ответов.";

export const LANDING_MENTOR_POLICY =
  "AI-наставник не выдаёт готовые ответы на тесты и практические задания.";

const LANDING_MENTOR_LABELS: Partial<Record<MentorModeId, string>> = {
  give_example: "Приведи пример",
  hint_only: "Дай подсказку",
};

const LANDING_MENTOR_MODE_IDS: MentorModeId[] = [
  "explain_simple",
  "give_example",
  "check_understanding",
  "hint_only",
  "summarize",
];

/** Режимы AI на лендинге (синхрон с MENTOR_MODES, только UI). */
export const LANDING_MENTOR_MODES = LANDING_MENTOR_MODE_IDS.map((id) => {
  const mode = MENTOR_MODES.find((m) => m.id === id);
  if (!mode) throw new Error(`Missing mentor mode: ${id}`);
  return {
    ...mode,
    label: LANDING_MENTOR_LABELS[id] ?? mode.label,
  };
});

/** Статический диалог для превью чата (без ответов на задания). */
export const LANDING_MENTOR_CHAT_PREVIEW = {
  user: "Я не понимаю, как отличить фишинговую ссылку",
  assistant:
    "Посмотри на домен, срочность сообщения и несоответствие адреса отправителя. Сравни отображаемый текст ссылки с реальным URL — часто они расходятся. Какой домен ты видишь в примере из лекции?",
} as const;

export type LandingSecurityFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const LANDING_SECURITY_FEATURES: LandingSecurityFeature[] = [
  {
    icon: Users,
    title: "RBAC",
    description: "Роли студента и администратора: middleware, layout и server actions защищают кабинет и админку.",
  },
  {
    icon: Lock,
    title: "Сессии и CSRF",
    description: "Hardened cookies в production, Origin/Referer на API, server-side проверки Next.js.",
  },
  {
    icon: Shield,
    title: "Rate limiting",
    description: "Redis в production: вход, AI, verify сертификатов, upload и submit заданий.",
  },
  {
    icon: Activity,
    title: "Audit log",
    description: "Auth, admin, сертификаты и AI — в журнале без паролей и токенов.",
  },
  {
    icon: FileBadge,
    title: "Сертификаты и честная проверка",
    description: "Публичный verify по CE-номеру; тесты и практики оцениваются только на сервере.",
  },
];

export type LandingFaqItem = { q: string; a: string };

export const LANDING_FAQ: LandingFaqItem[] = [
  {
    q: "Для кого этот курс?",
    a: "Курс подходит студентам, начинающим специалистам и всем, кто хочет понять основы информационной безопасности через практику.",
  },
  {
    q: "Нужно ли знать программирование?",
    a: "Нет, базовые темы можно проходить без программирования. Для некоторых практик достаточно внимательности и понимания логики угроз.",
  },
  {
    q: "Есть ли практические задания?",
    a: "Да, курс включает лаборатории: анализ писем, ссылок, логов и мини-сценариев инцидентов.",
  },
  {
    q: "Что делает AI-наставник?",
    a: "Он объясняет темы, приводит примеры, помогает разобраться с ошибками и даёт подсказки без раскрытия готовых ответов.",
  },
  {
    q: "Как получить сертификат?",
    a: "Нужно пройти необходимые уроки, тесты и практические задания. После завершения курса сертификат можно скачать и проверить по уникальному ID.",
  },
  {
    q: "Можно ли использовать курс преподавателю?",
    a: "Да, админ-панель помогает управлять материалами, проверять практики и отслеживать прогресс студентов.",
  },
];

/** Маркетинговое превью сертификата на лендинге (не реальный документ). */
export const LANDING_CERTIFICATE_INTRO =
  "После завершения курса студент получает сертификат с уникальным идентификатором и страницей проверки подлинности.";

export const LANDING_CERTIFICATE_PREVIEW = {
  title: "Сертификат CyberEdu",
  recipientName: "Анна Иванова",
  courseTitle: "Основы информационной безопасности",
  /** Нейтральная дата для демо-превью */
  issuedDateLabel: "2026",
  certificateId: "CE-2026-DEMO0001",
  verifyPathDisplay: "/verify/CE-2026-DEMO0001",
} as const;

/** Публичный маршрут проверки по номеру реестра. */
export const LANDING_CERT_VERIFY_HREF = `/verify/${LANDING_CERTIFICATE_PREVIEW.certificateId}`;

/** @deprecated Используйте LANDING_CERT_VERIFY_HREF */
export const LANDING_CERT_VERIFY_DEMO_PATH = LANDING_CERT_VERIFY_HREF;

export const LANDING_GITHUB_URL = "https://github.com/TronTanya/info_course";
