import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  getCompletionContext,
  listJobOptions,
} from "@/modules/jobs/application/job-service";
import { JobForm } from "@/modules/jobs/ui/job-form";
import { formatBusinessDateTimeInput } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Completar trabajo" };

export default async function CompleteAppointmentPage({
  params,
}: {
  params: Promise<{ appointmentId: string }>;
}) {
  const { appointmentId } = await params;
  const [appointment, options] = await Promise.all([
    getCompletionContext(appointmentId),
    listJobOptions(),
  ]);
  if (!appointment) notFound();
  if (appointment.job) redirect(`/app/jobs/${appointment.job.id}`);
  if (appointment.status !== "CONFIRMED")
    redirect(`/app/calendar/${appointment.id}`);
  const vehicle = appointment.serviceCase.vehicle;
  return (
    <div className="page-stack page-narrow">
      <Link href={`/app/calendar/${appointment.id}`} className="back-link">
        ← Turno
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Desde agenda</p>
          <h1>Marcar como realizado</h1>
          <p className="page-description">
            Confirmá qué se hizo. El cobro es independiente.
          </p>
        </div>
      </header>
      <JobForm
        options={options}
        values={{
          appointmentId: appointment.id,
          clientLabel: appointment.serviceCase.client.displayName,
          vehicleLabel: `${vehicle.brand} ${vehicle.model}${vehicle.year ? ` · ${vehicle.year}` : ""}`,
          performedLocal: formatBusinessDateTimeInput(new Date()),
          serviceIds: appointment.services
            .map((item) => item.serviceId)
            .filter((id): id is string => Boolean(id)),
          employeeIds: appointment.employees.map((item) => item.userId),
        }}
      />
    </div>
  );
}
