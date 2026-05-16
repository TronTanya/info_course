-- Один отзыв на авторизованного пользователя; несколько анонимных (userId NULL) допустимы.
DROP INDEX IF EXISTS "Review_userId_idx";

CREATE UNIQUE INDEX "Review_userId_key" ON "Review"("userId");
