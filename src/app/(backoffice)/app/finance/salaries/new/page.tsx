import { randomUUID } from "node:crypto";
import type { Metadata } from "next";
import Link from "next/link";
import { Page, PageHeader } from "@/components/patterns/page";
import { requireRole } from "@/modules/identity/application/authorization";
import { SalaryForm } from "@/modules/salaries/ui/salary-form";
import { getBusinessMonthKey } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Agregar sueldo" };
export default async function NewSalaryPage() {
  await requireRole("ADMIN");
  const month = getBusinessMonthKey(new Date());
  return (
    <Page size="narrow">
      <PageHeader
        title="Agregar sueldo"
        description="La persona no necesita tener una cuenta en el sistema."
        actions={
          <Link href="/app/finance/salaries" className="text-link">
            Volver a sueldos
          </Link>
        }
      />
      <SalaryForm
        operation="create"
        month={month}
        currentMonth={month}
        idempotencyKey={randomUUID()}
      />
    </Page>
  );
}
