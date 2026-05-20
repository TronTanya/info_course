/**
 * Tailwind CSS v4 — конфигурация через PostCSS (отдельного tailwind.config.* нет).
 * Токены и @theme — app/design-tokens.css + app/globals.css.
 */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
  },
};

export default config;
