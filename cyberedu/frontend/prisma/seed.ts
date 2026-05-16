import "../lib/00-init-prisma-env";

/**
 * Начальное наполнение БД (локальная разработка).
 * Пароли только в виде bcrypt-хешей в БД; открытый текст паролей не сохраняется.
 * Повторный запуск: пользователи и профиль обновляются через upsert; курс дополняется при неполных модулях.
 */
import bcrypt from "bcryptjs";
import { Prisma, Role } from "@prisma/client";
import { prisma } from "../lib/db";
import { getLessonMarkdown } from "./lesson-content";
import { getPracticalTaskSeedForModule } from "./practicalTasksSeed";
import { getModuleTestQuestions } from "./testQuestions";

const BCRYPT_COST = 12;

const ADMIN_EMAIL = "admin@cyberedu.local";
const STUDENT_EMAIL = "student@cyberedu.local";

/** Разные даты регистрации (для админки «Пользователи»); демо-когорты — через `demoRegisteredAtBeforeApril4` (до 4 апреля 2026). */
const ADMIN_REGISTERED_AT = new Date("2026-01-05T09:15:00.000Z");
const STUDENT_REGISTERED_AT = new Date("2026-02-14T13:20:00.000Z");

/** Пароли задаются только внутри процесса seed и сразу хешируются. */
const ADMIN_PASSWORD_PLAIN = "Admin12345!";
const STUDENT_PASSWORD_PLAIN = "Student12345!";

