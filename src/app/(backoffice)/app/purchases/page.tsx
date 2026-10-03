import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/modules/identity/application/authorization";
import { listPurchases } from "@/modules/purchases/application/purchase-service";
import { formatBusinessDate } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Compras" };

export default async function PurchasesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; page?: string }>;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const status =
    params.status === "POSTED" || params.status === "VOIDED"
      ? params.status
      : undefined;
  const result = await listPurchases({
    query: params.q,
    status,
    page: Number(params.page) || 1,
  });
  const filtered = Boolean(params.q || status);
  return (
    <div className="page-stack">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Abastecimiento</p>
          <h1>Compras</h1>
          <p className="page-description">
            Una carga actualiza stock y caja sin duplicaciones.
          </p>
        </div>
        <div className="button-cluster">
          <Link
            href="/app/purchases/suppliers"
            className="ghost-button button-link"
          >
            Proveedores
          </Link>
          <Link
            href="/app/purchases/new"
            className="primary-button button-link"
          >
            Nueva compra
          </Link>
        </div>
      </header>
      <form className="filter-bar" role="search">
        <label className="search-field">
          <span className="sr-only">Buscar compras</span>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Número, proveedor o referencia"
          />
        </label>
        <label className="compact-field">
          <span>Estado</span>
          <select name="status" defaultValue={status ?? ""}>
            <option value="">Todas</option>
            <option value="POSTED">Posteadas</option>
            <option value="VOIDED">Anuladas</option>
          </select>
        </label>
        <button className="ghost-button">Aplicar</button>
        {filtered ? (
          <Link href="/app/purchases" className="text-link">
            Limpiar
          </Link>
        ) : null}
      </form>
      <div className="results-meta">
        <strong>{result.total}</strong>{" "}
        {result.total === 1 ? "compra" : "compras"}
      </div>
      {result.items.length ? (
        <section className="purchase-list">
          {result.items.map((purchase) => (
            <Link
              href={`/app/purchases/${purchase.id}`}
              className="purchase-row"
              key={purchase.id}
            >
              <div>
                <strong>{purchase.number}</strong>
                <small>
                  {purchase.supplier.name} ·{" "}
                  {formatBusinessDate(purchase.businessDate, {
                    timeZone: "UTC",
                  })}
                </small>
              </div>
              <span>
                {purchase._count.items}{" "}
                {purchase._count.items === 1 ? "ítem" : "ítems"}
              </span>
              <strong>USD {purchase.totalUsd.toFixed(2)}</strong>
              <span
                className={
                  purchase.status === "POSTED"
                    ? "status-badge status-active"
                    : "status-badge"
                }
              >
                {purchase.status === "POSTED" ? "Posteada" : "Anulada"}
              </span>
              <span className="row-arrow">→</span>
            </Link>
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <p className="eyebrow">
            {filtered ? "Sin coincidencias" : "Primera compra"}
          </p>
          <h2>
            {filtered
              ? "No encontramos compras con estos filtros."
              : "Todavía no hay compras."}
          </h2>
          <p>
            {filtered
              ? "Probá otro criterio o limpiá los filtros."
              : "Registrá una compra para ingresar stock y su egreso juntos."}
          </p>
          <Link
            href={filtered ? "/app/purchases" : "/app/purchases/new"}
            className="ghost-button button-link"
          >
            {filtered ? "Limpiar filtros" : "Registrar compra"}
          </Link>
        </section>
      )}
    </div>
  );
}
