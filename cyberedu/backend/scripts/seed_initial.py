"""
Начальное наполнение БД: пользователи, профиль, курс, модули, лекции, блоки, тесты, практика.

Запуск из каталога backend (нужен DATABASE_URL; зависимости из requirements.txt, включая psycopg):

  cd backend
  PYTHONPATH=src:. python3 scripts/seed_initial.py

Полная перезапись учебных данных и тестовых пользователей:

  PYTHONPATH=src:. python3 scripts/seed_initial.py --force
"""
from __future__ import annotations

import argparse
import sys
from pathlib import Path

_BACKEND = Path(__file__).resolve().parents[1]
_SRC = _BACKEND / "src"
for _p in (_SRC, _BACKEND):
    if str(_p) not in sys.path:
        sys.path.insert(0, str(_p))

from passlib.context import CryptContext
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from core.database import SessionLocal
from models.assessment import Answer, Question, Test
from models.course import Course, Lesson, LessonBlock, Module
from models.enums import (
    CheckType,
    LessonBlockType,
    ModuleDifficulty,
    PracticalTaskType,
    QuestionType,
    UserRole,
)
from models.practice import PracticalTask
from models.user import Profile, User

from scripts.seed_content import COURSE_SEED, MODULES_SEED

pwd_ctx = CryptContext(schemes=["bcrypt"], deprecated="auto")

_TR = """
TRUNCATE TABLE
  test_attempt_answers,
  test_attempts,
  answers,
  questions,
  tests,
  submissions,
  practical_tasks,
  ai_messages,
  ai_adaptations,
  progress,
  lesson_blocks,
  lessons,
  modules,
  certificates,
  achievements,
  reviews,
  glossary_terms,
  profiles,
  users,
  courses
RESTART IDENTITY CASCADE
"""


def truncate_all(session: Session) -> None:
    session.execute(text(_TR))
    session.commit()


def _coerce_enum(enum_cls, value: str):
    if isinstance(value, enum_cls):
        return value
    return enum_cls[value]


def upsert_seed_users(session: Session) -> tuple[User, User]:
    pairs = [
        ("admin@cyberedu.local", "Admin12345!", UserRole.admin),
        ("student@cyberedu.local", "Student12345!", UserRole.user),
    ]
    out: list[User] = []
    for email, password, role in pairs:
        u = session.scalar(select(User).where(User.email == email))
        if u is None:
            u = User(email=email, password_hash=pwd_ctx.hash(password), role=role)
            session.add(u)
        else:
            u.password_hash = pwd_ctx.hash(password)
            u.role = role
        out.append(u)
    session.flush()

    student = out[1]
    old_p = session.scalar(select(Profile).where(Profile.user_id == student.id))
    if old_p:
        session.delete(old_p)
        session.flush()

    session.add(
        Profile(
            user_id=student.id,
            last_name="Иванов",
            first_name="Иван",
            middle_name="Иванович",
            birth_date=__import__("datetime").date.fromisoformat("2005-01-01"),
            educational_institution="Тестовый колледж",
            city="Якутск",
            specialty="Информационные системы",
            interests="игры, программирование, киберспорт",
            avatar_url=None,
        )
    )
    session.flush()
    return out[0], student


def seed_course_tree(session: Session) -> None:
    course = Course(
        title=COURSE_SEED["title"],
        description=COURSE_SEED["description"],
        hours=COURSE_SEED["hours"],
    )
    session.add(course)
    session.flush()

    for spec in MODULES_SEED:
        mod = Module(
            course_id=course.id,
            title=spec["title"],
            description=spec.get("description"),
            order_number=spec["order"],
            difficulty=_coerce_enum(ModuleDifficulty, spec["difficulty"]),
            is_active=True,
        )
        session.add(mod)
        session.flush()

        lesson = Lesson(
            module_id=mod.id,
            title=spec["lesson_title"],
            intro=spec.get("lesson_intro"),
            content=spec["lesson_content"],
            summary=spec.get("lesson_summary"),
            video_url=None,
            allow_ai_adaptation=True,
        )
        session.add(lesson)
        session.flush()

        for b in spec["blocks"]:
            session.add(
                LessonBlock(
                    lesson_id=lesson.id,
                    block_type=_coerce_enum(LessonBlockType, b["type"]),
                    title=b.get("title"),
                    content=b["content"],
                    order_number=b["order"],
                )
            )

        test = Test(
            module_id=mod.id,
            title=spec["test_title"],
            description=spec.get("test_description"),
            min_score_percent=spec.get("min_score_percent", 70),
            max_attempts=3,
        )
        session.add(test)
        session.flush()

        for q in spec["questions"]:
            question = Question(
                test_id=test.id,
                question_text=q["text"],
                question_type=_coerce_enum(QuestionType, q["type"]),
                explanation=q.get("explanation"),
                points=q.get("points", 1),
                order_number=q["order"],
            )
            session.add(question)
            session.flush()
            for i, (txt, ok) in enumerate(q["answers"]):
                session.add(
                    Answer(
                        question_id=question.id,
                        answer_text=txt,
                        is_correct=ok,
                        order_number=i,
                    )
                )

        p = spec["practice"]
        session.add(
            PracticalTask(
                module_id=mod.id,
                title=p["title"],
                description=p["description"],
                task_type=_coerce_enum(PracticalTaskType, p["task_type"]),
                check_type=_coerce_enum(CheckType, p["check_type"]),
                difficulty=p.get("difficulty", "intermediate"),
                max_score=p.get("max_score", 10),
                expected_answer=p.get("expected_answer"),
                expected_command=p.get("expected_command"),
                expected_answer_pattern=p.get("expected_answer_pattern"),
                scenario_data=p.get("scenario_data"),
            )
        )


def main() -> None:
    parser = argparse.ArgumentParser(description="Seed CyberEdu PostgreSQL database")
    parser.add_argument(
        "--force",
        action="store_true",
        help="Очистить связанные таблицы (TRUNCATE … CASCADE) и загрузить данные заново",
    )
    args = parser.parse_args()

    session = SessionLocal()
    try:
        if args.force:
            truncate_all(session)
        else:
            exists = session.scalar(select(Course).where(Course.title == COURSE_SEED["title"]))
            if exists is not None:
                print(
                    "Seed уже выполнен: курс «%s» найден. "
                    "Для полной перезагрузки используйте --force." % COURSE_SEED["title"]
                )
                return

        upsert_seed_users(session)
        seed_course_tree(session)
        session.commit()
        print(
            "Готово: admin@cyberedu.local / student@cyberedu.local, профиль студента, "
            "курс и 8 модулей (лекции, блоки, тесты, практика)."
        )
    except Exception:
        session.rollback()
        raise
    finally:
        session.close()


if __name__ == "__main__":
    main()