/** Стабильный FNV-1a для демо-дат и баллов (одинаковый при повторном seed). */
function demoHashUint32(input: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/**
 * Дата регистрации (User.createdAt): с 15.01 по 03.04.2026 UTC включительно — строго до 4 апреля.
 */
function demoRegisteredAtBeforeApril4(seedKey: string, index: number): Date {
  const h = demoHashUint32(`${seedKey}|reg|${index}`);
  const month = h % 4;
  let day: number;
  if (month === 0) day = 15 + (h % 17);
  else if (month === 1) day = 1 + (h % 28);
  else if (month === 2) day = 1 + (h % 31);
  else day = 1 + (h % 3);
  const hour = 7 + ((h >> 7) % 12);
  const minute = (h >> 13) % 60;
  return new Date(Date.UTC(2026, month, day, hour, minute, 0));
}

/** Дополнительные демо-студенты (КИ-25, 2 курс): 13 ФИО в `generate_fake_course_progress.py` (STUDENTS_KI25 без Иванова — он student@). */
const DEMO_EXTRA_STUDENTS: ReadonlyArray<{
  email: string;
  lastName: string;
  firstName: string;
  middleName: string | null;
  birthDate: Date;
  specialty: string;
  interests: string;
  /** Дата регистрации учётной записи (createdAt). */
  registeredAt: Date;
  /** Дата «выдачи» демо-сертификата (после прохождения курса). */
  certificateIssuedAt: Date;
}> = [
  {
    email: "student2@cyberedu.local",
    lastName: "Баиров",
    firstName: "Савва",
    middleName: "Данилович",
    birthDate: new Date("2004-03-15"),
    specialty: "Программист",
    interests: "сети, Linux, учебные CTF",
    registeredAt: demoRegisteredAtBeforeApril4("student2@cyberedu.local", 0),
    certificateIssuedAt: new Date("2026-05-03T15:00:00.000Z"),
  },
  {
    email: "student3@cyberedu.local",
    lastName: "Васильева",
    firstName: "Анжелика",
    middleName: "Романовна",
    birthDate: new Date("2004-06-22"),
    specialty: "Программист",
    interests: "пароли, 2FA, документация",
    registeredAt: demoRegisteredAtBeforeApril4("student3@cyberedu.local", 1),
    certificateIssuedAt: new Date("2026-05-08T11:30:00.000Z"),
  },
  {
    email: "student4@cyberedu.local",
    lastName: "Владимирова",
    firstName: "Уйгулана",
    middleName: "Айсеновна",
    birthDate: new Date("2005-11-08"),
    specialty: "Программист",
    interests: "веб, фишинг, разбор кейсов",
    registeredAt: demoRegisteredAtBeforeApril4("student4@cyberedu.local", 2),
    certificateIssuedAt: new Date("2026-05-11T09:45:00.000Z"),
  },
  {
    email: "student5@cyberedu.local",
    lastName: "Корякина",
    firstName: "Капитолина",
    middleName: "Ивановна",
    birthDate: new Date("2003-09-01"),
    specialty: "Программист",
    interests: "криптография, математика",
    registeredAt: demoRegisteredAtBeforeApril4("student5@cyberedu.local", 3),
    certificateIssuedAt: new Date("2026-05-12T14:10:00.000Z"),
  },
  {
    email: "student6@cyberedu.local",
    lastName: "Ларионова",
    firstName: "Амелия",
    middleName: "Сергеевна",
    birthDate: new Date("2004-01-20"),
    specialty: "Программист",
    interests: "логи, расследования, практика",
    registeredAt: demoRegisteredAtBeforeApril4("student6@cyberedu.local", 4),
    certificateIssuedAt: new Date("2026-05-13T10:00:00.000Z"),
  },
  {
    email: "student7@cyberedu.local",
    lastName: "Лукин",
    firstName: "Арчын",
    middleName: "Васильевич",
    birthDate: new Date("2004-08-11"),
    specialty: "Программист",
    interests: "системное администрирование, сети",
    registeredAt: demoRegisteredAtBeforeApril4("student7@cyberedu.local", 5),
    certificateIssuedAt: new Date("2026-05-13T16:20:00.000Z"),
  },
  {
    email: "student8@cyberedu.local",
    lastName: "Маматкулов",
    firstName: "Имрон",
    middleName: "Жахонгирович",
    birthDate: new Date("2005-02-28"),
    specialty: "Программист",
    interests: "разработка, безопасные практики",
    registeredAt: demoRegisteredAtBeforeApril4("student8@cyberedu.local", 6),
    certificateIssuedAt: new Date("2026-05-14T11:00:00.000Z"),
  },
  {
    email: "student9@cyberedu.local",
    lastName: "Миронов",
    firstName: "Эрик",
    middleName: "Сергеевич",
    birthDate: new Date("2004-12-05"),
    specialty: "Программист",
    interests: "анализ данных, ИБ",
    registeredAt: demoRegisteredAtBeforeApril4("student9@cyberedu.local", 7),
    certificateIssuedAt: new Date("2026-05-14T13:30:00.000Z"),
  },
  {
    email: "student10@cyberedu.local",
    lastName: "Пермяков",
    firstName: "Афанасий",
    middleName: null,
    birthDate: new Date("2003-07-19"),
    specialty: "Программист",
    interests: "расследования, журналы событий",
    registeredAt: demoRegisteredAtBeforeApril4("student10@cyberedu.local", 8),
    certificateIssuedAt: new Date("2026-05-15T09:15:00.000Z"),
  },
  {
    email: "student11@cyberedu.local",
    lastName: "Наумов",
    firstName: "Виталий",
    middleName: "Афанасьевич",
    birthDate: new Date("2005-05-30"),
    specialty: "Программист",
    interests: "крипто, учебные задачи",
    registeredAt: demoRegisteredAtBeforeApril4("student11@cyberedu.local", 9),
    certificateIssuedAt: new Date("2026-05-15T11:00:00.000Z"),
  },
  {
    email: "student12@cyberedu.local",
    lastName: "Слепцов",
    firstName: "Гаврил",
    middleName: "Алексеевич",
    birthDate: new Date("2004-10-02"),
    specialty: "Программист",
    interests: "сети, учебные лаборатории",
    registeredAt: demoRegisteredAtBeforeApril4("student12@cyberedu.local", 10),
    certificateIssuedAt: new Date("2026-05-15T12:30:00.000Z"),
  },
  {
    email: "student13@cyberedu.local",
    lastName: "Слепцов",
    firstName: "Эрсан",
    middleName: "Арсентьевич",
    birthDate: new Date("2005-01-14"),
    specialty: "Программист",
    interests: "ИБ, практикум",
    registeredAt: demoRegisteredAtBeforeApril4("student13@cyberedu.local", 11),
    certificateIssuedAt: new Date("2026-05-15T14:45:00.000Z"),
  },
  {
    email: "student14@cyberedu.local",
    lastName: "Соловьева",
    firstName: "Кюннэй",
    middleName: "Вадимовна",
    birthDate: new Date("2004-04-18"),
    specialty: "Программист",
    interests: "документация, кейсы",
    registeredAt: demoRegisteredAtBeforeApril4("student14@cyberedu.local", 12),
    certificateIssuedAt: new Date("2026-05-16T10:00:00.000Z"),
  },
];

type DemoStudentSeedRow = (typeof DEMO_EXTRA_STUDENTS)[number];

/** Вторая когорта: те же 10 ФИО, что в `generate_fake_course_progress.py` (STUDENTS_KI24), КИ-24, 3 курс. */
const DEMO_KI24_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = [
  {
    email: "student15@cyberedu.local",
    lastName: "Балаев",
    firstName: "Асман",
    middleName: "Яхьяевич",
    birthDate: new Date("2004-05-10"),
    specialty: "Программист",
    interests: "ИБ, сети",
    registeredAt: demoRegisteredAtBeforeApril4("student15@cyberedu.local", 0),
    certificateIssuedAt: new Date("2026-05-17T10:00:00.000Z"),
  },
  {
    email: "student16@cyberedu.local",
    lastName: "Бурцев",
    firstName: "Максим",
    middleName: "Юрьевич",
    birthDate: new Date("2004-07-12"),
    specialty: "Программист",
    interests: "практика, Linux",
    registeredAt: demoRegisteredAtBeforeApril4("student16@cyberedu.local", 1),
    certificateIssuedAt: new Date("2026-05-17T11:30:00.000Z"),
  },
  {
    email: "student17@cyberedu.local",
    lastName: "Дмитриев",
    firstName: "Айсен",
    middleName: "Артёмович",
    birthDate: new Date("2005-01-08"),
    specialty: "Программист",
    interests: "веб, разбор инцидентов",
    registeredAt: demoRegisteredAtBeforeApril4("student17@cyberedu.local", 2),
    certificateIssuedAt: new Date("2026-05-17T12:00:00.000Z"),
  },
  {
    email: "student18@cyberedu.local",
    lastName: "Мелентьев",
    firstName: "Максим",
    middleName: "Станиславович",
    birthDate: new Date("2003-10-20"),
    specialty: "Программист",
    interests: "криптография, учебные задачи",
    registeredAt: demoRegisteredAtBeforeApril4("student18@cyberedu.local", 3),
    certificateIssuedAt: new Date("2026-05-17T13:15:00.000Z"),
  },
  {
    email: "student19@cyberedu.local",
    lastName: "Находкин",
    firstName: "Дмитрий",
    middleName: "Романович",
    birthDate: new Date("2004-02-14"),
    specialty: "Программист",
    interests: "расследования, логи",
    registeredAt: demoRegisteredAtBeforeApril4("student19@cyberedu.local", 4),
    certificateIssuedAt: new Date("2026-05-17T14:00:00.000Z"),
  },
  {
    email: "student20@cyberedu.local",
    lastName: "Слепцов",
    firstName: "Виктор",
    middleName: "Александрович",
    birthDate: new Date("2004-09-03"),
    specialty: "Программист",
    interests: "администрирование",
    registeredAt: demoRegisteredAtBeforeApril4("student20@cyberedu.local", 5),
    certificateIssuedAt: new Date("2026-05-17T14:45:00.000Z"),
  },
  {
    email: "student21@cyberedu.local",
    lastName: "Соколов",
    firstName: "Никита",
    middleName: "Викторович",
    birthDate: new Date("2005-03-22"),
    specialty: "Программист",
    interests: "разработка, ИБ",
    registeredAt: demoRegisteredAtBeforeApril4("student21@cyberedu.local", 6),
    certificateIssuedAt: new Date("2026-05-17T15:20:00.000Z"),
  },
  {
    email: "student22@cyberedu.local",
    lastName: "Татаринова",
    firstName: "Надежда",
    middleName: "Иннокентьева",
    birthDate: new Date("2004-11-30"),
    specialty: "Программист",
    interests: "данные, безопасность",
    registeredAt: demoRegisteredAtBeforeApril4("student22@cyberedu.local", 7),
    certificateIssuedAt: new Date("2026-05-17T16:00:00.000Z"),
  },
  {
    email: "student23@cyberedu.local",
    lastName: "Трушков",
    firstName: "Дмитрий",
    middleName: "Александрович",
    birthDate: new Date("2003-08-25"),
    specialty: "Программист",
    interests: "журналы, кейсы",
    registeredAt: demoRegisteredAtBeforeApril4("student23@cyberedu.local", 8),
    certificateIssuedAt: new Date("2026-05-17T16:30:00.000Z"),
  },
  {
    email: "student24@cyberedu.local",
    lastName: "Чернов",
    firstName: "Андрей",
    middleName: "Васильевич",
    birthDate: new Date("2005-06-01"),
    specialty: "Программист",
    interests: "учебный CTF",
    registeredAt: demoRegisteredAtBeforeApril4("student24@cyberedu.local", 9),
    certificateIssuedAt: new Date("2026-05-17T17:00:00.000Z"),
  },
];

const OIB25_SPECIALTY = "Информационная безопасность";

/** Список из задания «Назначено заданий» (Фамилия Имя); отчество в профиле не заполняется. */
const OIB25_ROSTER: ReadonlyArray<{ lastName: string; firstName: string }> = [
  { lastName: "Андросов", firstName: "Александр" },
  { lastName: "Апросимов", firstName: "Василий" },
  { lastName: "Афонский", firstName: "Марк" },
  { lastName: "Баишев", firstName: "Николай" },
  { lastName: "Батурин", firstName: "Антон" },
  { lastName: "Горбунов", firstName: "Никита" },
  { lastName: "Дорофеев", firstName: "Максим" },
  { lastName: "Иванов", firstName: "Иннокентий" },
  { lastName: "Иванова", firstName: "Александрина" },
  { lastName: "Колодезников", firstName: "Александр" },
  { lastName: "Макаров", firstName: "Ариан" },
  { lastName: "Мархеев", firstName: "Семен" },
  { lastName: "Нехоруков", firstName: "Сергей" },
  { lastName: "Никифоров", firstName: "Артем" },
  { lastName: "Николаев", firstName: "Григорий" },
  { lastName: "Оконешников", firstName: "Антон" },
  { lastName: "Павлов", firstName: "Виктор" },
  { lastName: "Павлов", firstName: "Данил" },
  { lastName: "Прокопьев", firstName: "Айаан" },
  { lastName: "Реев", firstName: "Пётр" },
  { lastName: "Семенов", firstName: "Максим" },
  { lastName: "Слепцов", firstName: "Далер" },
  { lastName: "Слепцов", firstName: "Иннокентий" },
  { lastName: "Смирников", firstName: "Николай" },
  { lastName: "Соловьев", firstName: "Айаал" },
  { lastName: "Уарова", firstName: "Сардаана" },
  { lastName: "Шабалин", firstName: "Сергей" },
  { lastName: "Шилов", firstName: "Ньургун" },
];

const DEMO_OIB25_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = OIB25_ROSTER.map((p, i) => ({
  email: `student${25 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: null,
  birthDate: new Date(2004, 1 + (i % 11), 1 + (i % 27)),
  specialty: OIB25_SPECIALTY,
  interests: "информационная безопасность, учебные задания CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${25 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 4, 19 + (i % 9), 16, (i * 3) % 60, 0)),
}));

/** Список «Назначено заданий» ИСИП-25 (Фамилия Имя). У второго «Смирников Николай» в профиле middleName «2», в отчёте — «Смирников Николай 2». */
const ISIP25_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Алексеев", firstName: "Габей", middleName: null },
  { lastName: "Алексеев", firstName: "Милан", middleName: null },
  { lastName: "Алексеев", firstName: "Эрчим", middleName: null },
  { lastName: "Арылахова", firstName: "Лилия", middleName: null },
  { lastName: "Ашихмин", firstName: "Павел", middleName: null },
  { lastName: "Бобровский", firstName: "Виталий", middleName: null },
  { lastName: "Васильев", firstName: "Ярослав", middleName: null },
  { lastName: "Габышев", firstName: "Андрей", middleName: null },
  { lastName: "Иванов", firstName: "Эдуард", middleName: null },
  { lastName: "Карамзин", firstName: "Вадим", middleName: null },
  { lastName: "Кириллин", firstName: "Арлен", middleName: null },
  { lastName: "Лизунов", firstName: "Михаил", middleName: null },
  { lastName: "Мирзоян", firstName: "Диана", middleName: null },
  { lastName: "Никитина", firstName: "Олеся", middleName: null },
  { lastName: "Никифоров", firstName: "Ларион", middleName: null },
  { lastName: "Никифоров", firstName: "Ньургун", middleName: null },
  { lastName: "Николаев", firstName: "Дьулуур", middleName: null },
  { lastName: "Ноговицын", firstName: "Альберт", middleName: null },
  { lastName: "Попов", firstName: "Герман", middleName: null },
  { lastName: "Попова", firstName: "Карина", middleName: null },
  { lastName: "Портнягина", firstName: "Наина", middleName: null },
  { lastName: "Прядезникова", firstName: "Диана", middleName: null },
  { lastName: "Семенов", firstName: "Роман", middleName: null },
  { lastName: "Смирников", firstName: "Николай", middleName: null },
  { lastName: "Смирников", firstName: "Николай", middleName: "2" },
  { lastName: "Соколов", firstName: "Егор", middleName: null },
  { lastName: "Спиридонова", firstName: "Лидия", middleName: null },
  { lastName: "Степанов", firstName: "Сергей", middleName: null },
  { lastName: "Сысолятин", firstName: "Иван", middleName: null },
  { lastName: "Таскин", firstName: "Валентин", middleName: null },
  { lastName: "Томская", firstName: "Сабина", middleName: null },
  { lastName: "Томчук", firstName: "Иван", middleName: null },
  { lastName: "Шадрин", firstName: "Артем", middleName: null },
  { lastName: "Яковлева", firstName: "Анжела", middleName: null },
];

const DEMO_ISIP25_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ISIP25_ROSTER.map((p, i) => ({
  email: `student${53 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2005, i % 12, 15),
  specialty: "Программист",
  interests: "программирование, информационная безопасность, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${53 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 4, 25 + (i % 8), 14, (i * 2) % 60, 0)),
}));

/** ИСИП-24/1, 2 курс, ГАПОУ «ЯКСИТ», программист (student87…student111). */
const ISIP24_1_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Андросова", firstName: "Аделита", middleName: null },
  { lastName: "Антонов", firstName: "Артур", middleName: null },
  { lastName: "Артемьев", firstName: "Эрсан", middleName: null },
  { lastName: "Борисов", firstName: "Арсений", middleName: null },
  { lastName: "Васильев", firstName: "Андрей", middleName: null },
  { lastName: "Воронина", firstName: "Анастасия", middleName: null },
  { lastName: "Габышев", firstName: "Альберт", middleName: null },
  { lastName: "Горохова", firstName: "Алина", middleName: null },
  { lastName: "Кардашевский", firstName: "Андрей", middleName: null },
  { lastName: "Кудинцева", firstName: "София", middleName: null },
  { lastName: "Лебедева", firstName: "Арина", middleName: null },
  { lastName: "Марков", firstName: "Александр", middleName: null },
  { lastName: "Николаева", firstName: "Анжелика", middleName: null },
  { lastName: "Новгородова", firstName: "Алеся", middleName: null },
  { lastName: "Павлов", firstName: "Альберт", middleName: null },
  { lastName: "Павлов", firstName: "Анатолий", middleName: null },
  { lastName: "Пестряков", firstName: "Сайаан", middleName: null },
  { lastName: "Семенов", firstName: "Артур", middleName: null },
  { lastName: "Суздалов", firstName: "Николай", middleName: null },
  { lastName: "Точенов", firstName: "Вадим", middleName: null },
  { lastName: "Тутукаров", firstName: "Арчылаан", middleName: null },
  { lastName: "Хорунова", firstName: "Кира", middleName: null },
  { lastName: "Цветков", firstName: "Андрей", middleName: null },
  { lastName: "Шадрина", firstName: "Саяна", middleName: null },
  { lastName: "Шарин", firstName: "Артур", middleName: null },
];

