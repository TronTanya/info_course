import Link from "next/link";

const links = [
  { href: "#what-you-learn", label: "Программа" },
  { href: "#modules", label: "Модули" },
  { href: "#practice-lab", label: "Практика" },
  { href: "/reviews", label: "Отзывы" },
  { href: "/about", label: "О проекте" },
  { href: "/auth/login", label: "Войти" },
] as const;

export function LandingFooter() {
  return (
    <footer className="ce-landing-footer mt-auto border-t border-border/80 bg-background/90">
      <div className="container-page flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold text-foreground">CyberEdu</p>
          <p className="mt-1 text-xs text-subtle-foreground">Cyber Lab · учебная платформа по ИБ</p>
        </div>
        <nav className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground" aria-label="Подвал">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors duration-200 hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="container-page border-t border-border/60 py-4">
        <p className="font-mono text-[10px] uppercase tracking-wider text-subtle-foreground">
          © {new Date().getFullYear()} CyberEdu · secure_mode=on · env=training
        </p>
      </div>
    </footer>
  );
}
