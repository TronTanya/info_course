/**
 * Учебная имитация терминала: только заранее заданные ответы, без вызова ОС.
 */

const FORBIDDEN_RE =
  /\b(rm|curl|wget|ssh|sudo|chmod|chown|mkfs|dd|eval|exec|bash|sh\s|cmd\.exe|powershell|nc\s|netcat)\b|[`|;&]\s*(\||&&|;)|\/bin\/\b/i;

export const TRAINING_ALLOWED_HELP_LINES = [
  "help — список команд",
  "ping example.com — учебный ping",
  "nslookup example.com — учебный DNS-запрос",
  "whoami — учебный вывод пользователя",
  "ipconfig — учебная сетевая сводка",
  "clear — очистить экран",
] as const;

export function normalizeTrainingCommand(s: string): string {
  return s.trim().replace(/\s+/g, " ").toLowerCase();
}

/** Безопасное сравнение с ожидаемой учебной командой (без вызова shell). */
export function trainingCommandsMatch(expected: string, recordedNormalized: string): boolean {
  return normalizeTrainingCommand(expected) === normalizeTrainingCommand(recordedNormalized);
}

const UNKNOWN_CMD =
  "Эта команда недоступна в учебной консоли. Используйте help.";

function normCmd(s: string): string {
  return normalizeTrainingCommand(s);
}

export type TrainingSimResult =
  | { kind: "append"; lines: string[]; recordedCommand?: string }
  | { kind: "clear" }
  | { kind: "reject"; message: string };

/** Проверка ввода: опасные конструкции блокируются до разбора команд. */
export function isForbiddenTrainingInput(line: string): boolean {
  return FORBIDDEN_RE.test(line);
}

/**
 * Разбор одной строки ввода. Не выполняет системные вызовы.
 */
export function simulateTrainingCommand(raw: string): TrainingSimResult {
  const line = raw.trim();
  if (!line) {
    return { kind: "reject", message: "" };
  }
  if (isForbiddenTrainingInput(line)) {
    return {
      kind: "reject",
      message:
        "Такие команды в учебной консоли запрещены. Разрешён только безопасный учебный набор (см. help).",
    };
  }

  const n = normCmd(line);

  if (n === "clear") {
    return { kind: "clear" };
  }

  if (n === "help") {
    return {
      kind: "append",
      lines: ["Доступные учебные команды:", ...TRAINING_ALLOWED_HELP_LINES.map((x) => `  · ${x}`)],
    };
  }

  if (n === "whoami") {
    return {
      kind: "append",
      lines: ["cyberedu-student", "(учебная имитация, не реальная учётная запись ОС)"],
      recordedCommand: "whoami",
    };
  }

  if (n === "ipconfig") {
    return {
      kind: "append",
      lines: [
        "Учебная сводка (имитация):",
        "",
        "Адаптер Ethernet:",
        "   IPv4. . . . . . . . . . . . : 192.168.0.10",
        "   Маска подсети . . . . . . . : 255.255.255.0",
        "   Основной шлюз . . . . . . : 192.168.0.1",
        "",
        "_Данные вымышлены для занятия._",
      ],
      recordedCommand: "ipconfig",
    };
  }

  if (n === "ping example.com") {
    return {
      kind: "append",
      lines: [
        "",
        "Обмен пакетами с example.com [93.184.216.34] с 32 байтами данных:",
        "Ответ от 93.184.216.34: число байт=32 время=12мс TTL=56",
        "Ответ от 93.184.216.34: число байт=32 время=11мс TTL=56",
        "Ответ от 93.184.216.34: число байт=32 время=13мс TTL=56",
        "",
        "Статистика Ping для 93.184.216.34:",
        "    Пакетов: отправлено = 3, получено = 3, потеряно = 0",
        "",
        "(учебный вывод, реальный ping не выполнялся)",
      ],
      recordedCommand: "ping example.com",
    };
  }

  if (n.startsWith("ping ")) {
    return {
      kind: "append",
      lines: ["В учебной консоли для задания используйте точно: ping example.com"],
    };
  }

  if (n === "nslookup example.com") {
    return {
      kind: "append",
      lines: [
        "Учебный ответ nslookup (имитация):",
        "",
        "Не заслуживающий доверия ответ:",
        "Name:    example.com",
        "Address:  93.184.216.34",
        "",
        "_Реальный DNS-запрос не выполнялся._",
      ],
      recordedCommand: "nslookup example.com",
    };
  }

  if (n.startsWith("nslookup ")) {
    return {
      kind: "append",
      lines: ["В учебной консоли для задания используйте точно: nslookup example.com"],
    };
  }

  return {
    kind: "append",
    lines: [UNKNOWN_CMD],
  };
}
