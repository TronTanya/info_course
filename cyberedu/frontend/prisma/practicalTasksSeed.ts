import type { CheckType, PracticalTaskType, Prisma } from "@prisma/client";

export type PracticalTaskSeedRow = {
  title: string;
  description: string;
  taskType: PracticalTaskType;
  checkType: CheckType;
  maxScore: number;
  minLength: number;
  instruction: string | null;
  consoleScenario: string | null;
  expectedCommand: string | null;
  expectedAnswerPattern: string | null;
  interactiveExpectedAnswer: string | null;
  scenarioData: Prisma.InputJsonValue;
};

const scenario = (o: Prisma.InputJsonValue): Prisma.InputJsonValue => o;

/** Одна практика на модуль (порядок 0…7 соответствует orderNumber модуля). */
export function getPracticalTaskSeedForModule(moduleIndex: number): PracticalTaskSeedRow {
  const seeds: PracticalTaskSeedRow[] = [
    {
      title: "Ситуации: персональные данные, риск и безопасное действие",
      description:
        "Две короткие бытовые истории. В каждой отметьте: есть ли персональные данные, насколько это рискованно и что сделать безопаснее всего.\n\nОценка ставится автоматически — нужно совпасть с учебным эталоном по всем трём полям.",
      taskType: "SITUATION_CHOICE",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 10,
      instruction: null,
      consoleScenario: null,
      expectedCommand: null,
      expectedAnswerPattern: null,
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: [
          "Персональные данные — то, по чему вас можно узнать: ФИО, паспорт, телефон, почта, логин, адрес и т.п.",
          "Общий чат курса — публичный канал: туда не несут сканы документов.",
        ],
        criteria: "Нужно полное совпадение с эталоном по каждой ситуации (все три ответа).",
        situations: [
          {
            id: "s1",
            text: "В общем чате курса одногруппник просит сфоткать разворот паспорта «для проверки личности».",
            choices: {
              personalData: [
                { id: "pd_yes", label: "Да, это персональные данные" },
                { id: "pd_no", label: "Нет, это не персональные данные" },
              ],
              risk: [
                { id: "risk_high", label: "Высокий риск утечки" },
                { id: "risk_low", label: "Низкий риск" },
              ],
              safeAction: [
                { id: "act_refuse", label: "Отказаться и предложить официальный канал / преподавателю" },
                { id: "act_send", label: "Прислать фото в общий чат без вопросов" },
              ],
            },
            expected: { personalData: "pd_yes", risk: "risk_high", safeAction: "act_refuse" },
          },
          {
            id: "s2",
            text: "В анкете на выставку ты указываешь только город, без ФИО и телефона — как разрешили организаторы.",
            choices: {
              personalData: [
                { id: "pd_coarse", label: "Скорее обезличенные/грубые данные" },
                { id: "pd_full", label: "Точно персональные данные как в паспорте" },
              ],
              risk: [
                { id: "risk_med", label: "Средний риск (зависит от контекста)" },
                { id: "risk_min", label: "Минимальный риск при таком объёме" },
              ],
              safeAction: [
                { id: "act_ok", label: "Так можно, если политика мероприятия это допускает" },
                { id: "act_bad", label: "Нужно указать ещё и паспортные данные «для формальности»" },
              ],
            },
            expected: { personalData: "pd_coarse", risk: "risk_min", safeAction: "act_ok" },
          },
        ],
      }),
    },
    {
      title: "Анализ паролей: слабый, средний, надёжный",
      description:
        "Три выдуманных пароля — расставьте им уровень: слабый, средний или надёжный. Смотри на длину, шаблоны вроде клавиатурного ряда и не повторяй такие пароли в жизни.\n\nПроверка автоматическая.",
      taskType: "PASSWORD_ANALYSIS",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 10,
      instruction: null,
      consoleScenario: null,
      expectedCommand: null,
      expectedAnswerPattern: null,
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: [
          "Слабый — короткий, только цифры или привычный ряд на клавиатуре.",
          "Средний — длиннее, но узнаваемое слово + год или «Qwerty…».",
          "Надёжный в задании — длинный набор разных типов символов без банального слова (только для тренировки на платформе).",
        ],
        criteria: "Для каждого пароля должен быть выбран нужный уровень (слабый / средний / надёжный) по эталону задания.",
        items: [
          { id: "p1", sample: "12345678", note: "Только цифры, короткий шаблон.", expectedStrength: "WEAK" },
          { id: "p2", sample: "Qwerty2024!", note: "Клавиатурный паттерн + год.", expectedStrength: "MEDIUM" },
          {
            id: "p3",
            sample: "k9#mP2$vL8@nQ1!wR5z",
            note: "Длина и смесь классов символов (учебный пример).",
            expectedStrength: "STRONG",
          },
        ],
      }),
    },
    {
      title: "Разбор учебного «фишингового» письма",
      description:
        "Откройте письмо и отметьте подозрительные места (отправитель, срочность, ссылка, просьба пароля…). Нажмите «Проверить»: до пяти баллов; четыре и пять засчитываются автоматически.\n\nАдреса и названия вымышленные.",
      taskType: "PHISHING_ANALYSIS",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 10,
      instruction: null,
      consoleScenario: null,
      expectedCommand: null,
      expectedAnswerPattern: null,
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: [
          "Сверьте домен отправителя с тем, как обычно пишет ваша учебная организация.",
          "Частая связка: «срочно» + «аккаунт заблокируют» + ссылка не туда + «напишите пароль».",
        ],
        criteria:
          "5/5 — отлично; 4/5 — хорошо; 3/5 — повторите тему; ниже 3 баллов зачёт не сохранится — попробуйте ещё раз.",
        correctFlagIds: ["sender", "urgency", "suspicious_link", "password_request", "threat_block"],
      }),
    },
    {
      title: "Чек-лист защиты устройства",
      description:
        "Отметьте пять базовых пунктов гигиены ПК. Потом одним коротким текстом опишите, что из этого делаете вы или что сделали бы на своём ноутбуке — без шуток про «вирусы себе поставить».\n\nПроверка: галочки и текст по правилам задания.",
      taskType: "CHECKLIST",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 10,
      instruction: null,
      consoleScenario: null,
      expectedCommand: null,
      expectedAnswerPattern: null,
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: [
          "На занятии считаем, что все пять пунктов — норма для учебной станции.",
          "В ответе встретится хотя бы одно из слов: обновления, антивирус, блокировка, резерв, USB или флешка.",
        ],
        criteria: "Все пункты отмечены; ответ не короче минимума и проходит проверку по ключевым словам.",
        items: [
          { id: "updates", label: "Автоматические обновления ОС и приложений включены" },
          { id: "lock", label: "Блокировка экрана с PIN/паролем при простое" },
          { id: "antivirus", label: "Антивирус / встроенная защита активна" },
          { id: "backup", label: "Регулярные резервные копии важных данных" },
          { id: "usb", label: "Ограничение неизвестных USB-накопителей (политика организации)" },
        ],
        requiredIds: ["updates", "lock", "antivirus", "backup", "usb"],
        reflectionMinLength: 40,
        reflectionPattern: "(обновлен|антивирус|блокировк|резерв|usb|флеш)",
      }),
    },
    {
      title: "Анализ ссылок: безопасные и подозрительные",
      description:
        "Пять учебных ссылок в таблице. Решите для каждой: ок или подозрительно; у подозрительных укажите причину и пару предложений своими словами (домен, https, опечатка).\n\nСтроки вымышленные, сайты не открываются — только разбор текста.",
      taskType: "URL_ANALYSIS",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 10,
      instruction: null,
      consoleScenario: null,
      expectedCommand: null,
      expectedAnswerPattern: null,
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: [
          "Смотрите на начало адреса (http/https), опечатки в имени сайта и «главный» домен справа перед первым слэшем.",
          "Примеры вроде college.ru и example.com придуманы для тренировки.",
        ],
        criteria:
          "Все ссылки классифицированы верно, у подозрительных указана причина, в тексте есть нужные слова; для зачёта обычно от 9/10 баллов по ссылкам.",
        urls: [],
        explanationMinLength: 35,
        explanationPattern: "(домен|https|http|поддел|опечатк|ссылк|подозрит|протокол|поддомен)",
      }),
    },
    {
      title: "Учебная консоль: ping и объяснение вывода",
      description:
        "Это симулятор: команды не уходят в интернет и не трогают вашу систему. Сначала можно help, потом выполните ровно ту команду, что внизу, и объясните вывод простыми словами.\n\nПроверка автоматическая.",
      taskType: "TRAINING_CONSOLE",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 24,
      instruction: null,
      consoleScenario:
        "Шаги:\n1) Введите ровно: ping example.com\n2) В объяснении напишите, что ответы идут с учебного IP и в выводе есть время отклика (мс) и TTL.",
      expectedCommand: "ping example.com",
      expectedAnswerPattern: "(ttl|time|мс|ms|icmp|ответ|адрес|ip|пакет)",
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: ["Если забыли синтаксис — help.", "В тексте лучше пересказать то, что реально увидели в окне симулятора."],
        criteria: "Команда как в задании; объяснение не короче минимума и содержит слова из проверки (см. подсказки к полю ответа).",
      }),
    },
    {
      title: "Криптография для новичков: Цезарь, Base64, хеши",
      description:
        "Три маленьких шага: сдвиг Цезаря, раскодировать Base64, сравнить два учебных хеша и словами сказать, что значит совпадение или различие. Без «взломов» и без реальных паролей.\n\nПроверка автоматическая.",
      taskType: "CRYPTO_TASK",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 10,
      instruction: null,
      consoleScenario: null,
      expectedCommand: null,
      expectedAnswerPattern: null,
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: [
          "Цезарь: если при шифровании сдвиг +3, при расшифровке каждую букву сдвигаете на три позиции назад по алфавиту задания.",
          "Base64 — это «упаковка» в текст, не секрет; на выходе должна читаться обычная фраза.",
          "Если хеши разные — файлы не одинаковые; в пояснении упомяните хеш или отличие.",
        ],
        criteria:
          "Верно Цезарь, Base64, ответ про хеши и короткое пояснение не короче 20 символов со словом про хеш или про отличие.",
      }),
    },
    {
      title: "Мини-SOC: анализ логов",
      description:
        "Вымышленный журнал входов. Найдите подозрительную цепочку, выберите тип инцидента из списка и кратко опишите вывод как сотрудник защиты: нейтрально, без инструкций «как повторить».\n\nПроверка по кнопке «Проверить».",
      taskType: "LOG_ANALYSIS",
      checkType: "AUTO",
      maxScore: 20,
      minLength: 60,
      instruction: null,
      consoleScenario: null,
      expectedCommand: null,
      expectedAnswerPattern: null,
      interactiveExpectedAnswer: null,
      scenarioData: scenario({
        hints: [
          "Смотрите на порядок: несколько неудачных входов, потом успешный вход, потом запрос сброса пароля.",
          "Пишите спокойно: «похоже на…», «рекомендую проверить…», без пошагового «как взломать».",
        ],
        criteria:
          "Нужен верный тип инцидента для учебного сценария (подбор пароля) и вывод с ключевыми словами не короче минимальной длины.",
        logLines: [],
        conclusionMinLength: 50,
        autoKeywords: ["неудач", "успеш", "сброс"],
      }),
    },
  ];

  return seeds[moduleIndex] ?? seeds[0];
}
