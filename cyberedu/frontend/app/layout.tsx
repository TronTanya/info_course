import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: true,
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "600", "700"],
  display: "swap",
  preload: false,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin", "cyrillic"],
  display: "swap",
  preload: false,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "CyberEdu — платформа кибербезопасности с AI",
    template: "%s · CyberEdu",
  },
  description:
    "Модули, SOC-лаборатории, тесты, AI-наставник и сертификация — премиальная среда обучения информационной безопасности.",
  openGraph: {
    type: "website",
    locale: "ru_RU",
    siteName: "CyberEdu",
    title: "CyberEdu — платформа кибербезопасности с AI",
    description:
      "Академия кибербезопасности: теория, SOC-практика, AI-наставник и официальный сертификат.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CyberEdu",
    description: "Обучение информационной безопасности с AI-наставником и SOC-лабораториями",
  },
  icons: {
    icon: [{ url: "/brand/favicon.svg", type: "image/svg+xml" }],
  },
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('ce-theme');var d=true;if(t==='light')d=false;else if(t==='system'&&window.matchMedia('(prefers-color-scheme: light)').matches)d=false;document.documentElement.classList.toggle('dark',d);document.documentElement.style.colorScheme=d?'dark':'light';}catch(e){document.documentElement.classList.add('dark');}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} dark h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="ce-premium-app min-h-full min-w-0 overflow-x-hidden bg-background font-sans text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-200 focus:rounded-xl focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:shadow-card focus:ring-2 focus:ring-ring"
        >
          Перейти к содержимому
        </a>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
