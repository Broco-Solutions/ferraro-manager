import type { Metadata } from "next";
import Link from "next/link";

import { listJobs } from "@/modules/jobs/application/job-service";
import { formatBusinessDate } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Trabajos" };

function pageHref(params: { q?: string; status: string; page: number }) {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.status !== "active") search.set("status", params.status);
  search.set("page", String(params.page));
  return `/app/jobs?${search}`;
}

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  const params = await searchParams;
  const status =
    params.status === "voided" || params.status === "all"
      ? params.status
      : "active";
  const result = await listJobs({
    query: params.q,
    status,
    page: Number(params.page) || 1,
  });
  const filtered = Boolean(params.q || status !== "active");
  return (
    <div className="page-stack">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Historial real</p>
          <h1>Trabajos</h1>
          <p className="page-description">
            Servicios efectivamente realizados en cada vehículo.
          </p>
        </div>
        <Link href="/app/jobs/new" className="primary-button button-link">
          Nuevo trabajo
        </Link>
      </header>
      <form className="filter-bar" role="search">
        <label className="search-field">
          <span className="sr-only">Buscar trabajos</span>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Cliente, vehículo o servicio"
          />
        </label>
        <label className="compact-field">
          <span>Estado</span>
          <select name="status" defaultValue={status}>
            <option value="active">Realizados</option>
            <option value="voided">Anulados</option>
            <option value="all">Todos</option>
          </select>
        </label>
        <button className="ghost-button">Aplicar</button>
        {filtered ? (
          <Link href="/app/jobs" className="text-link">
            Limpiar
          </Link>
        ) : null}
      </form>
      <div className="results-meta">
        <strong>{result.total}</strong>{" "}
        {result.total === 1 ? "trabajo" : "trabajos"}
      </div>
      {result.items.length ? (
        <section className="entity-list" aria-label="Resultados de trabajos">
          {result.items.map((job) => (
            <Link href={`/app/jobs/${job.id}`} className="job-row" key={job.id}>
              <span className="job-date">
                <strong>{formatBusinessDate(job.performedAt)}</strong>
              </span>
              <span className="job-primary">
                <strong>
                  {job.serviceCase.vehicle.brand}{" "}
                  {job.serviceCase.vehicle.model}
                </strong>
                <small>{job.serviceCase.client.displayName}</small>
              </span>
              <span className="job-services">
                {job.services.map((item) => item.nameSnapshot).join(" · ") ||
                  "Sin servicios detallados"}
              </span>
              <span
                className={
                  job.voidedAt ? "status-badge" : "status-badge status-active"
                }
              >
                {job.voidedAt ? "Anulado" : "Realizado"}
              </span>
              <span className="row-arrow" aria-hidden="true">
                →
              </span>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <p className="eyebrow">
            {filtered ? "Sin coincidencias" : "Historial vacío"}
          </p>
          <h2>
            {filtered
              ? "No encontramos trabajos con estos filtros."
              : "Todavía no hay trabajos realizados."}
          </h2>
          <p>
            {filtered
              ? "Limpiá los filtros o probá otra búsqueda."
              : "Podés completarlos desde un turno o registrarlos directamente."}
          </p>
          <Link
            href={filtered ? "/app/jobs" : "/app/jobs/new"}
            className="ghost-button button-link"
          >
            {filtered ? "Limpiar filtros" : "Registrar trabajo"}
          </Link>
        </section>
      )}
      {result.pages > 1 ? (
        <nav className="pagination" aria-label="Paginación">
          {result.page > 1 ? (
            <Link
              href={pageHref({ q: params.q, status, page: result.page - 1 })}
            >
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span>
            Página {result.page} de {result.pages}
          </span>
          {result.page < result.pages ? (
            <Link
              href={pageHref({ q: params.q, status, page: result.page + 1 })}
            >
              Siguiente
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </div>
  );
}
