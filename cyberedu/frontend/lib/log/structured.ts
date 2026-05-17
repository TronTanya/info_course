type LogLevel = "info" | "warn" | "error";

type LogFields = Record<string, string | number | boolean | undefined>;

function emit(level: LogLevel, message: string, fields?: LogFields) {
  const payload = {
    level,
    message,
    service: "cyberedu-frontend",
    timestamp: new Date().toISOString(),
    ...fields,
  };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export function logInfo(message: string, fields?: LogFields) {
  emit("info", message, fields);
}

export function logWarn(message: string, fields?: LogFields) {
  emit("warn", message, fields);
}

export function logError(message: string, fields?: LogFields) {
  emit("error", message, fields);
}
