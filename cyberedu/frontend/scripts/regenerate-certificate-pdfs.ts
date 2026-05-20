/**
 * Пересобирает все PDF сертификатов (актуальный шаблон и шрифты).
 * Запуск: npm run certs:regenerate-pdf
 */
import "../lib/00-init-prisma-env";
import { generateCertificatePdf, writeCertificatePdfFile } from "../lib/certificate";
import { prisma } from "../lib/db";

async function main() {
  const certs = await prisma.certificate.findMany({
    select: { id: true, userId: true, courseId: true, certificateNumber: true },
    orderBy: { issuedAt: "asc" },
  });

  if (certs.length === 0) {
    console.log("Сертификатов в БД нет — нечего пересобирать.");
    return;
  }

  console.log(`Пересборка PDF: ${certs.length} сертификат(ов)…`);
  for (const cert of certs) {
    const buf = await generateCertificatePdf(cert.userId, cert.courseId);
    await writeCertificatePdfFile(cert.id, buf);
    console.log(`  ✓ ${cert.certificateNumber} (${cert.id})`);
  }
  console.log("Готово.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
