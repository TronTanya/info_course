/** Тематические обложки и внешние материалы по модулям курса (0…7). */

export type LessonResourceKind = "video" | "article" | "book" | "course";

export type LessonExternalResource = {
  title: string;
  href: string;
  kind: LessonResourceKind;
  source?: string;
};

export type LessonModuleMedia = {
  figureSrc: string;
  figureAlt: string;
  figureCaption: string;
  resources: LessonExternalResource[];
};

const MEDIA: LessonModuleMedia[] = [
  {
    figureSrc: "/lessons/module-01-basics.png",
    figureAlt: "Три опоры информационной безопасности: конфиденциальность, целостность, доступность",
    figureCaption: "Модуль 1 — как оценивать риски через триаду CIA и здравый смысл.",
    resources: [
      {
        kind: "video",
        title: "Что такое информационная безопасность (кратко)",
        href: "https://www.youtube.com/watch?v=ohEFx3VYL48",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "Что такое кибербезопасность",
        href: "https://www.kaspersky.ru/resource-center/definitions/what-is-cyber-security",
        source: "Kaspersky",
      },
      {
        kind: "book",
        title: "Основы информационной безопасности (учебник, открытый фрагмент)",
        href: "https://cyberleninka.ru/article/n/osnovy-informatsionnoy-bezopasnosti",
        source: "КиберЛенинка",
      },
    ],
  },
  {
    figureSrc: "/lessons/module-02-passwords.png",
    figureAlt: "Пароль и второй фактор аутентификации",
    figureCaption: "Модуль 2 — уникальные пароли и 2FA для важных сервисов.",
    resources: [
      {
        kind: "video",
        title: "Двухфакторная аутентификация — зачем нужна",
        href: "https://www.youtube.com/watch?v=MebVv6bZ9XU",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "Рекомендации по паролям (NIST, кратко)",
        href: "https://pages.nist.gov/800-63-3/sp800-63b.html",
        source: "NIST",
      },
      {
        kind: "course",
        title: "Менеджеры паролей — обзор EFF",
        href: "https://ssd.eff.org/module/passwords",
        source: "EFF",
      },
    ],
  },
  {
    figureSrc: "/lessons/module-03-phishing.png",
    figureAlt: "Фишинг и социальная инженерия",
    figureCaption: "Модуль 3 — проверяйте отправителя и канал, не эмоции.",
    resources: [
      {
        kind: "video",
        title: "Как распознать фишинг",
        href: "https://www.youtube.com/watch?v=XBkzBrXqua0",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "Фишинг: что это и как защититься",
        href: "https://www.kaspersky.ru/resource-center/threats/phishing",
        source: "Kaspersky",
      },
      {
        kind: "article",
        title: "Отчёт Anti-Phishing Working Group (обзор трендов)",
        href: "https://apwg.org/trendsreports/",
        source: "APWG",
      },
    ],
  },
  {
    figureSrc: "/lessons/module-04-devices.png",
    figureAlt: "Безопасность устройств: обновления и блокировка",
    figureCaption: "Модуль 4 — обновления, резервные копии и физический доступ.",
    resources: [
      {
        kind: "video",
        title: "Обновления ПО — почему это важно",
        href: "https://www.youtube.com/watch?v=H5iDvXb2NuQ",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "Руководство по резервному копированию для пользователей",
        href: "https://www.backblaze.com/blog/the-3-2-1-backup-strategy/",
        source: "Backblaze",
      },
      {
        kind: "article",
        title: "Блокировка экрана и шифрование диска (справка Microsoft)",
        href: "https://support.microsoft.com/ru-ru/windows/использование-блокировки-устройства-windows-9380189",
        source: "Microsoft",
      },
    ],
  },
  {
    figureSrc: "/lessons/module-05-internet.png",
    figureAlt: "Безопасность в интернете: HTTPS и Wi‑Fi",
    figureCaption: "Модуль 5 — HTTPS, приватность браузера и осторожность в публичных сетях.",
    resources: [
      {
        kind: "video",
        title: "Как работает HTTPS (кратко)",
        href: "https://www.youtube.com/watch?v=T4Df5tPN0VE",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "Что такое HTTPS",
        href: "https://developer.mozilla.org/ru/docs/Web/Security/Transport_Layer_Security",
        source: "MDN",
      },
      {
        kind: "article",
        title: "Публичный Wi‑Fi: риски и советы FTC",
        href: "https://consumer.ftc.gov/articles/how-secure-public-wi-fi-networks",
        source: "FTC",
      },
    ],
  },
  {
    figureSrc: "/lessons/module-06-linux.png",
    figureAlt: "Linux и сети: учебная консоль",
    figureCaption: "Модуль 6 — базовые команды и чтение вывода ping/traceroute.",
    resources: [
      {
        kind: "video",
        title: "Основы Linux для начинающих",
        href: "https://www.youtube.com/watch?v=ROjZy1WbCIA",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "Команда ping — справка",
        href: "https://man7.org/linux/man-pages/man8/ping.8.html",
        source: "man7",
      },
      {
        kind: "course",
        title: "Введение в сети (Cisco Networking Basics)",
        href: "https://www.netacad.com/courses/networking",
        source: "Cisco NetAcad",
      },
    ],
  },
  {
    figureSrc: "/lessons/module-07-crypto.png",
    figureAlt: "Криптография для новичков",
    figureCaption: "Модуль 7 — шифрование, хеши и Base64 как учебные модели.",
    resources: [
      {
        kind: "video",
        title: "Криптография за 5 минут",
        href: "https://www.youtube.com/watch?v=Kf9KjCKmDcU",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "Шифр Цезаря — объяснение",
        href: "https://www.khanacademy.org/computing/computer-science/cryptography/ciphers/a/the-caesar-cipher",
        source: "Khan Academy",
      },
      {
        kind: "book",
        title: "Криптография для чайников (введение)",
        href: "https://www.dummies.com/article/technology/information-technology/security/cryptography-for-dummies-cheat-sheet-208655/",
        source: "dummies.com",
      },
    ],
  },
  {
    figureSrc: "/lessons/module-08-incident.png",
    figureAlt: "Итоговое расследование по журналу событий",
    figureCaption: "Модуль 8 — связать факты в журнале и сформулировать вывод защиты.",
    resources: [
      {
        kind: "video",
        title: "Основы реагирования на инциденты",
        href: "https://www.youtube.com/watch?v=0gXwe6-S4FY",
        source: "YouTube",
      },
      {
        kind: "article",
        title: "NIST Computer Security Incident Handling Guide (краткий обзор)",
        href: "https://csrc.nist.gov/publications/detail/sp/800-61/rev-2/final",
        source: "NIST",
      },
      {
        kind: "article",
        title: "Что такое SIEM и зачем нужны логи",
        href: "https://www.ibm.com/topics/siem",
        source: "IBM",
      },
    ],
  },
];

export function getLessonModuleMedia(moduleIndex: number): LessonModuleMedia {
  return MEDIA[moduleIndex] ?? MEDIA[0]!;
}

export function buildLessonFigureFence(moduleIndex: number): string {
  const m = getLessonModuleMedia(moduleIndex);
  return [":::figure", "Тема модуля", m.figureSrc, m.figureCaption, ":::"].join("\n");
}

export function buildLessonResourcesFence(moduleIndex: number): string {
  const m = getLessonModuleMedia(moduleIndex);
  const resourceLines = m.resources.map((r) => {
    const source = r.source ? ` (${r.source})` : "";
    return `- [${r.title}${source}](${r.href}) | ${r.kind}`;
  });

  return [
    ":::resources",
    "Дополнительные материалы",
    "Видео, статьи и справочники для углубления темы (вне платформы).",
    ...resourceLines,
    ":::",
  ].join("\n");
}
