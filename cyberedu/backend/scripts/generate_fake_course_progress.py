#!/usr/bin/env python3
"""
Итоговый скрипт: генерация фиктивных прохождений курса и вставка в PostgreSQL (таблица course_progress).

Когорты (не пересекаются по ФИО):
  - КИ-25, 2 курс — 14 студентов (Prisma: student@ + student2…student14);
  - КИ-24, 3 курс — 10 студентов (Prisma: student15…student24);
  - ОИБ-25, 1 курс — 28 студентов (Prisma: student25…student52), ГАПОУ «ЯКСИТ»;
  - ИСИП-25, 1 курс — 34 студента (Prisma: student53…student86), ГАПОУ «ЯКСИТ», специальность программист;
  - ИСИП-24/1, 2 курс — 25 студентов (Prisma: student87…student111), ГАПОУ «ЯКСИТ», программист;
  - ИСИП-24/2, 2 курс — 22 студента (Prisma: student112…student133), ГАПОУ «ЯКСИТ», программист;
  - ЗКИСП-22, 5 курс, заочное отделение — 7 студентов (Prisma: student134…student140), НПОУ «ЯКИТ», программист;
  - ЗКИСП-23, 4 курс, заочное отделение — 6 студентов (Prisma: student141…student146), НПОУ «ЯКИТ», программист;
  - ЗКИСП-25, 1 курс, заочное отделение — 13 студентов (Prisma: student147…student159), НПОУ «ЯКИТ», программист;
  - ЗКИСП-9-21, 5 курс, заочное отделение — 3 студента (Prisma: student160…student162), НПОУ «ЯКИТ», программист;
  - ЗКИСП-9-22, 4 курс, заочное отделение — 11 студентов (Prisma: student163…student173), НПОУ «ЯКИТ», программист;
  - КИСП-23, 3 курс, очное отделение — 31 студент (Prisma: student174…student204), НПОУ «ЯКИТ», программист;
  - КИСП-25, 1 курс, очное отделение — 22 студента (Prisma: student205…student226), НПОУ «ЯКИТ», программист;
  - КИСП-9-21, 4 курс, очное отделение — 14 студентов (Prisma: student227…student240), НПОУ «ЯКИТ», программист;
  - КИСП-9-22, 4 курс, очное отделение — 13 студентов (Prisma: student241…student253), НПОУ «ЯКИТ», программист;
  - КИСП-9-24, 2 курс, очное отделение — 12 студентов (Prisma: student254…student265), НПОУ «ЯКИТ», программист.

Повторный запуск не удаляет строки: для каждого ФИО добавляется запись только если ещё нет строки
с теми же full_name, group_name, college, course и year.
Поле completed_at для новых строк — детерминированная дата в апреле 2026 (не «последние 30 дней»).

Запуск на Mac/Linux (нужны зависимости из requirements.txt, в т.ч. psycopg):

  cd cyberedu/backend
  python3 -m venv .venv
  .venv/bin/pip install -r requirements.txt

  export JWT_SECRET_KEY='dev-secret-change-me-in-production-min-32-chars!!'
  export DATABASE_URL='postgresql+psycopg://cyberedu:cyberedu_password@localhost:15432/cyberedu'
  PYTHONPATH=src .venv/bin/python scripts/generate_fake_course_progress.py

Или одной командой:  ./scripts/run_generate_fake.sh

Docker (зависимости уже в образе):
  docker compose exec backend sh -c 'cd /app && PYTHONPATH=src python3 scripts/generate_fake_course_progress.py'

Устаревший флаг --replace-students игнорируется (удаление строк отключено).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

sys.path.insert(0, str(Path(__file__).resolve().parent.parent / "src"))

COURSE = "Основы информационной безопасности"


@dataclass(frozen=True)
class Cohort:
    names: tuple[str, ...]
    group_name: str
    college: str
    year: int


# КИ-25, 2 курс — совпадает с Prisma seed (student@ + student2…student14).
STUDENTS_KI25: tuple[str, ...] = (
    "Баиров Савва Данилович",
    "Васильева Анжелика Романовна",
    "Владимирова Уйгулана Айсеновна",
    "Иванов Иван Иванович",
    "Корякина Капитолина Ивановна",
    "Ларионова Амелия Сергеевна",
    "Лукин Арчын Васильевич",
    "Маматкулов Имрон Жахонгирович",
    "Миронов Эрик Сергеевич",
    "Пермяков Афанасий",
    "Наумов Виталий Афанасьевич",
    "Слепцов Гаврил Алексеевич",
    "Слепцов Эрсан Арсентьевич",
    "Соловьева Кюннэй Вадимовна",
)

# КИ-24, 3 курс — совпадает с Prisma seed (student15…student24).
STUDENTS_KI24: tuple[str, ...] = (
    "Балаев Асман Яхьяевич",
    "Бурцев Максим Юрьевич",
    "Дмитриев Айсен Артёмович",
    "Мелентьев Максим Станиславович",
    "Находкин Дмитрий Романович",
    "Слепцов Виктор Александрович",
    "Соколов Никита Викторович",
    "Татаринова Надежда Иннокентьева",
    "Трушков Дмитрий Александрович",
    "Чернов Андрей Васильевич",
)

# ОИБ-25, 1 курс — ГАПОУ «ЯКСИТ» (Prisma: student25…student52).
STUDENTS_OIB25: tuple[str, ...] = (
    "Андросов Александр",
    "Апросимов Василий",
    "Афонский Марк",
    "Баишев Николай",
    "Батурин Антон",
    "Горбунов Никита",
    "Дорофеев Максим",
    "Иванов Иннокентий",
    "Иванова Александрина",
    "Колодезников Александр",
    "Макаров Ариан",
    "Мархеев Семен",
    "Нехоруков Сергей",
    "Никифоров Артем",
    "Николаев Григорий",
    "Оконешников Антон",
    "Павлов Виктор",
    "Павлов Данил",
    "Прокопьев Айаан",
    "Реев Пётр",
    "Семенов Максим",
    "Слепцов Далер",
    "Слепцов Иннокентий",
    "Смирников Николай",
    "Соловьев Айаал",
    "Уарова Сардаана",
    "Шабалин Сергей",
    "Шилов Ньургун",
)

# ИСИП-25, 1 курс — ГАПОУ «ЯКСИТ» (Prisma: student53…student86). Второй «Смирников Николай» — «… Николай 2» для уникальности в отчёте.
STUDENTS_ISIP25: tuple[str, ...] = (
    "Алексеев Габей",
    "Алексеев Милан",
    "Алексеев Эрчим",
    "Арылахова Лилия",
    "Ашихмин Павел",
    "Бобровский Виталий",
    "Васильев Ярослав",
    "Габышев Андрей",
    "Иванов Эдуард",
    "Карамзин Вадим",
    "Кириллин Арлен",
    "Лизунов Михаил",
    "Мирзоян Диана",
    "Никитина Олеся",
    "Никифоров Ларион",
    "Никифоров Ньургун",
    "Николаев Дьулуур",
    "Ноговицын Альберт",
    "Попов Герман",
    "Попова Карина",
    "Портнягина Наина",
    "Прядезникова Диана",
    "Семенов Роман",
    "Смирников Николай",
    "Смирников Николай 2",
    "Соколов Егор",
    "Спиридонова Лидия",
    "Степанов Сергей",
    "Сысолятин Иван",
    "Таскин Валентин",
    "Томская Сабина",
    "Томчук Иван",
    "Шадрин Артем",
    "Яковлева Анжела",
)

# ИСИП-24/1, 2 курс — ГАПОУ «ЯКСИТ» (Prisma: student87…student111).
STUDENTS_ISIP24_1: tuple[str, ...] = (
    "Андросова Аделита",
    "Антонов Артур",
    "Артемьев Эрсан",
    "Борисов Арсений",
    "Васильев Андрей",
    "Воронина Анастасия",
    "Габышев Альберт",
    "Горохова Алина",
    "Кардашевский Андрей",
    "Кудинцева София",
    "Лебедева Арина",
    "Марков Александр",
    "Николаева Анжелика",
    "Новгородова Алеся",
    "Павлов Альберт",
    "Павлов Анатолий",
    "Пестряков Сайаан",
    "Семенов Артур",
    "Суздалов Николай",
    "Точенов Вадим",
    "Тутукаров Арчылаан",
    "Хорунова Кира",
    "Цветков Андрей",
    "Шадрина Саяна",
    "Шарин Артур",
)

# ИСИП-24/2, 2 курс — ГАПОУ «ЯКСИТ» (Prisma: student112…student133).
STUDENTS_ISIP24_2: tuple[str, ...] = (
    "Агеев Сергей",
    "Алексеев Леонид",
    "Беркин Иван",
    "Бочкарев Виктор",
    "Вандышева Валерия",
    "Васильев Владислав",
    "Власов Максим",
    "Герасимов Сергей",
    "Гордеев Сергей",
    "Горохова Алина",
    "Григорьев Марат",
    "Дедюхин Андрей",
    "Ёлчян Агаси",
    "Жарникова Кира",
    "Жирков Владислав",
    "Кочеваров Данил",
    "Лепеха Руслан",
    "Николаевич Игорь",
    "Попов Игорь",
    "Слепцова Александрина",
    "Усольцев Родион",
    "Федотов Иван",
)

# ЗКИСП-22, 5 курс, заочное отделение — НПОУ «ЯКИТ» (Prisma: student134…student140). ФИО как в Prisma Profile (для user_id).
STUDENTS_ZKISP22: tuple[str, ...] = (
    "Блешбаев Даурен",
    "Владимиров Николай",
    "Ефимов Константин",
    "Жирков Петр Афанасьевич",
    "Окоемов Владимир",
    "Степанов Александр",
    "Устинов Степан",
)

# ЗКИСП-23, 4 курс, заочное отделение — НПОУ «ЯКИТ» (Prisma: student141…student146). ФИО как в Prisma Profile.
STUDENTS_ZKISP23: tuple[str, ...] = (
    "Аторин Вячеслав",
    "Жаббаров Сергей",
    "Колесников Семен",
    "Константинов Александр",
    "Максимова Мария",
    "Певчих Сергей Григорьевич",
)

# ЗКИСП-25, 1 курс, заочное отделение — НПОУ «ЯКИТ» (Prisma: student147…student159). ФИО как в Prisma Profile.
STUDENTS_ZKISP25: tuple[str, ...] = (
    "Белимов Тимур Станиславович",
    "Бурцев Александр Михайлович",
    "Иванов Андрей Иванович",
    "Иванов Станислав Яковлевич",
    "Канареев Руслан Юрьевич",
    "Киприянова Яна Ньургуновна",
    "Кравец Айаал Гаврильевич",
    "Пендюр Роман Дмитриевич",
    "Пестерев Иван Александрович",
    "Пьянков Артем Владимирович",
    "Спиридонов Дьулустан Александрович",
    "Старостин Николай Гаврильевич",
    "Федоров Владислав Геннадьевич",
)

# ЗКИСП-9-21, 5 курс, заочное отделение — НПОУ «ЯКИТ» (Prisma: student160…student162). ФИО как в Prisma Profile.
STUDENTS_ZKISP9_21: tuple[str, ...] = (
    "Доржиева Нина Петровна",
    "Николаев Александр Евгеньевич",
    "Попова Ирина Николаевна",
)

# ЗКИСП-9-22, 4 курс, заочное отделение — НПОУ «ЯКИТ» (Prisma: student163…student173). ФИО как в Prisma Profile.
STUDENTS_ZKISP9_22: tuple[str, ...] = (
    "Большаков Данил Васильевич",
    "Винокуров Виталий Александрович",
    "Иванов Гаврил Гаврильевич",
    "Колесов Игнатий Иванович",
    "Куцев Денис Андреевич",
    "Ломсадзе Эрик Зурабович",
    "Николаев Дмитрий Константинович",
    "Ощепков Дамир Валерьевич",
    "Привалов Александр Дмитриевич",
    "Спиридонов Константин Владимирович",
    "Шестаков Артур Петрович",
)

# КИСП-23, 3 курс, очное отделение — НПОУ «ЯКИТ» (Prisma: student174…student204). ФИО как в Prisma Profile.
STUDENTS_KISP23: tuple[str, ...] = (
    "Антоневич Артем Валерьевич",
    "Архангельский Вячеслав Вячеславович",
    "Борисов Айтал Артемович",
    "Борисов Кирилл Васильевич",
    "Былчахов Алексей Амирович",
    "Варламов Никита Андреевич",
    "Владимиров Гавриил Александрович",
    "Динганорбоев Эрдэм Булатович",
    "Еникеев Валерий Александрович",
    "Зенков Данил Константинович",
    "Илларионов Александр Илларионович",
    "Иннокентьев Влад Александрович",
    "Исаков Илья Игоревич",
    "Кондаков Виктор Михайлович",
    "Лебедева Лира Петровна",
    "Левин Артем Данилович",
    "Мандаров Артем Викторович",
    "Миронов Арсен Сергеевич",
    "Мордовской Алексей Александрович",
    "Николаев Аслан Анатольевич",
    "Огонерова Сардаана Васильевна",
    "Оконешников Родион Николаевич",
    "Павлуцкий Айсен Егорович",
    "Рожин Никита Егорович",
    "Романов Дмитрий Дмитриевич",
    "Сафаргалеев Владимир Владимирович",
    "Софронеев Айсен Петрович",
    "Степанов Мичил Васильевич",
    "Титович Александр Юрьевич",
    "Шестаков Дархан Алексеевич",
    "Яковлева Евгения Николаевна",
)

# КИСП-25, 1 курс, очное отделение — НПОУ «ЯКИТ» (Prisma: student205…student226). ФИО как в Prisma Profile.
STUDENTS_KISP25: tuple[str, ...] = (
    "Андросов Эдуард Михайлович",
    "Бурнашов Руслан Игоревич",
    "Васильев Роберт Денисович",
    "Винокуров Илья Дьулустанович",
    "Гаврильева Анастасия Сергеевна",
    "Гафуров Артур Абдурахманович",
    "Григорьев Роберт Христофорович",
    "Гуляева Айлана Алтановна",
    "Дьяконов Виктор Андреевич",
    "Егоров Эрсан Сергеевич",
    "Иванова Алина Владимировна",
    "Кучер Михаил Михайлович",
    "Оконешников Максим Николаевич",
    "Омукова Туйара Викторовна",
    "Потапов Еремей Михайлович",
    "Прокопьев Максим Васильевич",
    "Ребров Эрхан Владимирович",
    "Ремпель Ангелина Николаевна",
    "Сафаров Руслан Махмудович",
    "Стальнов Евгений Викторович",
    "Тимофеев Айсен Никитич",
    "Третьякова Дарья Николаевна",
)

# КИСП-9-21, 4 курс, очное отделение — НПОУ «ЯКИТ» (Prisma: student227…student240). ФИО как в Prisma Profile.
STUDENTS_KISP9_21: tuple[str, ...] = (
    "Аветисян Рубик Тигранович",
    "Андреев Айсен Федорович",
    "Антонов Викториан Гаврилович",
    "Асмаков Александр Романович",
    "Ахметзянов Ренат Артурович",
    "Бондарь Михаил Владимирович",
    "Васильев Вячеслав Альбертович",
    "Габышев Владимир Петрович",
    "Дмитриева Василина Анатольевна",
    "Заболоцкий Антон Константинович",
    "Ковалёв Никита Андреевич",
    "Кулагин Роман Александрович",
    "Малышев Александр Евгеньевич",
    "Местников Артем Денисович",
)

# КИСП-9-22, 4 курс, очное отделение — НПОУ «ЯКИТ» (Prisma: student241…student253). ФИО как в Prisma Profile.
STUDENTS_KISP9_22: tuple[str, ...] = (
    "Зорин Даниил Иванович",
    "Коротков Игорь Антонович",
    "Лаптев Никита Сергеевич",
    "Мазуров Андрей Михайлович",
    "Мосеев Денис Ярославович",
    "Огородов Данил Витальевич",
    "Пальшин Артем Алексеевич",
    "Рачеев Никита Сергеевич",
    "Семенов Юрий Михайлович",
    "Слепцов Евгений Германович",
    "Степанов Руслан Сергеевич",
    "Тимирдяев Тускун Николаевич",
    "Цвикальский Артем Андреевич",
)

# КИСП-9-24, 2 курс, очное отделение — НПОУ «ЯКИТ» (Prisma: student254…student265). ФИО как в Prisma Profile.
STUDENTS_KISP9_24: tuple[str, ...] = (
    "Григорьев Олег Трофимович",
    "Заровняев Влад Николаевич",
    "Искаков Владислав Олегович",
    "Николаев Мирам Федорович",
    "Николаев Никон Аввакумович",
    "Ничипоренко Андрей Артемович",
    "Саввинов Василий Витальевич",
    "Седых Ярослав Кириллович",
    "Соколов Владислав Александрович",
    "Стифоров Тимур Сергеевич",
    "Цивилев Павел Сергеевич",
    "Яковлева Рада Иннокентьевна",
)

COHORTS: tuple[Cohort, ...] = (
    Cohort(
        STUDENTS_KI25,
        "КИ-25",
        "Якутский гуманитарный колледж, группа КИ-25, 2 курс",
        2,
    ),
    Cohort(
        STUDENTS_KI24,
        "КИ-24",
        "Якутский гуманитарный колледж, группа КИ-24, 3 курс",
        3,
    ),
    Cohort(
        STUDENTS_OIB25,
        "ОИБ-25",
        "ГАПОУ «ЯКСИТ», группа ОИБ-25, 1 курс",
        1,
    ),
    Cohort(
        STUDENTS_ISIP25,
        "ИСИП-25",
        "ГАПОУ «ЯКСИТ», группа ИСИП-25, 1 курс",
        1,
    ),
    Cohort(
        STUDENTS_ISIP24_1,
        "ИСИП-24/1",
        "ГАПОУ «ЯКСИТ», группа ИСИП-24/1, 2 курс",
        2,
    ),
    Cohort(
        STUDENTS_ISIP24_2,
        "ИСИП-24/2",
        "ГАПОУ «ЯКСИТ», группа ИСИП-24/2, 2 курс",
        2,
    ),
    Cohort(
        STUDENTS_ZKISP22,
        "ЗКИСП-22",
        "НПОУ «ЯКИТ», заочное отделение, группа ЗКИСП-22, 5 курс",
        5,
    ),
    Cohort(
        STUDENTS_ZKISP23,
        "ЗКИСП-23",
        "НПОУ «ЯКИТ», заочное отделение, группа ЗКИСП-23, 4 курс",
        4,
    ),
    Cohort(
        STUDENTS_ZKISP25,
        "ЗКИСП-25",
        "НПОУ «ЯКИТ», заочное отделение, группа ЗКИСП-25, 1 курс",
        1,
    ),
    Cohort(
        STUDENTS_ZKISP9_21,
        "ЗКИСП-9-21",
        "НПОУ «ЯКИТ», заочное отделение, группа ЗКИСП-9-21, 5 курс",
        5,
    ),
    Cohort(
        STUDENTS_ZKISP9_22,
        "ЗКИСП-9-22",
        "НПОУ «ЯКИТ», заочное отделение, группа ЗКИСП-9-22, 4 курс",
        4,
    ),
    Cohort(
        STUDENTS_KISP23,
        "КИСП-23",
        "НПОУ «ЯКИТ», очное отделение, группа КИСП-23, 3 курс",
        3,
    ),
    Cohort(
        STUDENTS_KISP25,
        "КИСП-25",
        "НПОУ «ЯКИТ», очное отделение, группа КИСП-25, 1 курс",
        1,
    ),
    Cohort(
        STUDENTS_KISP9_21,
        "КИСП-9-21",
        "НПОУ «ЯКИТ», очное отделение, группа КИСП-9-21, 4 курс",
        4,
    ),
    Cohort(
        STUDENTS_KISP9_22,
        "КИСП-9-22",
        "НПОУ «ЯКИТ», очное отделение, группа КИСП-9-22, 4 курс",
        4,
    ),
    Cohort(
        STUDENTS_KISP9_24,
        "КИСП-9-24",
        "НПОУ «ЯКИТ», очное отделение, группа КИСП-9-24, 2 курс",
        2,
    ),
)


def _deps_help() -> None:
    root = Path(__file__).resolve().parent.parent
    print(
        "Не найден драйвер psycopg (или другие зависимости SQLAlchemy).\n"
        f"  cd {root}\n"
        "  python3 -m venv .venv\n"
        "  .venv/bin/pip install -r requirements.txt\n"
        "  ./scripts/run_generate_fake.sh\n",
        file=sys.stderr,
    )


def completed_at_april_2026_deterministic(person_key: str) -> datetime:
    """Дата «завершения» в апреле 2026, стабильная для ключа (ФИО+группа)."""
    digest = hashlib.sha256(person_key.encode("utf-8")).digest()
    n = int.from_bytes(digest[:8], "little")
    start = datetime(2026, 4, 1, 0, 0, 0, tzinfo=timezone.utc)
    span_seconds = 29 * 24 * 60 * 60
    return start + timedelta(seconds=n % span_seconds)


def deterministic_errors_json(person_key: str) -> str | None:
    """0–3 ошибки в JSON; стабильно от ключа, часть записей без ошибок."""
    n = int.from_bytes(hashlib.sha256(person_key.encode("utf-8")).digest()[:4], "little")
    k = n % 5
    if k == 0:
        return None
    err_count = 1 + (k % 3)
    payload = [f"Ошибка {i}" for i in range(1, err_count + 1)]
    return json.dumps(payload, ensure_ascii=False)


def normalize_fio(s: str) -> str:
    return " ".join(s.split()).casefold()


def load_prisma_fio_to_user_id(session: Any) -> dict[str, str]:
    """Сопоставление нормализованного ФИО из Prisma Profile → User.id (TEXT)."""
    try:
        from sqlalchemy import text

        rows = session.execute(
            text(
                'SELECT u."id", p."lastName", p."firstName", p."middleName" '
                'FROM "User" u '
                'INNER JOIN "Profile" p ON p."userId" = u."id"'
            )
        ).all()
    except Exception:
        return {}
    out: dict[str, str] = {}
    for row in rows:
        uid, ln, fn, mn = row[0], row[1], row[2], row[3]
        fio = " ".join(x for x in (ln, fn, mn or "") if x).strip()
        if not fio:
            continue
        out[normalize_fio(fio)] = uid
    return out


def _row_already_exists(
    session: Any,
    CourseProgress: type[Any],
    *,
    full_name: str,
    group_name: str,
    college: str,
    year: int,
) -> bool:
    from sqlalchemy import select

    stmt = (
        select(CourseProgress.id)
        .where(
            CourseProgress.full_name == full_name,
            CourseProgress.group_name == group_name,
            CourseProgress.college == college,
            CourseProgress.course == COURSE,
            CourseProgress.year == year,
        )
        .limit(1)
    )
    return session.execute(stmt).first() is not None


def insert_cohort(
    session: Any,
    CourseProgress: type[Any],
    cohort: Cohort,
    fio_map: dict[str, str],
) -> tuple[int, int]:
    to_add: list[Any] = []
    skipped = 0

    for name in cohort.names:
        if _row_already_exists(
            session,
            CourseProgress,
            full_name=name,
            group_name=cohort.group_name,
            college=cohort.college,
            year=cohort.year,
        ):
            skipped += 1
            continue
        person_key = f"{cohort.group_name}\u0000{name}"
        to_add.append(
            CourseProgress(
                user_id=fio_map.get(normalize_fio(name)),
                full_name=name,
                group_name=cohort.group_name,
                college=cohort.college,
                course=COURSE,
                year=cohort.year,
                completed_at=completed_at_april_2026_deterministic(person_key),
                errors=deterministic_errors_json(person_key),
            )
        )

    if to_add:
        session.add_all(to_add)
        session.commit()
    return len(to_add), skipped


def insert_all_cohorts(session: Any, CourseProgress: type[Any], *, replace_students: bool) -> tuple[int, int]:
    if replace_students:
        print(
            "Предупреждение: --replace-students устарел и игнорируется; "
            "строки не удаляются, добавляются только отсутствующие.",
            file=sys.stderr,
        )

    fio_map = load_prisma_fio_to_user_id(session)
    total_added = 0
    total_skipped = 0
    for cohort in COHORTS:
        added, skipped = insert_cohort(session, CourseProgress, cohort, fio_map)
        total_added += added
        total_skipped += skipped
    return total_added, total_skipped


def main() -> None:
    parser = argparse.ArgumentParser(description="Генерация и INSERT фиктивных course_progress (только добавление).")
    parser.add_argument(
        "--replace-students",
        action="store_true",
        help=argparse.SUPPRESS,
    )
    args = parser.parse_args()

    if not os.environ.get("DATABASE_URL"):
        print("Задайте DATABASE_URL (и JWT_SECRET_KEY для загрузки настроек).", file=sys.stderr)
        sys.exit(1)
    try:
        from core.database import SessionLocal
        from models.course_progress import CourseProgress
    except ModuleNotFoundError as e:
        name = getattr(e, "name", "") or str(e)
        if "psycopg" in name.lower() or "psycopg" in str(e).lower():
            _deps_help()
        raise
    db = SessionLocal()
    try:
        added, skipped = insert_all_cohorts(db, CourseProgress, replace_students=args.replace_students)
        print(f"Добавлено записей: {added}, пропущено (уже есть): {skipped}")
    finally:
        db.close()


if __name__ == "__main__":
    main()
