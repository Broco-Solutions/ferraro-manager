import type { Metadata } from "next";
import Link from "next/link";

import { listSchedulingOptions } from "@/modules/scheduling/application/scheduling-service";
import { AppointmentForm } from "@/modules/scheduling/ui/appointment-form";
import { getBusinessDateKey } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Nuevo turno" };

export default async function NewAppointmentPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : getBusinessDateKey(new Date());
  const options = await listSchedulingOptions();
  return (
    <div className="page-stack page-narrow">
      <Link href={`/app/calendar?view=day&date=${date}`} className="back-link">
        ← Agenda
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Alta rápida</p>
          <h1>Nuevo turno</h1>
          <p className="page-description">
            No requiere pago ni importe acordado.
          </p>
        </div>
      </header>
      {options.clients.length ? (
        <AppointmentForm
          options={options}
          idempotencyKey={crypto.randomUUID()}
          values={{ startLocal: `${date}T09:00`, endLocal: `${date}T13:00` }}
        />
      ) : (
        <section className="empty-state">
          <h2>Primero necesitás un cliente con vehículo.</h2>
          <p>La agenda siempre conserva esa relación.</p>
          <Link href="/app/clients/new" className="ghost-button button-link">
            Crear cliente
          </Link>
        </section>
      )}
    </div>
  );
}