const DEMO_ISIP24_1_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ISIP24_1_ROSTER.map((p, i) => ({
  email: `student${87 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2004, i % 12, 15),
  specialty: "Программист",
  interests: "программирование, учебные задания CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${87 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 4, 28 + (i % 6), 15, (i * 3) % 60, 0)),
}));

/** ИСИП-24/2, 2 курс, ГАПОУ «ЯКСИТ», программист (student112…student133). */
const ISIP24_2_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Агеев", firstName: "Сергей", middleName: null },
  { lastName: "Алексеев", firstName: "Леонид", middleName: null },
  { lastName: "Беркин", firstName: "Иван", middleName: null },
  { lastName: "Бочкарев", firstName: "Виктор", middleName: null },
  { lastName: "Вандышева", firstName: "Валерия", middleName: null },
  { lastName: "Васильев", firstName: "Владислав", middleName: null },
  { lastName: "Власов", firstName: "Максим", middleName: null },
  { lastName: "Герасимов", firstName: "Сергей", middleName: null },
  { lastName: "Гордеев", firstName: "Сергей", middleName: null },
  { lastName: "Горохова", firstName: "Алина", middleName: null },
  { lastName: "Григорьев", firstName: "Марат", middleName: null },
  { lastName: "Дедюхин", firstName: "Андрей", middleName: null },
  { lastName: "Ёлчян", firstName: "Агаси", middleName: null },
  { lastName: "Жарникова", firstName: "Кира", middleName: null },
  { lastName: "Жирков", firstName: "Владислав", middleName: null },
  { lastName: "Кочеваров", firstName: "Данил", middleName: null },
  { lastName: "Лепеха", firstName: "Руслан", middleName: null },
  { lastName: "Николаевич", firstName: "Игорь", middleName: null },
  { lastName: "Попов", firstName: "Игорь", middleName: null },
  { lastName: "Слепцова", firstName: "Александрина", middleName: null },
  { lastName: "Усольцев", firstName: "Родион", middleName: null },
  { lastName: "Федотов", firstName: "Иван", middleName: null },
];

const DEMO_ISIP24_2_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ISIP24_2_ROSTER.map((p, i) => ({
  email: `student${112 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2004, (i + 3) % 12, 10 + (i % 18)),
  specialty: "Программист",
  interests: "программирование, учебные задания CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${112 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 4, 29 + (i % 5), 14, (i * 4) % 60, 0)),
}));

/** ЗКИСП-22, 5 курс, заочное отделение, НПОУ «ЯКИТ», программист (student134…student140). */
const ZKISP22_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Блешбаев", firstName: "Даурен", middleName: null },
  { lastName: "Владимиров", firstName: "Николай", middleName: null },
  { lastName: "Ефимов", firstName: "Константин", middleName: null },
  { lastName: "Жирков", firstName: "Петр", middleName: "Афанасьевич" },
  { lastName: "Окоемов", firstName: "Владимир", middleName: null },
  { lastName: "Степанов", firstName: "Александр", middleName: null },
  { lastName: "Устинов", firstName: "Степан", middleName: null },
];

const DEMO_ZKISP22_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ZKISP22_ROSTER.map((p, i) => ({
  email: `student${134 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2001, (i + 5) % 12, 5 + (i % 20)),
  specialty: "Программист",
  interests: "программирование, заочное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${134 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 1 + (i % 3), 13, (i * 5) % 60, 0)),
}));

/** ЗКИСП-23, 4 курс, заочное отделение, НПОУ «ЯКИТ», программист (student141…student146). */
const ZKISP23_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Аторин", firstName: "Вячеслав", middleName: null },
  { lastName: "Жаббаров", firstName: "Сергей", middleName: null },
  { lastName: "Колесников", firstName: "Семен", middleName: null },
  { lastName: "Константинов", firstName: "Александр", middleName: null },
  { lastName: "Максимова", firstName: "Мария", middleName: null },
  { lastName: "Певчих", firstName: "Сергей", middleName: "Григорьевич" },
];

const DEMO_ZKISP23_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ZKISP23_ROSTER.map((p, i) => ({
  email: `student${141 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2002, (i + 2) % 12, 8 + (i % 15)),
  specialty: "Программист",
  interests: "программирование, заочное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${141 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 4 + (i % 4), 12, (i * 6) % 60, 0)),
}));

/** ЗКИСП-25, 1 курс, заочное отделение, НПОУ «ЯКИТ», программист (student147…student159). */
const ZKISP25_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Белимов", firstName: "Тимур", middleName: "Станиславович" },
  { lastName: "Бурцев", firstName: "Александр", middleName: "Михайлович" },
  { lastName: "Иванов", firstName: "Андрей", middleName: "Иванович" },
  { lastName: "Иванов", firstName: "Станислав", middleName: "Яковлевич" },
  { lastName: "Канареев", firstName: "Руслан", middleName: "Юрьевич" },
  { lastName: "Киприянова", firstName: "Яна", middleName: "Ньургуновна" },
  { lastName: "Кравец", firstName: "Айаал", middleName: "Гаврильевич" },
  { lastName: "Пендюр", firstName: "Роман", middleName: "Дмитриевич" },
  { lastName: "Пестерев", firstName: "Иван", middleName: "Александрович" },
  { lastName: "Пьянков", firstName: "Артем", middleName: "Владимирович" },
  { lastName: "Спиридонов", firstName: "Дьулустан", middleName: "Александрович" },
  { lastName: "Старостин", firstName: "Николай", middleName: "Гаврильевич" },
  { lastName: "Федоров", firstName: "Владислав", middleName: "Геннадьевич" },
];

const DEMO_ZKISP25_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ZKISP25_ROSTER.map((p, i) => ({
  email: `student${147 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2007, (i + 1) % 12, 3 + (i % 25)),
  specialty: "Программист",
  interests: "программирование, заочное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${147 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 7 + (i % 5), 11, (i * 7) % 60, 0)),
}));

/** ЗКИСП-9-21, 5 курс, заочное отделение, НПОУ «ЯКИТ», программист (student160…student162). */
const ZKISP9_21_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Доржиева", firstName: "Нина", middleName: "Петровна" },
  { lastName: "Николаев", firstName: "Александр", middleName: "Евгеньевич" },
  { lastName: "Попова", firstName: "Ирина", middleName: "Николаевна" },
];

const DEMO_ZKISP9_21_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ZKISP9_21_ROSTER.map((p, i) => ({
  email: `student${160 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2000, (i + 4) % 12, 12 + (i % 17)),
  specialty: "Программист",
  interests: "программирование, заочное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${160 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 10 + (i % 3), 14, (i * 8) % 60, 0)),
}));

/** ЗКИСП-9-22, 4 курс, заочное отделение, НПОУ «ЯКИТ», программист (student163…student173). */
const ZKISP9_22_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Большаков", firstName: "Данил", middleName: "Васильевич" },
  { lastName: "Винокуров", firstName: "Виталий", middleName: "Александрович" },
  { lastName: "Иванов", firstName: "Гаврил", middleName: "Гаврильевич" },
  { lastName: "Колесов", firstName: "Игнатий", middleName: "Иванович" },
  { lastName: "Куцев", firstName: "Денис", middleName: "Андреевич" },
  { lastName: "Ломсадзе", firstName: "Эрик", middleName: "Зурабович" },
  { lastName: "Николаев", firstName: "Дмитрий", middleName: "Константинович" },
  { lastName: "Ощепков", firstName: "Дамир", middleName: "Валерьевич" },
  { lastName: "Привалов", firstName: "Александр", middleName: "Дмитриевич" },
  { lastName: "Спиридонов", firstName: "Константин", middleName: "Владимирович" },
  { lastName: "Шестаков", firstName: "Артур", middleName: "Петрович" },
];

const DEMO_ZKISP9_22_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = ZKISP9_22_ROSTER.map((p, i) => ({
  email: `student${163 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2001, (i + 3) % 12, 6 + (i % 22)),
  specialty: "Программист",
  interests: "программирование, заочное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${163 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 13 + (i % 5), 15, (i * 9) % 60, 0)),
}));

/** КИСП-23, 3 курс, очное отделение, НПОУ «ЯКИТ», программист (student174…student204). */
const KISP23_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Антоневич", firstName: "Артем", middleName: "Валерьевич" },
  { lastName: "Архангельский", firstName: "Вячеслав", middleName: "Вячеславович" },
  { lastName: "Борисов", firstName: "Айтал", middleName: "Артемович" },
  { lastName: "Борисов", firstName: "Кирилл", middleName: "Васильевич" },
  { lastName: "Былчахов", firstName: "Алексей", middleName: "Амирович" },
  { lastName: "Варламов", firstName: "Никита", middleName: "Андреевич" },
  { lastName: "Владимиров", firstName: "Гавриил", middleName: "Александрович" },
  { lastName: "Динганорбоев", firstName: "Эрдэм", middleName: "Булатович" },
  { lastName: "Еникеев", firstName: "Валерий", middleName: "Александрович" },
  { lastName: "Зенков", firstName: "Данил", middleName: "Константинович" },
  { lastName: "Илларионов", firstName: "Александр", middleName: "Илларионович" },
  { lastName: "Иннокентьев", firstName: "Влад", middleName: "Александрович" },
  { lastName: "Исаков", firstName: "Илья", middleName: "Игоревич" },
  { lastName: "Кондаков", firstName: "Виктор", middleName: "Михайлович" },
  { lastName: "Лебедева", firstName: "Лира", middleName: "Петровна" },
  { lastName: "Левин", firstName: "Артем", middleName: "Данилович" },
  { lastName: "Мандаров", firstName: "Артем", middleName: "Викторович" },
  { lastName: "Миронов", firstName: "Арсен", middleName: "Сергеевич" },
  { lastName: "Мордовской", firstName: "Алексей", middleName: "Александрович" },
  { lastName: "Николаев", firstName: "Аслан", middleName: "Анатольевич" },
  { lastName: "Огонерова", firstName: "Сардаана", middleName: "Васильевна" },
  { lastName: "Оконешников", firstName: "Родион", middleName: "Николаевич" },
  { lastName: "Павлуцкий", firstName: "Айсен", middleName: "Егорович" },
  { lastName: "Рожин", firstName: "Никита", middleName: "Егорович" },
  { lastName: "Романов", firstName: "Дмитрий", middleName: "Дмитриевич" },
  { lastName: "Сафаргалеев", firstName: "Владимир", middleName: "Владимирович" },
  { lastName: "Софронеев", firstName: "Айсен", middleName: "Петрович" },
  { lastName: "Степанов", firstName: "Мичил", middleName: "Васильевич" },
  { lastName: "Титович", firstName: "Александр", middleName: "Юрьевич" },
  { lastName: "Шестаков", firstName: "Дархан", middleName: "Алексеевич" },
  { lastName: "Яковлева", firstName: "Евгения", middleName: "Николаевна" },
];

const DEMO_KISP23_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = KISP23_ROSTER.map((p, i) => ({
  email: `student${174 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2005, (i + 2) % 12, 4 + (i % 24)),
  specialty: "Программист",
  interests: "программирование, очное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${174 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 14 + (i % 8), 13, (i * 5) % 60, 0)),
}));

