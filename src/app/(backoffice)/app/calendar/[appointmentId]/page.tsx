import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { cancelAppointmentAction } from "@/modules/scheduling/application/actions";
import {
  getAppointmentDetail,
  listSchedulingOptions,
} from "@/modules/scheduling/application/scheduling-service";
import { AppointmentForm } from "@/modules/scheduling/ui/appointment-form";
import { formatBusinessDateTimeInput } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Turno" };

export default async function AppointmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ appointmentId: string }>;
  searchParams: Promise<{ saved?: string; cancelled?: string }>;
}) {
  const [{ appointmentId }, notices] = await Promise.all([
    params,
    searchParams,
  ]);
  const [appointment, options] = await Promise.all([
    getAppointmentDetail(appointmentId),
    listSchedulingOptions(),
  ]);
  if (!appointment) notFound();
  const vehicle = appointment.serviceCase.vehicle;
  return (
    <div className="page-stack page-narrow">
      <Link
        href={`/app/calendar?view=day&date=${formatBusinessDateTimeInput(appointment.startAt).slice(0, 10)}`}
        className="back-link"
      >
        ← Agenda
      </Link>
      {notices.saved || notices.cancelled ? (
        <p className="success-banner">El turno se actualizó correctamente.</p>
      ) : null}
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">
            {appointment.status === "CONFIRMED"
              ? "Turno confirmado"
              : appointment.status === "CANCELLED"
                ? "Turno cancelado"
                : "Trabajo realizado"}
          </p>
          <h1>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="page-description">
            {appointment.serviceCase.client.displayName}
          </p>
        </div>
        {appointment.status === "CONFIRMED" ? (
          <form action={cancelAppointmentAction}>
            <input type="hidden" name="id" value={appointment.id} />
            <ConfirmButton
              className="ghost-button"
              message="¿Cancelar este turno? El cliente y el caso se conservarán."
            >
              Cancelar turno
            </ConfirmButton>
          </form>
        ) : null}
      </header>
      {appointment.status === "CONFIRMED" ? (
        <AppointmentForm
          options={options}
          values={{
            id: appointment.id,
            clientLabel: appointment.serviceCase.client.displayName,
            vehicleLabel: `${vehicle.brand} ${vehicle.model}`,
            startLocal: formatBusinessDateTimeInput(appointment.startAt),
            endLocal: formatBusinessDateTimeInput(appointment.endAt),
            serviceIds: appointment.services
              .map((service) => service.serviceId)
              .filter((id): id is string => Boolean(id)),
            employeeIds: appointment.employees.map(
              (employee) => employee.userId,
            ),
            internalNotes: appointment.internalNotes,
            visibleToClient: appointment.visibleToClient,
          }}
        />
      ) : (
        <section className="quiet-panel">
          <div>
            <p className="eyebrow">Histórico</p>
            <h2>Este turno ya no se edita</h2>
          </div>
          <p>
            Se conserva para trazabilidad. Un turno cancelado nunca se convierte
            en trabajo.
          </p>
        </section>
      )}
    </div>
  );
}
