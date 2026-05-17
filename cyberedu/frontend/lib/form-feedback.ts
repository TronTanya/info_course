export type FormFeedbackKind = "rate_limit" | "unavailable" | "validation" | "generic";

export type ClassifiedFormFeedback = {
  kind: FormFeedbackKind;
  title: string;
  description: string;
};

/** Единая классификация ошибок Server Actions для UI (тест, практика, формы). */
export function classifyFormFeedback(message: string): ClassifiedFormFeedback {
  const description = message.trim();

  if (/слишком много/i.test(description)) {
    return {
      kind: "rate_limit",
      title: "Слишком частые отправки",
      description,
    };
  }

  if (/временно недоступен/i.test(description)) {
    return {
      kind: "unavailable",
      title: "Сервис временно недоступен",
      description,
    };
  }

  if (/ответьте|укажите|введите|не менее|некоррект|проверьте|заполните/i.test(description)) {
    return {
      kind: "validation",
      title: "Проверьте ответы",
      description,
    };
  }

  return {
    kind: "generic",
    title: "Не удалось выполнить действие",
    description,
  };
}
