/** Сообщения для UI — без имён переменных окружения и без деталей провайдера. */

export const MENTOR_UNAVAILABLE =
  "AI-наставник сейчас недоступен. Попробуйте позже или обратитесь к администратору курса.";

export const MENTOR_DISABLED_ENV_OFF =
  "Наставник отключён для этой страницы. Вы можете продолжить с материалами курса.";

export const MENTOR_DISABLED_NO_API_KEY = MENTOR_UNAVAILABLE;

export const MENTOR_DISABLED_UNAUTHORIZED =
  "Войдите в аккаунт, чтобы задавать вопросы наставнику.";

export const MENTOR_DISABLED_CONTENT_LOCKED =
  "Сначала откройте этот раздел курса — чат наставника станет доступен после разблокировки.";

export const MENTOR_EMPTY_HEADLINE = "Задайте вопрос по материалу";

export const MENTOR_ERROR_NETWORK =
  "Не удалось связаться с сервером. Проверьте сеть и попробуйте снова.";

export const MENTOR_ERROR_SERVER =
  "Сервис наставника временно недоступен. Попробуйте через несколько минут.";

export const MENTOR_ERROR_PROVIDER =
  "Сейчас не удаётся получить ответ от AI. Попробуйте через минуту или продолжите с материалами курса.";

export const MENTOR_ERROR_MODERATION =
  "Ответ не прошёл проверку безопасности. Сократите вопрос и уберите просьбы о готовых решениях.";

export const MENTOR_ERROR_UNAUTHORIZED = MENTOR_DISABLED_UNAUTHORIZED;

/** @deprecated Не показывать в UI — только для серверных логов. */
export const MENTOR_KEY_NOT_CONFIGURED =
  "Ключ AI не настроен на сервере.";
