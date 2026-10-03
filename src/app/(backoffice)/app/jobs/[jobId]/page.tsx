import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { reverseConsumptionAction } from "@/modules/job-consumptions/application/actions";
import { listConsumptionOptions } from "@/modules/job-consumptions/application/consumption-service";
import {
  ConsumptionCorrectionForm,
  ConsumptionForm,
} from "@/modules/job-consumptions/ui/consumption-forms";
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
  searchParams: Promise<{
    saved?: string;
    voided?: string;
    consumed?: string;
    corrected?: string;
    consumptionReversed?: string;
  }>;
}) {
  const [{ jobId }, notices] = await Promise.all([params, searchParams]);
  const [session, job, inventoryItems] = await Promise.all([
    requireRole("ADMIN", "STAFF"),
    getJobDetail(jobId),
    listConsumptionOptions(),
  ]);
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
      {notices.consumed || notices.corrected || notices.consumptionReversed ? (
        <p className="success-banner" role="status">
          {notices.consumed
            ? "El consumo quedó registrado y el stock fue actualizado."
            : notices.corrected
              ? "La corrección quedó registrada con sus movimientos compensatorios."
              : "El consumo quedó anulado y el stock fue restituido."}
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
      <section className="section-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Materiales</p>
            <h2>Consumos del trabajo</h2>
          </div>
          <span>{job.materialConsumptions.length}</span>
        </div>
        {!job.voidedAt ? (
          inventoryItems.length ? (
            <details
              className="form-disclosure"
              open={!job.materialConsumptions.length}
            >
              <summary>Registrar consumo</summary>
              <div className="form-disclosure-body">
                <ConsumptionForm
                  jobId={job.id}
                  items={inventoryItems.map((item) => ({
                    id: item.id,
                    name: item.name,
                    baseUnit: item.baseUnit,
                    currentStock: item.currentStock.toFixed(3),
                    category: item.category.name,
                  }))}
                />
              </div>
            </details>
          ) : (
            <div className="inline-empty">
              <strong>No hay insumos activos</strong>
              <p>Un ADMIN debe configurar el inventario antes de consumir.</p>
            </div>
          )
        ) : null}
        {job.materialConsumptions.length ? (
          <div className="consumption-list">
            {job.materialConsumptions.map((consumption) => {
              const reversed = Boolean(consumption.movement?.reversedBy);
              const replaced = Boolean(consumption.replacedBy);
              const active = !reversed && !replaced && !job.voidedAt;
              return (
                <article
                  className={active ? "" : "consumption-inactive"}
                  key={consumption.id}
                >
                  <div className="consumption-summary">
                    <div>
                      <strong>{consumption.item.name}</strong>
                      <span>
                        {consumption.quantityBase.toFixed(3)}{" "}
                        {consumption.unitSnapshot}
                      </span>
                    </div>
                    <span className="status-pill">
                      {replaced ? "Corregido" : reversed ? "Anulado" : "Activo"}
                    </span>
                  </div>
                  {consumption.note ? <p>{consumption.note}</p> : null}
                  {active ? (
                    <details className="inline-disclosure">
                      <summary>Corregir o anular</summary>
                      <div className="consumption-actions">
                        <ConsumptionCorrectionForm
                          jobId={job.id}
                          consumptionId={consumption.id}
                          unit={consumption.unitSnapshot}
                          currentQuantity={consumption.quantityBase.toFixed(3)}
                        />
                        <form
                          action={reverseConsumptionAction}
                          className="compact-form"
                        >
                          <input type="hidden" name="jobId" value={job.id} />
                          <input
                            type="hidden"
                            name="consumptionId"
                            value={consumption.id}
                          />
                          <label className="field-group">
                            <span>Motivo de anulación *</span>
                            <input
                              name="reason"
                              minLength={3}
                              maxLength={300}
                              required
                            />
                          </label>
                          <ConfirmButton
                            className="danger-button"
                            message="¿Anular este consumo y restituir el stock?"
                          >
                            Anular consumo
                          </ConfirmButton>
                        </form>
                      </div>
                    </details>
                  ) : null}
                </article>
              );
            })}
          </div>
        ) : (
          <div className="inline-empty">
            <strong>Sin materiales registrados</strong>
            <p>Agregalos cuando el trabajo haya consumido stock real.</p>
          </div>
        )}
      </section>
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
