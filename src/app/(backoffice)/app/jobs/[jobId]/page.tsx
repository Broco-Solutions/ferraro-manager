import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { voidJobAction } from "@/modules/jobs/application/actions";
import { getJobDetail } from "@/modules/jobs/application/job-service";
import { requireRole } from "@/modules/identity/application/authorization";
import { formatBusinessDateTime } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Detalle de trabajo" };

export default async function JobDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<{ saved?: string; voided?: string }>;
}) {
  const [{ jobId }, notices] = await Promise.all([params, searchParams]);
  const session = await requireRole("ADMIN", "STAFF");
  const job = await getJobDetail(jobId);
  if (!job) notFound();
  const vehicle = job.serviceCase.vehicle;
  return (
    <div className="page-stack page-narrow">
      <Link href="/app/jobs" className="back-link">
        ← Trabajos
      </Link>
      {notices.saved ? (
        <p className="success-banner" role="status">
          El trabajo quedó registrado.
        </p>
      ) : null}
      {notices.voided ? (
        <p className="warning-banner" role="status">
          El trabajo quedó anulado y se conserva en el historial.
        </p>
      ) : null}
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">
            {job.voidedAt ? "Trabajo anulado" : "Trabajo realizado"}
          </p>
          <h1>
            {vehicle.brand} {vehicle.model}
          </h1>
          <p className="page-description">
            {job.serviceCase.client.displayName} ·{" "}
            {formatBusinessDateTime(job.performedAt)}
          </p>
        </div>
        <div className="header-actions">
          {session.user.role === "ADMIN" ? (
            <Link
              href={`/app/finance/cases/${job.serviceCaseId}`}
              className="primary-button button-link"
            >
              Ver cobros
            </Link>
          ) : null}
          {job.originAppointment ? (
            <Link
              href={`/app/calendar/${job.originAppointment.id}`}
              className="ghost-button button-link"
            >
              Ver turno
            </Link>
          ) : null}
        </div>
      </header>
      <section className="detail-summary">
        <div>
          <span>Origen</span>
          <strong>
            {job.originAppointment ? "Desde turno" : "Carga directa"}
          </strong>
        </div>
        <div>
          <span>Estado</span>
          <strong>{job.voidedAt ? "Anulado" : "Realizado"}</strong>
        </div>
        <div>
          <span>Equipo</span>
          <strong>
            {job.employees.map((item) => item.user.name).join(", ") ||
              "Sin asignar"}
          </strong>
        </div>
      </section>
      <section className="section-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Snapshot</p>
            <h2>Servicios realizados</h2>
          </div>
          <span>{job.services.length}</span>
        </div>
        {job.services.length ? (
          <div className="snapshot-list">
            {job.services.map((service) => (
              <article key={service.id}>
                <strong>{service.nameSnapshot}</strong>
                {service.descriptionSnapshot ? (
                  <p>{service.descriptionSnapshot}</p>
                ) : null}
              </article>
            ))}
          </div>
        ) : (
          <div className="inline-empty">
            <strong>Sin servicios detallados</strong>
            <p>El trabajo igualmente queda registrado en el historial.</p>
          </div>
        )}
      </section>
      {job.notes ? (
        <section className="quiet-panel">
          <div>
            <p className="eyebrow">Notas internas</p>
            <h2>Detalle operativo</h2>
          </div>
          <p>{job.notes}</p>
        </section>
      ) : null}
      {job.voidedAt ? (
        <section className="warning-panel">
          <strong>Anulado el {formatBusinessDateTime(job.voidedAt)}</strong>
          <p>{job.voidReason}</p>
        </section>
      ) : (
        <details className="form-disclosure danger-disclosure">
          <summary>Anular trabajo</summary>
          <form
            action={voidJobAction}
            className="form-disclosure-body compact-form"
          >
            <input type="hidden" name="jobId" value={job.id} />
            <label className="field-group">
              <span>Motivo *</span>
              <textarea name="reason" minLength={4} maxLength={500} required />
            </label>
            <ConfirmButton
              className="danger-button"
              message="¿Anular este trabajo? El registro seguirá visible en el historial."
            >
              Confirmar anulación
            </ConfirmButton>
          </form>
        </details>
      )}
    </div>
  );
}