/** КИСП-25, 1 курс, очное отделение, НПОУ «ЯКИТ», программист (student205…student226). */
const KISP25_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Андросов", firstName: "Эдуард", middleName: "Михайлович" },
  { lastName: "Бурнашов", firstName: "Руслан", middleName: "Игоревич" },
  { lastName: "Васильев", firstName: "Роберт", middleName: "Денисович" },
  { lastName: "Винокуров", firstName: "Илья", middleName: "Дьулустанович" },
  { lastName: "Гаврильева", firstName: "Анастасия", middleName: "Сергеевна" },
  { lastName: "Гафуров", firstName: "Артур", middleName: "Абдурахманович" },
  { lastName: "Григорьев", firstName: "Роберт", middleName: "Христофорович" },
  { lastName: "Гуляева", firstName: "Айлана", middleName: "Алтановна" },
  { lastName: "Дьяконов", firstName: "Виктор", middleName: "Андреевич" },
  { lastName: "Егоров", firstName: "Эрсан", middleName: "Сергеевич" },
  { lastName: "Иванова", firstName: "Алина", middleName: "Владимировна" },
  { lastName: "Кучер", firstName: "Михаил", middleName: "Михайлович" },
  { lastName: "Оконешников", firstName: "Максим", middleName: "Николаевич" },
  { lastName: "Омукова", firstName: "Туйара", middleName: "Викторовна" },
  { lastName: "Потапов", firstName: "Еремей", middleName: "Михайлович" },
  { lastName: "Прокопьев", firstName: "Максим", middleName: "Васильевич" },
  { lastName: "Ребров", firstName: "Эрхан", middleName: "Владимирович" },
  { lastName: "Ремпель", firstName: "Ангелина", middleName: "Николаевна" },
  { lastName: "Сафаров", firstName: "Руслан", middleName: "Махмудович" },
  { lastName: "Стальнов", firstName: "Евгений", middleName: "Викторович" },
  { lastName: "Тимофеев", firstName: "Айсен", middleName: "Никитич" },
  { lastName: "Третьякова", firstName: "Дарья", middleName: "Николаевна" },
];

const DEMO_KISP25_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = KISP25_ROSTER.map((p, i) => ({
  email: `student${205 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2007, (i + 5) % 12, 2 + (i % 26)),
  specialty: "Программист",
  interests: "программирование, очное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${205 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 17 + (i % 7), 12, (i * 7) % 60, 0)),
}));

/** КИСП-9-21, 4 курс, очное отделение, НПОУ «ЯКИТ», программист (student227…student240). */
const KISP9_21_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Аветисян", firstName: "Рубик", middleName: "Тигранович" },
  { lastName: "Андреев", firstName: "Айсен", middleName: "Федорович" },
  { lastName: "Антонов", firstName: "Викториан", middleName: "Гаврилович" },
  { lastName: "Асмаков", firstName: "Александр", middleName: "Романович" },
  { lastName: "Ахметзянов", firstName: "Ренат", middleName: "Артурович" },
  { lastName: "Бондарь", firstName: "Михаил", middleName: "Владимирович" },
  { lastName: "Васильев", firstName: "Вячеслав", middleName: "Альбертович" },
  { lastName: "Габышев", firstName: "Владимир", middleName: "Петрович" },
  { lastName: "Дмитриева", firstName: "Василина", middleName: "Анатольевна" },
  { lastName: "Заболоцкий", firstName: "Антон", middleName: "Константинович" },
  { lastName: "Ковалёв", firstName: "Никита", middleName: "Андреевич" },
  { lastName: "Кулагин", firstName: "Роман", middleName: "Александрович" },
  { lastName: "Малышев", firstName: "Александр", middleName: "Евгеньевич" },
  { lastName: "Местников", firstName: "Артем", middleName: "Денисович" },
];

const DEMO_KISP9_21_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = KISP9_21_ROSTER.map((p, i) => ({
  email: `student${227 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2004, (i + 1) % 12, 5 + (i % 23)),
  specialty: "Программист",
  interests: "программирование, очное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${227 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 18 + (i % 6), 14, (i * 6) % 60, 0)),
}));

/** КИСП-9-22, 4 курс, очное отделение, НПОУ «ЯКИТ», программист (student241…student253). */
const KISP9_22_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Зорин", firstName: "Даниил", middleName: "Иванович" },
  { lastName: "Коротков", firstName: "Игорь", middleName: "Антонович" },
  { lastName: "Лаптев", firstName: "Никита", middleName: "Сергеевич" },
  { lastName: "Мазуров", firstName: "Андрей", middleName: "Михайлович" },
  { lastName: "Мосеев", firstName: "Денис", middleName: "Ярославович" },
  { lastName: "Огородов", firstName: "Данил", middleName: "Витальевич" },
  { lastName: "Пальшин", firstName: "Артем", middleName: "Алексеевич" },
  { lastName: "Рачеев", firstName: "Никита", middleName: "Сергеевич" },
  { lastName: "Семенов", firstName: "Юрий", middleName: "Михайлович" },
  { lastName: "Слепцов", firstName: "Евгений", middleName: "Германович" },
  { lastName: "Степанов", firstName: "Руслан", middleName: "Сергеевич" },
  { lastName: "Тимирдяев", firstName: "Тускун", middleName: "Николаевич" },
  { lastName: "Цвикальский", firstName: "Артем", middleName: "Андреевич" },
];

