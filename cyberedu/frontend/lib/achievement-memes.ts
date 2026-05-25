/** Кошачьи мемы для бейджей (`/public/achievements/`, квадрат 512×512). */
export const ACHIEVEMENT_MEME_BY_SLUG: Record<string, { src: string; alt: string }> = {
  "first-step": { src: "/achievements/first-step.png", alt: "Pop Cat — первый модуль" },
  "phishing-detective": { src: "/achievements/phishing-detective.png", alt: "Скептичный кот — детектив фишинга" },
  "account-defender": { src: "/achievements/account-defender.png", alt: "Вежливый кот — защитник аккаунта" },
  "log-analyst": { src: "/achievements/log-analyst.png", alt: "Кот-математик — аналитик логов" },
  "course-complete": { src: "/achievements/course-complete.png", alt: "Кот и взрыв — курс завершён" },
  "ai-mentor": { src: "/achievements/ai-mentor.png", alt: "Кот в очках — спросил наставника" },
  "half-course": { src: "/achievements/half-course.png", alt: "Чилл-кот — ровно полпути" },
  "perfect-test": { src: "/achievements/perfect-test.png", alt: "Орущий кот — идеальный зачёт" },
  "first-lecture": { src: "/achievements/first-lecture.png", alt: "Мокрый кот — первая лекция" },
  "test-survivor": { src: "/achievements/test-survivor.png", alt: "Кот за ноутбуком — тест сдан" },
  "two-modules": { src: "/achievements/two-modules.png", alt: "Кот с языком — два модуля" },
  "three-modules": { src: "/achievements/three-modules.png", alt: "Кот «хм?» — три модуля" },
  "practice-sent": { src: "/achievements/practice-sent.png", alt: "Гремлин-кот — практика отправлена" },
  "mentor-regular": { src: "/achievements/mentor-regular.png", alt: "Слёзный вежливый кот — диалог с наставником" },
  "test-retry": { src: "/achievements/test-retry.png", alt: "Плачущий кот — повтор теста" },
  "all-lectures": { src: "/achievements/all-lectures.png", alt: "Loading-кот — все лекции пройдены" },
  "almost-done": { src: "/achievements/almost-done.png", alt: "Blep-кот — остался один модуль" },
};

export const ACHIEVEMENT_MEME_SRCS = Object.values(ACHIEVEMENT_MEME_BY_SLUG).map((m) => m.src);
