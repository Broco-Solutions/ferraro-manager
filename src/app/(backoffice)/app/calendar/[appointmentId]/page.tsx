import {
  CalendarBlankIcon,
  ClockIcon,
  UsersIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { Badge } from "@/components/ui/status";
import { cancelAppointmentAction } from "@/modules/scheduling/application/actions";
import {
  getAppointmentDetail,
  listSchedulingOptions,
} from "@/modules/scheduling/application/scheduling-service";
import { AppointmentForm } from "@/modules/scheduling/ui/appointment-form";
import styles from "@/modules/scheduling/ui/calendar.module.css";
import { requireRole } from "@/modules/identity/application/authorization";
import {
  formatBusinessDateTime,
  formatBusinessDateTimeInput,
} from "@/shared/date-time/business-time";

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
  const session = await requireRole("ADMIN", "STAFF");
  const appointment = await getAppointmentDetail(appointmentId);
  if (!appointment) notFound();
  const options = await listSchedulingOptions(
    appointment.serviceCase.clientId,
    appointment.serviceCase.vehicleId,
  );
  const vehicle = appointment.serviceCase.vehicle;
  const durationMinutes = Math.round(
    (appointment.endAt.getTime() - appointment.startAt.getTime()) / 60_000,
  );
  const status =
    appointment.status === "CONFIRMED"
      ? { label: "Turno confirmado", intent: "info" as const }
      : appointment.status === "CANCELLED"
        ? { label: "Turno cancelado", intent: "danger" as const }
        : { label: "Trabajo realizado", intent: "success" as const };
  return (
    <div className={styles.detailPage}>
      <Link
        className={styles.backLink}
        href={`/app/calendar?view=day&date=${formatBusinessDateTimeInput(appointment.startAt).slice(0, 10)}`}
      >
        ← Agenda
      </Link>
      {notices.saved || notices.cancelled ? (
        <p className={styles.notice} role="status">
          El turno se actualizó correctamente.
        </p>
      ) : null}
      <header className={styles.detailHero}>
        <div>
          <Badge intent={status.intent} withIcon>
            {status.label}
          </Badge>
          <h1>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className={styles.description}>
            {appointment.serviceCase.client.displayName}
          </p>
          <div className={styles.detailMeta}>
            <span className={styles.metaPill}>
              <CalendarBlankIcon aria-hidden size={17} />
              {formatBusinessDateTime(appointment.startAt)}
            </span>
            <span className={styles.metaPill}>
              <ClockIcon aria-hidden size={17} />
              {durationMinutes < 60
                ? `${durationMinutes} min`
                : `${Math.floor(durationMinutes / 60)} h${durationMinutes % 60 ? ` ${durationMinutes % 60} min` : ""}`}
            </span>
            <span className={styles.metaPill}>
              <WrenchIcon aria-hidden size={17} />
              {appointment.services.length
                ? `${appointment.services.length} servicio(s)`
                : "Sin servicio"}
            </span>
            <span className={styles.metaPill}>
              <UsersIcon aria-hidden size={17} />
              {appointment.employees.length
                ? `${appointment.employees.length} responsable(s)`
                : "Sin responsable"}
            </span>
          </div>
        </div>
        {appointment.status === "CONFIRMED" ? (
          <div className={styles.actions}>
            {session.user.role === "ADMIN" ? (
              <Link
                className={styles.button}
                href={`/app/finance/cases/${appointment.serviceCaseId}`}
              >
                Ver cobros
              </Link>
            ) : null}
            <Link
              className={styles.buttonPrimary}
              href={`/app/calendar/${appointment.id}/complete`}
            >
              Marcar realizado
            </Link>
            <form action={cancelAppointmentAction}>
              <input type="hidden" name="id" value={appointment.id} />
              <ConfirmButton
                className={styles.button}
                message="¿Cancelar este turno? El cliente y el caso se conservarán."
              >
                Cancelar turno
              </ConfirmButton>
            </form>
          </div>
        ) : appointment.job ? (
          <Link
            className={styles.button}
            href={`/app/jobs/${appointment.job.id}`}
          >
            Ver trabajo
          </Link>
        ) : null}
      </header>
      {appointment.status === "CONFIRMED" ? (
        <AppointmentForm
          options={options}
          values={{
            id: appointment.id,
            clientId: appointment.serviceCase.clientId,
            vehicleId: appointment.serviceCase.vehicleId,
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
          identityReassignment={appointment.identityReassignment}
        />
      ) : (
        <section className={styles.historical}>
          <div>
            <p className={styles.eyebrow}>Histórico</p>
            <h2>Este turno ya no se edita</h2>
          </div>
          <p>
            {appointment.status === "CANCELLED"
              ? "Se conserva para trazabilidad. Un turno cancelado nunca se convierte en trabajo."
              : "El trabajo realizado tiene su propio detalle e historial."}
          </p>
        </section>
      )}
    </div>
  );
}
