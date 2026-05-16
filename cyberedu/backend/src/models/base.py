from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Базовый класс моделей SQLAlchemy (таблицы добавятся при переносе схемы с Prisma)."""