const DEMO_KISP9_22_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = KISP9_22_ROSTER.map((p, i) => ({
  email: `student${241 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2004, (i + 4) % 12, 7 + (i % 21)),
  specialty: "Программист",
  interests: "программирование, очное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${241 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 19 + (i % 7), 13, (i * 8) % 60, 0)),
}));

/** КИСП-9-24, 2 курс, очное отделение, НПОУ «ЯКИТ», программист (student254…student265). */
const KISP9_24_ROSTER: ReadonlyArray<{ lastName: string; firstName: string; middleName: string | null }> = [
  { lastName: "Григорьев", firstName: "Олег", middleName: "Трофимович" },
  { lastName: "Заровняев", firstName: "Влад", middleName: "Николаевич" },
  { lastName: "Искаков", firstName: "Владислав", middleName: "Олегович" },
  { lastName: "Николаев", firstName: "Мирам", middleName: "Федорович" },
  { lastName: "Николаев", firstName: "Никон", middleName: "Аввакумович" },
  { lastName: "Ничипоренко", firstName: "Андрей", middleName: "Артемович" },
  { lastName: "Саввинов", firstName: "Василий", middleName: "Витальевич" },
  { lastName: "Седых", firstName: "Ярослав", middleName: "Кириллович" },
  { lastName: "Соколов", firstName: "Владислав", middleName: "Александрович" },
  { lastName: "Стифоров", firstName: "Тимур", middleName: "Сергеевич" },
  { lastName: "Цивилев", firstName: "Павел", middleName: "Сергеевич" },
  { lastName: "Яковлева", firstName: "Рада", middleName: "Иннокентьевна" },
];

const DEMO_KISP9_24_STUDENTS: ReadonlyArray<DemoStudentSeedRow> = KISP9_24_ROSTER.map((p, i) => ({
  email: `student${254 + i}@cyberedu.local`,
  lastName: p.lastName,
  firstName: p.firstName,
  middleName: p.middleName,
  birthDate: new Date(2006, (i + 2) % 12, 3 + (i % 25)),
  specialty: "Программист",
  interests: "программирование, очное обучение, CyberEdu",
  registeredAt: demoRegisteredAtBeforeApril4(`student${254 + i}@cyberedu.local`, i),
  certificateIssuedAt: new Date(Date.UTC(2026, 5, 20 + (i % 8), 14, (i * 9) % 60, 0)),
}));

const COURSE_TITLE = "Основы информационной безопасности";
const COURSE_DESCRIPTION =
  "Спокойный ввод в ИБ для колледжа: как думать о рисках, что делать в типичных ситуациях и как не навредить себе и данным. С тестами и безопасной практикой на платформе.";
const COURSE_HOURS = 36;

const MODULE_TITLES = [
  "Модуль 1. Основы информационной безопасности",
  "Модуль 2. Пароли и двухфакторная аутентификация",
  "Модуль 3. Фишинг и социальная инженерия",
  "Модуль 4. Безопасность устройств",
  "Модуль 5. Безопасность в интернете",
  "Модуль 6. Основы Linux и сетей",
  "Модуль 7. Криптография для новичков",
  "Модуль 8. Итоговое расследование",
] as const;

/** Дописывается к «Учебное заведение» у демо-студентов когорты КИ-25 (2 курс). */
const PROFILE_STUDENT_SCHOOL_SUFFIX = ", группа КИ-25, 2 курс";

/** Когорта КИ-24, 3 курс (student15…student24). */
const PROFILE_KI24_SCHOOL_SUFFIX = ", группа КИ-24, 3 курс";

/** ГАПОУ «ЯКСИТ», когорта ОИБ-25, 1 курс (student25…student52). */
const PROFILE_OIB25_BASE = "ГАПОУ «ЯКСИТ»";
const PROFILE_OIB25_SUFFIX = ", группа ОИБ-25, 1 курс";

/** ГАПОУ «ЯКСИТ», когорта ИСИП-25, 1 курс (student53…student86). */
const PROFILE_ISIP25_SUFFIX = ", группа ИСИП-25, 1 курс";

/** ГАПОУ «ЯКСИТ», когорта ИСИП-24/1, 2 курс (student87…student111). */
const PROFILE_ISIP24_1_SUFFIX = ", группа ИСИП-24/1, 2 курс";

/** ГАПОУ «ЯКСИТ», когорта ИСИП-24/2, 2 курс (student112…student133). */
const PROFILE_ISIP24_2_SUFFIX = ", группа ИСИП-24/2, 2 курс";

/** НПОУ «ЯКИТ», заочное отделение, группа ЗКИСП-22, 5 курс (student134…student140). */
const PROFILE_YAKIT_BASE = "НПОУ «ЯКИТ»";
const PROFILE_ZKISP22_SUFFIX = ", заочное отделение, группа ЗКИСП-22, 5 курс";
const PROFILE_ZKISP23_SUFFIX = ", заочное отделение, группа ЗКИСП-23, 4 курс";
const PROFILE_ZKISP25_SUFFIX = ", заочное отделение, группа ЗКИСП-25, 1 курс";
const PROFILE_ZKISP9_21_SUFFIX = ", заочное отделение, группа ЗКИСП-9-21, 5 курс";
const PROFILE_ZKISP9_22_SUFFIX = ", заочное отделение, группа ЗКИСП-9-22, 4 курс";
const PROFILE_KISP23_SUFFIX = ", очное отделение, группа КИСП-23, 3 курс";
const PROFILE_KISP25_SUFFIX = ", очное отделение, группа КИСП-25, 1 курс";
const PROFILE_KISP9_21_SUFFIX = ", очное отделение, группа КИСП-9-21, 4 курс";
const PROFILE_KISP9_22_SUFFIX = ", очное отделение, группа КИСП-9-22, 4 курс";
const PROFILE_KISP9_24_SUFFIX = ", очное отделение, группа КИСП-9-24, 2 курс";

/** Админ: организация и группа без курса обучения. */
const PROFILE_ADMIN_SCHOOL_LINE = "CyberEdu — администрирование платформы, группа КИ-25";

async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

function moduleShortDescription(orderNumber: number): string {
  const n = orderNumber;
  const lines: Record<number, string> = {
    1: "Три опоры безопасности данных, риск «по-человечески» и что делать, если письмо выглядит подозрительно.",
    2: "Пароли без самообмана, второй фактор и бытовые ловушки: где нас подводит лень и спешка.",
    3: "Фишинг и давление в переписке: как замедлиться и проверить канал, не навредив себе и группе.",
    4: "Обновления, блокировка экрана, резервные копии и чужие флешки — простыми словами и с чек-листом.",
    5: "Браузер, HTTPS, публичный Wi‑Fi и ссылки: отличить норму от подозрительного без паники.",
    6: "Учебная консоль: ping и слова из вывода. Никаких «магических» команд из интернета.",
    7: "Цезарь и Base64 как игрушечные модели плюс хеши — зачем сравнивают «отпечатки» файлов.",
    8: "Разбор учебного журнала: связать события и корректно сформулировать вывод стороны защиты.",
  };
  return lines[n] ?? `Модуль ${n} курса «${COURSE_TITLE}».`;
}

function testTitleForModule(moduleTitle: string): string {
  return `Контроль: ${moduleTitle}`;
}

/** 10 вопросов на модуль (3 базовых, 5 ситуационных, 2 на внимательность), сумма 100 баллов; проходной порог minScore = 70. */
function buildQuestionsForModule(moduleIndex: number): Prisma.QuestionCreateWithoutTestInput[] {
  return getModuleTestQuestions(moduleIndex);
}

async function seedUsers(): Promise<{ adminId: string; studentId: string }> {
  const [adminHash, studentHash] = await Promise.all([
    hashPassword(ADMIN_PASSWORD_PLAIN),
    hashPassword(STUDENT_PASSWORD_PLAIN),
  ]);

  const admin = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    create: {
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      role: Role.ADMIN,
      createdAt: ADMIN_REGISTERED_AT,
    },
    update: {
      passwordHash: adminHash,
      role: Role.ADMIN,
      createdAt: ADMIN_REGISTERED_AT,
    },
  });

  const student = await prisma.user.upsert({
    where: { email: STUDENT_EMAIL },
    create: {
      email: STUDENT_EMAIL,
      passwordHash: studentHash,
      role: Role.USER,
      createdAt: STUDENT_REGISTERED_AT,
    },
    update: {
      passwordHash: studentHash,
      role: Role.USER,
      createdAt: STUDENT_REGISTERED_AT,
    },
  });

  await prisma.profile.upsert({
    where: { userId: admin.id },
    create: {
      userId: admin.id,
      lastName: "Серверов",
      firstName: "Алексей",
      middleName: "Платформович",
      birthDate: new Date("1990-06-15"),
      educationalInstitution: PROFILE_ADMIN_SCHOOL_LINE,
      city: "Якутск",
      specialty: "Программист",
      interests: "учётные записи, аудит, поддержка пользователей",
    },
    update: {
      lastName: "Серверов",
      firstName: "Алексей",
      middleName: "Платформович",
      birthDate: new Date("1990-06-15"),
      educationalInstitution: PROFILE_ADMIN_SCHOOL_LINE,
      city: "Якутск",
      specialty: "Программист",
      interests: "учётные записи, аудит, поддержка пользователей",
    },
  });

  const collegeLine = `Якутский гуманитарный колледж${PROFILE_STUDENT_SCHOOL_SUFFIX}`;

  await prisma.profile.upsert({
    where: { userId: student.id },
    create: {
      userId: student.id,
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      birthDate: new Date("2005-01-01"),
      educationalInstitution: collegeLine,
      city: "Якутск",
      specialty: "Программист",
      interests: "игры, программирование, киберспорт",
    },
    update: {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      birthDate: new Date("2005-01-01"),
      educationalInstitution: collegeLine,
      city: "Якутск",
      specialty: "Программист",
      interests: "игры, программирование, киберспорт",
    },
  });

  return { adminId: admin.id, studentId: student.id };
}

function allDemoGraduateEmails(): string[] {
  return [
    STUDENT_EMAIL,
    ...DEMO_EXTRA_STUDENTS.map((r) => r.email),
    ...DEMO_KI24_STUDENTS.map((r) => r.email),
    ...DEMO_OIB25_STUDENTS.map((r) => r.email),
    ...DEMO_ISIP25_STUDENTS.map((r) => r.email),
    ...DEMO_ISIP24_1_STUDENTS.map((r) => r.email),
    ...DEMO_ISIP24_2_STUDENTS.map((r) => r.email),
    ...DEMO_ZKISP22_STUDENTS.map((r) => r.email),
    ...DEMO_ZKISP23_STUDENTS.map((r) => r.email),
    ...DEMO_ZKISP25_STUDENTS.map((r) => r.email),
    ...DEMO_ZKISP9_21_STUDENTS.map((r) => r.email),
    ...DEMO_ZKISP9_22_STUDENTS.map((r) => r.email),
    ...DEMO_KISP23_STUDENTS.map((r) => r.email),
    ...DEMO_KISP25_STUDENTS.map((r) => r.email),
    ...DEMO_KISP9_21_STUDENTS.map((r) => r.email),
    ...DEMO_KISP9_22_STUDENTS.map((r) => r.email),
    ...DEMO_KISP9_24_STUDENTS.map((r) => r.email),
  ];
}

async function upsertDemoStudentCohort(
  rows: ReadonlyArray<DemoStudentSeedRow>,
  educationalInstitution: string,
): Promise<number> {
  const studentHash = await hashPassword(STUDENT_PASSWORD_PLAIN);
  const city = "Якутск";

  for (const row of rows) {
    const user = await prisma.user.upsert({
      where: { email: row.email },
      create: {
        email: row.email,
        passwordHash: studentHash,
        role: Role.USER,
        createdAt: row.registeredAt,
      },
      update: {
        passwordHash: studentHash,
        role: Role.USER,
        createdAt: row.registeredAt,
      },
    });

    await prisma.profile.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        lastName: row.lastName,
        firstName: row.firstName,
        middleName: row.middleName,
        birthDate: row.birthDate,
        educationalInstitution,
        city,
        specialty: row.specialty,
        interests: row.interests,
      },
      update: {
        lastName: row.lastName,
        firstName: row.firstName,
        middleName: row.middleName,
        birthDate: row.birthDate,
        educationalInstitution,
        city,
        specialty: row.specialty,
        interests: row.interests,
      },
    });
  }

  return rows.length;
}

async function seedExtraDemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_EXTRA_STUDENTS,
    `Якутский гуманитарный колледж${PROFILE_STUDENT_SCHOOL_SUFFIX}`,
  );
}

async function seedKi24DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_KI24_STUDENTS,
    `Якутский гуманитарный колледж${PROFILE_KI24_SCHOOL_SUFFIX}`,
  );
}

async function seedOib25DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_OIB25_STUDENTS,
    `${PROFILE_OIB25_BASE}${PROFILE_OIB25_SUFFIX}`,
  );
}

async function seedIsip25DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ISIP25_STUDENTS,
    `${PROFILE_OIB25_BASE}${PROFILE_ISIP25_SUFFIX}`,
  );
}

async function seedIsip24_1DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ISIP24_1_STUDENTS,
    `${PROFILE_OIB25_BASE}${PROFILE_ISIP24_1_SUFFIX}`,
  );
}

async function seedIsip24_2DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ISIP24_2_STUDENTS,
    `${PROFILE_OIB25_BASE}${PROFILE_ISIP24_2_SUFFIX}`,
  );
}

async function seedZkisp22DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ZKISP22_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_ZKISP22_SUFFIX}`,
  );
}

async function seedZkisp23DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ZKISP23_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_ZKISP23_SUFFIX}`,
  );
}

async function seedZkisp25DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ZKISP25_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_ZKISP25_SUFFIX}`,
  );
}

