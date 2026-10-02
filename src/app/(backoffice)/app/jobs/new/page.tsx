import type { Metadata } from "next";
import Link from "next/link";

import { listJobOptions } from "@/modules/jobs/application/job-service";
import { JobForm } from "@/modules/jobs/ui/job-form";
import { formatBusinessDateTimeInput } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Nuevo trabajo" };

export default async function NewJobPage() {
  const options = await listJobOptions();
  return (
    <div className="page-stack page-narrow">
      <Link href="/app/jobs" className="back-link">
        ← Trabajos
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Registro directo</p>
          <h1>Nuevo trabajo</h1>
          <p className="page-description">
            Para trabajos realizados sin turno previo. No exige cobro.
          </p>
        </div>
      </header>
      {options.clients.length ? (
        <JobForm
          options={options}
          idempotencyKey={crypto.randomUUID()}
          values={{ performedLocal: formatBusinessDateTimeInput(new Date()) }}
        />
      ) : (
        <section className="empty-state">
          <h2>Primero necesitás un cliente con vehículo.</h2>
          <p>Después podrás registrar el trabajo en menos de un minuto.</p>
          <Link href="/app/clients/new" className="ghost-button button-link">
            Crear cliente
          </Link>
        </section>
      )}
    </div>
  );
}
