import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/modules/identity/application/authorization";
import { listQuotes } from "@/modules/quotes/application/quote-service";

export const metadata: Metadata = { title: "Presupuestos" };

const labels = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
} as const;

export default async function QuotesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const result = await listQuotes({
    query: params.q,
    status: params.status,
    page: Number(params.page) || 1,
  });
  const filtered = Boolean(params.q || params.status);
  return (
    <div className="page-stack">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Propuestas comerciales</p>
          <h1>Presupuestos</h1>
          <p className="page-description">
            Precios históricos, presentación premium y conversión sin recarga.
          </p>
        </div>
        <Link href="/app/quotes/new" className="primary-button button-link">
          Nuevo presupuesto
        </Link>
      </header>
      <form className="filter-bar" role="search">
        <label className="search-field">
          <span className="sr-only">Buscar presupuestos</span>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Número, cliente o vehículo"
          />
        </label>
        <label className="compact-field">
          <span>Estado</span>
          <select name="status" defaultValue={params.status ?? ""}>
            <option value="">Todos</option>
            <option value="DRAFT">Borradores</option>
            <option value="SENT">Enviados</option>
            <option value="ACCEPTED">Aceptados</option>
            <option value="REJECTED">Rechazados</option>
            <option value="expired">Vencidos</option>
          </select>
        </label>
        <button className="ghost-button">Aplicar</button>
        {filtered ? (
          <Link href="/app/quotes" className="text-link">
            Limpiar
          </Link>
        ) : null}
      </form>
      <div className="results-meta">
        <strong>{result.total}</strong>{" "}
        {result.total === 1 ? "presupuesto" : "presupuestos"}
      </div>
      {result.items.length ? (
        <section
          className="entity-list"
          aria-label="Resultados de presupuestos"
        >
          {result.items.map((quote) => {
            const expired =
              quote.status === "SENT" &&
              Boolean(quote.validUntil && quote.validUntil < result.today);
            return (
              <Link
                href={`/app/quotes/${quote.id}`}
                className="quote-row"
                key={quote.id}
              >
                <span className="quote-number">
                  <strong>{quote.number}</strong>
                  <small>
                    {quote.issuedOn.toLocaleDateString("es-AR", {
                      timeZone: "UTC",
                    })}
                  </small>
                </span>
                <span className="job-primary">
                  <strong>{quote.client.displayName}</strong>
                  <small>
                    {quote.vehicle.brand} {quote.vehicle.model}
                  </small>
                </span>
                <strong className="quote-amount">
                  USD {quote.totalUsd.toFixed(2)}
                </strong>
                <span
                  className={
                    quote.status === "ACCEPTED"
                      ? "status-badge status-active"
                      : "status-badge"
                  }
                >
                  {expired ? "Vencido" : labels[quote.status]}
                </span>
                <span className="row-arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            );
          })}
        </section>
      ) : (
        <section className="empty-state">
          <p className="eyebrow">
            {filtered ? "Sin coincidencias" : "Primera propuesta"}
          </p>
          <h2>
            {filtered
              ? "No encontramos presupuestos con estos filtros."
              : "Todavía no hay presupuestos."}
          </h2>
          <p>
            {filtered
              ? "Probá otra búsqueda o limpiá los filtros."
              : "Creá una propuesta desde el catálogo o con ítems manuales."}
          </p>
          <Link
            href={filtered ? "/app/quotes" : "/app/quotes/new"}
            className="ghost-button button-link"
          >
            {filtered ? "Limpiar filtros" : "Crear presupuesto"}
          </Link>
        </section>
      )}
    </div>
  );
}
