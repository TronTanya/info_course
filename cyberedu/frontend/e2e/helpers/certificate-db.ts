/** Восстановление soft-revoke для идемпотентных E2E (не удаляет запись). */
export async function restoreCertificateByNumber(certificateNumber: string): Promise<void> {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) return;

  const { PrismaClient } = await import("@prisma/client");
  const prisma = new PrismaClient();
  try {
    await prisma.certificate.updateMany({
      where: { certificateNumber },
      data: { revokedAt: null },
    });
  } finally {
    await prisma.$disconnect();
  }
}
