from __future__ import annotations

import enum


class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"


class ModuleDifficulty(str, enum.Enum):
    beginner = "beginner"
    intermediate = "intermediate"
    advanced = "advanced"


class LessonBlockType(str, enum.Enum):
    intro = "intro"
    why_it_matters = "why_it_matters"
    theory = "theory"
    example = "example"
    terms = "terms"
    beginner_mistake = "beginner_mistake"
    correct_action = "correct_action"
    mini_case = "mini_case"
    remember = "remember"
    summary = "summary"
    # оставлены для совместимости со старыми строками в БД
    warning = "warning"
    checklist = "checklist"


class QuestionType(str, enum.Enum):
    single_choice = "single_choice"
    multiple_choice = "multiple_choice"
    true_false = "true_false"
    matching = "matching"
    situation = "situation"
    text = "text"


class PracticalTaskType(str, enum.Enum):
    text_answer = "text_answer"
    file_upload = "file_upload"
    auto_check = "auto_check"
    training_console = "training_console"
    phishing_analysis = "phishing_analysis"
    url_analysis = "url_analysis"
    crypto_task = "crypto_task"
    log_analysis = "log_analysis"
    combined = "combined"


class CheckType(str, enum.Enum):
    auto = "auto"
    manual = "manual"
    mixed = "mixed"


class SubmissionStatus(str, enum.Enum):
    draft = "draft"
    submitted = "submitted"
    checking = "checking"
    accepted = "accepted"
    rejected = "rejected"
    needs_revision = "needs_revision"


class AiAdaptationMode(str, enum.Enum):
    simplify = "simplify"
    adapt_to_interests = "adapt_to_interests"
    example = "example"
    summary = "summary"


class AiMessageRole(str, enum.Enum):
    user = "user"
    assistant = "assistant"
    system = "system"