async function seedZkisp9_21DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ZKISP9_21_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_ZKISP9_21_SUFFIX}`,
  );
}

async function seedZkisp9_22DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_ZKISP9_22_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_ZKISP9_22_SUFFIX}`,
  );
}

async function seedKisp23DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_KISP23_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_KISP23_SUFFIX}`,
  );
}

async function seedKisp25DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_KISP25_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_KISP25_SUFFIX}`,
  );
}

async function seedKisp9_21DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_KISP9_21_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_KISP9_21_SUFFIX}`,
  );
}

async function seedKisp9_22DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_KISP9_22_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_KISP9_22_SUFFIX}`,
  );
}

async function seedKisp9_24DemoStudents(): Promise<number> {
  return upsertDemoStudentCohort(
    DEMO_KISP9_24_STUDENTS,
    `${PROFILE_YAKIT_BASE}${PROFILE_KISP9_24_SUFFIX}`,
  );
}

/** Балл за модуль: у каждого пользователя свой разброс по модулям (52…100). */
function demoScoreForModule(userId: string, moduleId: string, moduleIndex: number): number {
  const h = demoHashUint32(`${userId}|${moduleId}|m${moduleIndex}`);
  return 52 + (h % 49);
}

/**
 * Временная шкала завершения модулей в апреле 2026: у каждого свой темп, даты растут по порядку модулей.
 */
function demoModuleCompletionTimeline(userId: string, moduleIds: string[]): Date[] {
  const salt = demoHashUint32(`${userId}|april26`);
  let t = Date.UTC(2026, 3, 1 + (salt % 5), 8 + (salt % 11), (salt >> 4) % 60, 0);
  const aprilEnd = Date.UTC(2026, 3, 30, 21, 30, 0);
  const out: Date[] = [];
  for (let i = 0; i < moduleIds.length; i++) {
    if (i > 0) {
      const gapHours = 5 + (demoHashUint32(`${userId}|gap|${moduleIds[i]}`) % 40);
      t += gapHours * 3600 * 1000;
    }
    if (t > aprilEnd) t = aprilEnd - (moduleIds.length - 1 - i) * 20 * 60 * 1000;
    out.push(new Date(t));
  }
  for (let i = 1; i < out.length; i++) {
    if (out[i]!.getTime() <= out[i - 1]!.getTime()) {
      out[i] = new Date(out[i - 1]!.getTime() + 45 * 60 * 1000);
    }
  }
  return out;
}

/** Доля демо-пользователей с завершённым курсом (100% модулей) и сертификатом; остальные — в процессе. */
const DEMO_FULL_COMPLETION_PERCENT = 90;

/** true — все модули закрыты (выпускник по сиду); false — частичный прогресс. `student@` всегда выпускник. */
function demoUserIsFullCourseGraduate(email: string, userId: string): boolean {
  if (email === STUDENT_EMAIL) return true;
  return demoHashUint32(`${userId}|graduate`) % 100 < DEMO_FULL_COMPLETION_PERCENT;
}

/** Для незавершивших курс: индекс первого «незакрытого» модуля (0…M−1); модули 0…i−1 полностью пройдены. */
function demoPartialFirstIncompleteIndex(userId: string, moduleCount: number): number {
  if (moduleCount <= 1) return 0;
  return demoHashUint32(`${userId}|incompleteIdx`) % moduleCount;
}

function demoPartialModuleFlags(userId: string, moduleIndex: number): {
  lessonCompleted: boolean;
  videoCompleted: boolean;
  testCompleted: boolean;
  practiceCompleted: boolean;
  moduleCompleted: boolean;
  score: number;
} {
  const h = demoHashUint32(`${userId}|partial|${moduleIndex}`);
  return {
    lessonCompleted: true,
    videoCompleted: (h % 4) !== 0,
    testCompleted: ((h >> 3) % 3) === 0,
    practiceCompleted: false,
    moduleCompleted: false,
    score: 12 + (h % 38),
  };
}

/** Дата сертификата: после последнего модуля, всё ещё в пределах апреля 2026. */
function demoCertificateIssuedAt(userId: string, lastModuleCompletedAt: Date): Date {
  const salt = demoHashUint32(`${userId}|cert`);
  const bump = (18 + (salt % 54)) * 3600 * 1000;
  const cap = Date.UTC(2026, 3, 30, 22, 45, 0);
  return new Date(Math.min(lastModuleCompletedAt.getTime() + bump, cap));
}

/**
 * Демо-прогресс: ~90% пользователей закрыли все модули (100% курса), остальные — частично (разная глубина).
 * Баллы и даты у полных прохождений по-прежнему различаются. Пользователи ADMIN не затрагиваются.
 */
async function seedFictitiousDemoProgress(courseId: string): Promise<void> {
  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  if (modules.length === 0) return;

  const demoEmails = allDemoGraduateEmails();
  const moduleIds = modules.map((m) => m.id);
  let fullCount = 0;
  let partialCount = 0;

  for (const email of demoEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!user || user.role !== Role.USER) continue;

    const graduate = demoUserIsFullCourseGraduate(email, user.id);
    const timeline = demoModuleCompletionTimeline(user.id, moduleIds);

    if (graduate) {
      fullCount += 1;
      for (let i = 0; i < modules.length; i++) {
        const moduleId = modules[i].id;
        const score = demoScoreForModule(user.id, moduleId, i);
        const completedAt = timeline[i]!;

        await prisma.progress.upsert({
          where: { userId_moduleId: { userId: user.id, moduleId } },
          create: {
            userId: user.id,
            moduleId,
            lessonCompleted: true,
            videoCompleted: true,
            testCompleted: true,
            practiceCompleted: true,
            moduleCompleted: true,
            score,
            createdAt: completedAt,
            updatedAt: completedAt,
          },
          update: {
            lessonCompleted: true,
            videoCompleted: true,
            testCompleted: true,
            practiceCompleted: true,
            moduleCompleted: true,
            score,
            createdAt: completedAt,
            updatedAt: completedAt,
          },
        });
      }
      continue;
    }

    partialCount += 1;
    await prisma.progress.deleteMany({
      where: { userId: user.id, moduleId: { in: moduleIds } },
    });

    const firstIncomplete = demoPartialFirstIncompleteIndex(user.id, modules.length);
    for (let i = 0; i < firstIncomplete; i++) {
      const moduleId = modules[i].id;
      const score = demoScoreForModule(user.id, moduleId, i);
      const completedAt = timeline[i]!;
      await prisma.progress.create({
        data: {
          userId: user.id,
          moduleId,
          lessonCompleted: true,
          videoCompleted: true,
          testCompleted: true,
          practiceCompleted: true,
          moduleCompleted: true,
          score,
          createdAt: completedAt,
          updatedAt: completedAt,
        },
      });
    }

    const m = modules[firstIncomplete];
    if (m) {
      const flags = demoPartialModuleFlags(user.id, firstIncomplete);
      const t = timeline[firstIncomplete]!;
      const activityAt = new Date(Math.max(t.getTime() - (2 + (demoHashUint32(user.id) % 5)) * 3600 * 1000, Date.UTC(2026, 3, 1)));
      await prisma.progress.create({
        data: {
          userId: user.id,
          moduleId: m.id,
          ...flags,
          createdAt: activityAt,
          updatedAt: activityAt,
        },
      });
    }
  }

  console.log(
    `Seed: демо-прогресс курса — полное прохождение (100%): ${fullCount}, в процессе: ${partialCount} (~${100 - DEMO_FULL_COMPLETION_PERCENT}% без сертификата); даты активности в апреле 2026.`,
  );
}

/** Демо-сертификат только у завершивших все модули; у остальных сертификат и бейдж снимаются. */
async function seedDemoCertificatesForGraduates(courseId: string): Promise<void> {
  const modules = await prisma.module.findMany({
    where: { courseId, isActive: true },
    orderBy: { orderNumber: "asc" },
    select: { id: true },
  });
  const moduleIds = modules.map((m) => m.id);

  const demoEmails = allDemoGraduateEmails();

  for (const email of demoEmails) {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, role: true },
    });
    if (!user || user.role !== Role.USER) continue;

    const rows = await prisma.progress.findMany({
      where: { userId: user.id, moduleId: { in: moduleIds } },
      select: { moduleId: true, moduleCompleted: true },
    });
    const byMod = new Map(rows.map((r) => [r.moduleId, r]));
    const allDone =
      modules.length > 0 && modules.every((mod) => byMod.get(mod.id)?.moduleCompleted === true);

    if (!allDone) {
      await prisma.certificate.deleteMany({ where: { userId: user.id, courseId } });
      await prisma.userAchievement.deleteMany({
        where: { userId: user.id, kind: "CERTIFICATE_EARNED" },
      });
      continue;
    }

    const timeline = demoModuleCompletionTimeline(user.id, moduleIds);
    const lastModuleAt = timeline[timeline.length - 1] ?? new Date(Date.UTC(2026, 3, 22, 12, 0, 0));
    const issuedAt =
      email === STUDENT_EMAIL
        ? new Date(Date.UTC(2026, 3, 18, 14, 30, 0))
        : demoCertificateIssuedAt(user.id, lastModuleAt);
    const certificateNumber = `CE-2026-DEMO-${user.id.slice(-10).toUpperCase()}`;
    const verificationCode = `VRFY-DEMO-${user.id.replace(/-/g, "").slice(0, 22)}`;

    await prisma.certificate.upsert({
      where: { userId_courseId: { userId: user.id, courseId } },
      create: {
        userId: user.id,
        courseId,
        certificateNumber,
        verificationCode,
        issuedAt,
      },
      update: {
        certificateNumber,
        verificationCode,
        issuedAt,
      },
    });

    await prisma.userAchievement.upsert({
      where: { userId_kind: { userId: user.id, kind: "CERTIFICATE_EARNED" } },
      create: { userId: user.id, kind: "CERTIFICATE_EARNED" },
      update: {},
    });
  }

  console.log("Seed: демо-сертификаты — только у завершивших все модули курса.");
}

