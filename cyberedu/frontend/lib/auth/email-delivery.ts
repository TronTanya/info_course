export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export function isProductionRuntime(): boolean {
  const environment = (process.env.ENVIRONMENT ?? "").trim().toLowerCase();
  if (environment === "production" || environment === "prod") return true;
  return process.env.NODE_ENV === "production";
}

export function appOrigin(): string {
  const raw =
    process.env.AUTH_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3100";
  return raw.replace(/\/$/, "");
}

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  from: string;
};

export function getSmtpConfig(): SmtpConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.SMTP_FROM?.trim();
  const portRaw = process.env.SMTP_PORT?.trim() || "587";
  const port = Number(portRaw);
  if (!host || !user || !pass || !from || !Number.isFinite(port) || port <= 0) return null;
  const secure = (process.env.SMTP_SECURE ?? "").trim() === "1" || port === 465;
  return { host, port, secure, user, pass, from };
}

export async function sendAuthEmail(message: MailMessage): Promise<boolean> {
  const smtp = getSmtpConfig();
  if (!smtp) return false;
  const nodemailer = await import("nodemailer");
  const transport = nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure: smtp.secure,
    auth: { user: smtp.user, pass: smtp.pass },
  });
  await transport.sendMail({
    from: smtp.from,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  return true;
}
