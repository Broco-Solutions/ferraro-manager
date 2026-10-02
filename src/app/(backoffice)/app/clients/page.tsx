import type { Metadata } from "next";
import Link from "next/link";

import { listClients } from "@/modules/clients/application/client-service";

export const metadata: Metadata = { title: "Clientes" };

interface PageProps {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}

function pageHref(params: { q?: string; status?: string; page: number }) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.status && params.status !== "active")
    query.set("status", params.status);
  query.set("page", String(params.page));
  return `/app/clients?${query}`;
}

export default async function ClientsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const status =
    params.status === "archived" || params.status === "all"
      ? params.status
      : "active";
  const result = await listClients({
    query: params.q,
    status,
    page: Number(params.page) || 1,
  });
  const filtered = Boolean(params.q || status !== "active");

  return (
    <div className="page-stack">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Relaciones</p>
          <h1>Clientes</h1>
          <p className="page-description">
            Encontrá rápido una persona y todos sus vehículos.
          </p>
        </div>
        <Link href="/app/clients/new" className="primary-button button-link">
          Nuevo cliente
        </Link>
      </header>

      <form className="filter-bar" role="search">
        <label className="search-field">
          <span className="sr-only">Buscar clientes</span>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Nombre, teléfono o vehículo"
          />
        </label>
        <label className="compact-field">
          <span>Estado</span>
          <select name="status" defaultValue={status}>
            <option value="active">Activos</option>
            <option value="archived">Archivados</option>
            <option value="all">Todos</option>
          </select>
        </label>
        <button className="ghost-button" type="submit">
          Aplicar
        </button>
        {filtered ? (
          <Link href="/app/clients" className="text-link">
            Limpiar
          </Link>
        ) : null}
      </form>

      <div className="results-meta">
        <strong>{result.total}</strong>{" "}
        {result.total === 1 ? "cliente" : "clientes"}
      </div>

      {result.items.length ? (
        <section className="entity-list" aria-label="Resultados de clientes">
          {result.items.map((client) => (
            <Link
              href={`/app/clients/${client.id}`}
              className="client-row"
              key={client.id}
            >
              <span className="entity-avatar" aria-hidden="true">
                {client.displayName.slice(0, 1).toUpperCase()}
              </span>
              <span className="client-primary">
                <strong>{client.displayName}</strong>
                <small>
                  {client.phone || client.email || "Sin contacto cargado"}
                </small>
              </span>
              <span className="vehicle-summary">
                {client.vehicles.length
                  ? client.vehicles
                      .map((vehicle) => `${vehicle.brand} ${vehicle.model}`)
                      .join(" · ")
                  : "Sin vehículos"}
              </span>
              <span
                className={
                  client.active ? "status-badge status-active" : "status-badge"
                }
              >
                {client.active ? "Activo" : "Archivado"}
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
            {filtered ? "Sin coincidencias" : "Primera carga"}
          </p>
          <h2>
            {filtered
              ? "No encontramos clientes con estos filtros."
              : "Todavía no hay clientes."}
          </h2>
          <p>
            {filtered
              ? "Probá otro término o limpiá los filtros."
              : "Creá el primero y agregá su vehículo en el siguiente paso."}
          </p>
          <Link
            href={filtered ? "/app/clients" : "/app/clients/new"}
            className="ghost-button button-link"
          >
            {filtered ? "Limpiar filtros" : "Crear cliente"}
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