function formatProfileReviewAuthorName(p: { lastName: string; firstName: string; middleName: string | null }): string {
  return [p.lastName, p.firstName, p.middleName].filter(Boolean).join(" ");
}


/**
 * Шаблоны текстов и оценок для демо-отзывов (назначаются выпускникам по хешу email).
 */
const GRADUATE_REVIEW_TEMPLATES: ReadonlyArray<{ rating: number; text: string }> = [
  { rating: 5, text: "Дошёл до конца, сертификат уже в портфолио. Модули логично цепляются друг за другом, практика после теории реально помогает запомнить. AI-наставник не «делает за тебя», а подсказывает — для меня это плюс." },
  { rating: 2, text: "Курс в итоге закончил, но тянулось тяжело: местами слишком плотно по тексту, а обратная связь по практике шла не так быстро, как хотелось. На троечку тянет, не больше." },
  { rating: 3, text: "Прошла полностью, сертификат получила. В целом нормально: базу по ИБ собрала, тесты адекватные. Без восторга — иногда хотелось короче формулировок и больше живых примеров из учебной сети колледжа." },
  { rating: 4, text: "Хороший рабочий курс: и лекции, и задания, и итоговый документ. Отняла балл только то, что к концу устала от однотипных формулировок в подсказках, но по содержанию всё честно и по делу." },
  { rating: 5, text: "Отлично структурировано: от простого к сложному, везде понятно, зачем этот шаг. Практика с ручной проверкой мотивировала не халтурить. После выдачи сертификата спокойно рассказываю одногруппникам, с чего начать ИБ." },
  { rating: 2, text: "Завершила курс из упрямства — в целом полезно, но ожидала большей гибкости по срокам и более разжёванных объяснений в паре модулей. За идею и сертификат спасибо, за подачу — на четвёрку не потянет." },
  { rating: 3, text: "Нормальный учебный трек: прошёл все модули, документ получил. Ни эйфории, ни разочарования — ровный рабочий материал для старта в теме безопасности." },
  { rating: 4, text: "Сдал полностью, баллы и сертификат на месте. За четыре звезды: понятная навигация, адекватные тесты, практика близкая к «жизни». Пятый балл не поставил из‑за редких мелких огрехов в формулировках заданий." },
  { rating: 4, text: "Курс прошёл до конца, сертификат забрал. Удобно, что всё в одном кабинете: лекция, тест, практика. Минус — иногда не хватало краткой шпаргалки в конце модуля." },
  { rating: 3, text: "Закрыл все модули, документ получил. По сути всё ок, но местами казалось затянуто. Для базового понимания ИБ на твёрдую «четвёрку» не хватило яркости примеров." },
  { rating: 5, text: "Очень понравилось, что нельзя «прокликать» практику бездумно — проверка реально заставляет думать. Курс полностью прошёл, сертификатом доволен." },
  { rating: 2, text: "Дошёл до сертификата, но опыт спорный: часть формулировок сухая, а ожидания по времени на практику занижены. Для галочки сойдёт, восторгом не делюсь." },
  { rating: 3, text: "Прошла курс целиком. Нормально для программы: тесты честные, по практике комментарии полезные. Без «вау», но знания по ИБ реально прибавились." },
  { rating: 4, text: "На третьем курсе как раз пригодился такой системный курс. Завершил полностью, сертификат приложу к портфолио. За минус — хотелось бы чуть больше видео, но текст хороший." },
  { rating: 5, text: "Сильная линейка модулей, всё связано с реальными ошибками пользователей. Прошёл до конца без «затыков». Сертификат — приятное подтверждение, что не зря вложился." },
  { rating: 2, text: "Курс закончил, но тяжеловато по нагрузке параллельно с парой. Иногда не хватало пошаговых подсказок в практике. Итог: полезно, но не идеально." },
  { rating: 3, text: "По специальности ОИБ материал зашёл: база закрыта, сертификат получил. Без пятерки — хотелось бы больше разборов «что делать, если уже попались» в бытовых сценариях." },
  { rating: 4, text: "Хорошо стыкуется с тем, что проходим в группе. Прошла все модули, к итоговому документу вопросов нет. Минус балл за то, что AI-подсказки иногда слишком общие." },
  { rating: 5, text: "Отличный порядок тем: от паролей до разборов. Практика после лекций — то, что нужно. Курс завершил, сертификатом доволен, преподавателю показал без стыда." },
  { rating: 4, text: "Как программисту, зашло сочетание «теория + руки». Прошёл полностью. Сертификат пригодится. Не пять звёзд только из‑за пары опечаток в заданиях." },
  { rating: 3, text: "Нормальный курс для общей грамотности по ИБ. Всё закрыл, документ выдали. Без восторга, но жаловаться не на что — ровно то, что обещали." },
  { rating: 5, text: "Очень понятная траектория, не расползается «водой». Дошёл до конца быстрее, чем ожидал. Сертификат — плюс к мотивации дальше копать тему." },
  { rating: 2, text: "Закончил курс, но местами было скучновато и много читать подряд. Практика спасает, но первые модули хотелось «поживее». На троечку с плюсом." },
  { rating: 5, text: "На втором курсе ИСИП как раз то, что нужно: и термины, и аккуратные сценарии. Прошла полностью, сертификат уже в папке с документами. Рекомендую группе." },
  { rating: 3, text: "В целом ок: прошёл, получил сертификат. Иногда не хватало короткого резюме после длинной лекции. Для базы по ИБ — нормально." },
  { rating: 4, text: "Хороший баланс теории и проверок. Все модули закрыл, к сертификату претензий нет. Звезду снял за то, что мобильная вёрстка местами прыгает." },
  { rating: 4, text: "Прошёл курс до конца, материал связный. Практика с обратной связью — сильная сторона. Не идеально, но уверенная четвёрка." },
  { rating: 2, text: "Сертификат получил, но вовлечённость просела к середине: много текста, мало «быстрых побед». Для обязательной программы сойдёт, сам бы не выбрал." },
  { rating: 5, text: "Отлично: и фишинг, и устройства, и сети — без перегруза. Закрыл всё, сертификат приятный бонус. Одногруппникам уже скинул ссылку." },
  { rating: 5, text: "Заочно учиться непросто, но здесь всё разложено по полочкам: понятно, что делать каждый день. Курс завершил, сертификат забрал — горжусь." },
  { rating: 3, text: "Прошла полностью на заочке. Нормально, без сюрпризов: тесты, практика, документ. Хотелось бы чуть больше голосовых/видео пояснений, но это вкусовщина." },
  { rating: 4, text: "Удобно совмещать с работой: чёткие дедлайны по модулям не дают забросить. Сертификат получил. Минус — иногда долгая загрузка страниц, на контент не влияет." },
  { rating: 2, text: "Дошёл до конца из-за зачёта. Полезные вещи есть, но подача местами сухая. Сертификат не компенсирует ощущение «протёрпел»." },
  { rating: 3, text: "Ровный курс: прошла, сертификат на руках. Ни восторга, ни разочарования — как хороший учебник, только интерактивный." },
  { rating: 5, text: "Для заочного формата — очень достойно: и структура, и проверка практики. Закрыл все модули, сертификатом доволен, буду использовать в резюме." },
  { rating: 4, text: "На старших курсах заочки материал заходит лучше, когда всё по шагам. Прошёл полностью. Документ получил — четвёрка с уверенностью." },
  { rating: 3, text: "Нормально для обязательного блока: база по ИБ закрыта, сертификат выдали. Без «вау», но претензий к честности курса нет." },
  { rating: 5, text: "Отлично выстроено под заочников: короткие сессии, понятные задания. Прошёл до конца без выгорания. Сертификат — приятное завершение." },
  { rating: 5, text: "Очно на парах часто не хватает времени на «глубину» — здесь как раз она есть. Все модули закрыл, сертификат показал куратору. Топ." },
  { rating: 2, text: "Курс закончил, но мотивация была только «чтобы сдать». Местами слишком много текста подряд, практика спасает. Итог — удовлетворительно." },
  { rating: 4, text: "Хорошо легло на первый курс: не перегружает, но и не «детский сад». Сертификат получил. Звезду снял за пару формулировок в тестах." },
  { rating: 3, text: "Прошёл полностью, документ на руках. Нормальный уровень, без лишней воды. Хотелось бы чуть больше визуализации в лекциях." },
  { rating: 5, text: "Сильная практическая часть — после неё теория «ложится» в голову. Закрыл всё, сертификатом доволен. Рекомендую потоку." },
  { rating: 2, text: "Сертификат есть, но вовлечение среднее: часть модулей ощущались как «прочитай и ответь». Для галочки подойдёт." },
  { rating: 3, text: "Ровный курс, прошёл до конца. Тесты справедливые, практика полезная. Четвёрку не ставлю из‑за ощущения «чуть не дожали» финал." },
  { rating: 4, text: "Хорошо стыкуется с очным расписанием: можно догнать дома. Сертификат получил. Минус — иногда неочевидно, где сохранился черновик практики." },
  { rating: 5, text: "Отличный итог для второго курса: и расследование, и «собрать картину» по логам — близко к тому, что обсуждаем на парах. Курс полностью прошёл." },
  { rating: 2, text: "Дошёл до сертификата, но устал от объёма чтения. Польза есть, но эмоций мало — скорее «отработал норму»." },
];

/**
 * Для каждого USER с сертификатом по курсу — upsert опубликованного отзыва (имя и вуз из профиля).
 */
