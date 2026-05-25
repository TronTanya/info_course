import Link from "next/link";
import { CertificateEmptyState } from "@/components/certificate/certificate-states";
import { Button } from "@/components/ui/button";

/** Приватный кабинет: запись issued ожидалась, но отсутствует в реестре. */
export function CertificateNotFoundState() {
  return (
    <CertificateEmptyState
      kind="not_issued_yet"
      compact
      action={
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="primary">
            <Link href="/dashboard/certificate">Обновить</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">В кабинет</Link>
          </Button>
        </div>
      }
    />
  );
}