async function seedPublishedReviewsFromCourseGraduates(courseId: string): Promise<void> {
  await prisma.review.deleteMany({ where: { userId: null } });

  const graduates = await prisma.user.findMany({
    where: {
      role: Role.USER,
      certificates: { some: { courseId } },
      profile: { isNot: null },
    },
    select: {
      id: true,
      email: true,
      profile: {
        select: {
          lastName: true,
          firstName: true,
          middleName: true,
          educationalInstitution: true,
        },
      },
      certificates: {
        where: { courseId },
        take: 1,
        select: { issuedAt: true },
      },
    },
    orderBy: { email: "asc" },
  });

  let n = 0;
  for (let i = 0; i < graduates.length; i++) {
    const u = graduates[i];
    const p = u.profile!;
    const tmpl = GRADUATE_REVIEW_TEMPLATES[demoHashUint32(`${u.email}:${i}`) % GRADUATE_REVIEW_TEMPLATES.length];
    const issued = u.certificates[0]?.issuedAt;
    const jitter = demoHashUint32(u.id) % 43_200_000;
    const createdAt = issued ? new Date(issued.getTime() + jitter) : new Date(Date.UTC(2026, 4, 10 + (i % 25), 10 + (i % 8), (i * 13) % 60, 0));

    const name = formatProfileReviewAuthorName(p);
    const educationalInstitution = p.educationalInstitution.trim() || "Учебное заведение";

    await prisma.review.upsert({
      where: { userId: u.id },
      create: {
        userId: u.id,
        name,
        educationalInstitution,
        rating: tmpl.rating,
        text: tmpl.text,
        isPublished: true,
        createdAt,
      },
      update: {
        name,
        educationalInstitution,
        rating: tmpl.rating,
        text: tmpl.text,
        isPublished: true,
      },
    });
    n += 1;
  }

  console.log(`Seed: опубликованные отзывы выпускников — upsert для ${n} пользователей (сертификат по курсу).`);
}

async function seedCourseTree(courseId: string): Promise<void> {
  for (let i = 0; i < MODULE_TITLES.length; i++) {
    const title = MODULE_TITLES[i];
    const orderNumber = i + 1;
    const practicalSeed = getPracticalTaskSeedForModule(i);
    const questions = buildQuestionsForModule(i);

    await prisma.module.upsert({
      where: {
        courseId_orderNumber: { courseId, orderNumber },
      },
      create: {
        courseId,
        orderNumber,
        title,
        description: moduleShortDescription(orderNumber),
        isActive: true,
        lessons: {
          create: [
            {
              title: `Лекция: ${title}`,
              content: getLessonMarkdown(i, title),
              videoUrl: null,
              allowAiAdaptation: true,
            },
          ],
        },
        tests: {
          create: [
            {
              title: testTitleForModule(title),
              minScore: 70,
              questions: { create: questions },
            },
          ],
        },
        practicalTasks: {
          create: [
            {
              title: practicalSeed.title,
              description: practicalSeed.description,
              taskType: practicalSeed.taskType,
              checkType: practicalSeed.checkType,
              maxScore: practicalSeed.maxScore,
              minLength: practicalSeed.minLength,
              instruction: practicalSeed.instruction,
              consoleScenario: practicalSeed.consoleScenario,
              expectedCommand: practicalSeed.expectedCommand,
              expectedAnswerPattern: practicalSeed.expectedAnswerPattern,
              interactiveExpectedAnswer: practicalSeed.interactiveExpectedAnswer,
              scenarioData: practicalSeed.scenarioData,
            },
          ],
        },
      },
      update: {
        title,
        description: moduleShortDescription(orderNumber),
        isActive: true,
      },
    });

    const moduleRow = await prisma.module.findUniqueOrThrow({
      where: { courseId_orderNumber: { courseId, orderNumber } },
      include: { lessons: true, tests: { include: { questions: true } }, practicalTasks: true },
    });

    const lesson = moduleRow.lessons[0];
    if (lesson) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          title: `Лекция: ${title}`,
          content: getLessonMarkdown(i, title),
          videoUrl: null,
          allowAiAdaptation: true,
        },
      });
    } else {
      await prisma.lesson.create({
        data: {
          moduleId: moduleRow.id,
          title: `Лекция: ${title}`,
          content: getLessonMarkdown(i, title),
          videoUrl: null,
          allowAiAdaptation: true,
        },
      });
    }

    const test = moduleRow.tests[0];
    if (test) {
      await prisma.test.update({
        where: { id: test.id },
        data: {
          title: testTitleForModule(title),
          minScore: 70,
        },
      });
      await prisma.question.deleteMany({ where: { testId: test.id } });
      for (const q of questions) {
        const { answers, ...qRest } = q;
        await prisma.question.create({
          data: {
            ...qRest,
            testId: test.id,
            answers: answers ?? undefined,
          },
        });
      }
    } else {
      await prisma.test.create({
        data: {
          moduleId: moduleRow.id,
          title: testTitleForModule(title),
          minScore: 70,
          questions: { create: questions },
        },
      });
    }

    const task = moduleRow.practicalTasks[0];
    if (task) {
      await prisma.practicalTask.update({
        where: { id: task.id },
        data: {
          title: practicalSeed.title,
          description: practicalSeed.description,
          taskType: practicalSeed.taskType,
          checkType: practicalSeed.checkType,
          maxScore: practicalSeed.maxScore,
          minLength: practicalSeed.minLength,
          instruction: practicalSeed.instruction,
          consoleScenario: practicalSeed.consoleScenario,
          expectedCommand: practicalSeed.expectedCommand,
          expectedAnswerPattern: practicalSeed.expectedAnswerPattern,
          interactiveExpectedAnswer: practicalSeed.interactiveExpectedAnswer,
          scenarioData: practicalSeed.scenarioData,
        },
      });
    } else {
      await prisma.practicalTask.create({
        data: {
          moduleId: moduleRow.id,
          title: practicalSeed.title,
          description: practicalSeed.description,
          taskType: practicalSeed.taskType,
          checkType: practicalSeed.checkType,
          maxScore: practicalSeed.maxScore,
          minLength: practicalSeed.minLength,
          instruction: practicalSeed.instruction,
          consoleScenario: practicalSeed.consoleScenario,
          expectedCommand: practicalSeed.expectedCommand,
          expectedAnswerPattern: practicalSeed.expectedAnswerPattern,
          interactiveExpectedAnswer: practicalSeed.interactiveExpectedAnswer,
          scenarioData: practicalSeed.scenarioData,
        },
      });
    }
  }
}

async function main(): Promise<void> {
  const { adminId, studentId } = await seedUsers();
  const extraN = await seedExtraDemoStudents();
  const ki24N = await seedKi24DemoStudents();
  const oib25N = await seedOib25DemoStudents();
  const isip25N = await seedIsip25DemoStudents();
  const isip24_1N = await seedIsip24_1DemoStudents();
  const isip24_2N = await seedIsip24_2DemoStudents();
  const zkisp22N = await seedZkisp22DemoStudents();
  const zkisp23N = await seedZkisp23DemoStudents();
  const zkisp25N = await seedZkisp25DemoStudents();
  const zkisp9_21N = await seedZkisp9_21DemoStudents();
  const zkisp9_22N = await seedZkisp9_22DemoStudents();
  const kisp23N = await seedKisp23DemoStudents();
  const kisp25N = await seedKisp25DemoStudents();
  const kisp9_21N = await seedKisp9_21DemoStudents();
  const kisp9_22N = await seedKisp9_22DemoStudents();
  const kisp9_24N = await seedKisp9_24DemoStudents();
  console.log(
    `Seed: пользователи готовы (admin=${adminId}, student=${studentId}, КИ-25=${extraN} student2…14, КИ-24=${ki24N} student15…24, ОИБ-25=${oib25N} student25…52, ИСИП-25=${isip25N} student53…86, ИСИП-24/1=${isip24_1N} student87…111, ИСИП-24/2=${isip24_2N} student112…133, ЗКИСП-22=${zkisp22N} student134…140, ЗКИСП-23=${zkisp23N} student141…146, ЗКИСП-25=${zkisp25N} student147…159, ЗКИСП-9-21=${zkisp9_21N} student160…162, ЗКИСП-9-22=${zkisp9_22N} student163…173, КИСП-23=${kisp23N} student174…204, КИСП-25=${kisp25N} student205…226, КИСП-9-21=${kisp9_21N} student227…240, КИСП-9-22=${kisp9_22N} student241…253, КИСП-9-24=${kisp9_24N} student254…265; 265 демо-студентов + course_progress по шестнадцати когортам).`,
  );

  let course = await prisma.course.findFirst({
    where: { title: COURSE_TITLE },
  });

  if (!course) {
    course = await prisma.course.create({
      data: {
        title: COURSE_TITLE,
        description: COURSE_DESCRIPTION,
        hours: COURSE_HOURS,
      },
    });
    console.log(`Seed: создан курс «${COURSE_TITLE}».`);
  } else {
    await prisma.course.update({
      where: { id: course.id },
      data: {
        description: COURSE_DESCRIPTION,
        hours: COURSE_HOURS,
      },
    });
    console.log(`Seed: курс «${COURSE_TITLE}» уже есть — обновлены описание и часы.`);
  }

  const moduleCount = await prisma.module.count({ where: { courseId: course.id } });
  if (moduleCount !== MODULE_TITLES.length) {
    if (moduleCount > 0) {
      console.warn(`Seed: ожидалось ${MODULE_TITLES.length} модулей, найдено ${moduleCount} — пересоздаю модули курса.`);
      await prisma.module.deleteMany({ where: { courseId: course.id } });
    }
    await seedCourseTree(course.id);
    console.log("Seed: модули, лекции, тесты и практика созданы.");
  } else {
    await seedCourseTree(course.id);
    console.log("Seed: структура курса синхронизирована (upsert модулей/контента).");
  }

  await seedFictitiousDemoProgress(course.id);
  await seedDemoCertificatesForGraduates(course.id);

  await seedPublishedReviewsFromCourseGraduates(course.id);

  console.log("Seed: готово. Пароли в БД только как bcrypt-хеши.");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
