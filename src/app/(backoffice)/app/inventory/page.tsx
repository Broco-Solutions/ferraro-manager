import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/modules/identity/application/authorization";
import {
  listInventoryCategories,
  listInventoryItems,
} from "@/modules/inventory/application/inventory-service";
import { inventoryUnitSymbols } from "@/modules/inventory/domain/inventory-schema";

export const metadata: Metadata = { title: "Inventario" };

interface PageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    status?: string;
    low?: string;
    sort?: string;
    page?: string;
  }>;
}

function pageHref(
  params: Omit<Awaited<PageProps["searchParams"]>, "page"> & { page: number },
) {
  const query = new URLSearchParams();
  if (params.q) query.set("q", params.q);
  if (params.category) query.set("category", params.category);
  if (params.status && params.status !== "active")
    query.set("status", params.status);
  if (params.low) query.set("low", params.low);
  if (params.sort) query.set("sort", params.sort);
  query.set("page", String(params.page));
  return `/app/inventory?${query}`;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const session = await requireRole("ADMIN", "STAFF");
  const params = await searchParams;
  const status =
    params.status === "archived" || params.status === "all"
      ? params.status
      : "active";
  const [result, categories] = await Promise.all([
    listInventoryItems({
      query: params.q,
      categoryId: params.category,
      status,
      lowStock: params.low === "1",
      sort: params.sort === "stock" ? "stock" : "name",
      page: Number(params.page) || 1,
      includeCost: session.user.role === "ADMIN",
    }),
    listInventoryCategories(true),
  ]);
  const filtered = Boolean(
    params.q ||
    params.category ||
    status !== "active" ||
    params.low ||
    params.sort === "stock",
  );

  return (
    <div className="page-stack">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Stock operativo</p>
          <h1>Inventario</h1>
          <p className="page-description">
            Cantidades reales, siempre expresadas en su unidad base.
          </p>
        </div>
        {session.user.role === "ADMIN" ? (
          <div className="button-cluster">
            <Link
              href="/app/inventory/categories"
              className="ghost-button button-link"
            >
              Categorías
            </Link>
            <Link
              href="/app/inventory/new"
              className="primary-button button-link"
            >
              Nuevo artículo
            </Link>
          </div>
        ) : null}
      </header>

      <form className="filter-bar inventory-filters" role="search">
        <label className="search-field">
          <span className="sr-only">Buscar inventario</span>
          <input
            name="q"
            defaultValue={params.q}
            placeholder="Artículo, SKU o categoría"
          />
        </label>
        <label className="compact-field">
          <span>Categoría</span>
          <select name="category" defaultValue={params.category ?? ""}>
            <option value="">Todas</option>
            {categories.map((category) => (
              <option value={category.id} key={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label className="compact-field">
          <span>Estado</span>
          <select name="status" defaultValue={status}>
            <option value="active">Activos</option>
            <option value="archived">Archivados</option>
            <option value="all">Todos</option>
          </select>
        </label>
        <label className="compact-field">
          <span>Orden</span>
          <select name="sort" defaultValue={params.sort ?? "name"}>
            <option value="name">Nombre</option>
            <option value="stock">Menor stock</option>
          </select>
        </label>
        <label className="check-field compact-check">
          <input
            type="checkbox"
            name="low"
            value="1"
            defaultChecked={params.low === "1"}
          />
          <span>Stock bajo</span>
        </label>
        <button className="ghost-button">Aplicar</button>
        {filtered ? (
          <Link href="/app/inventory" className="text-link">
            Limpiar
          </Link>
        ) : null}
      </form>

      <div className="results-meta">
        <strong>{result.total}</strong>{" "}
        {result.total === 1 ? "artículo" : "artículos"}
      </div>

      {result.items.length ? (
        <section
          className="inventory-list"
          aria-label="Artículos de inventario"
        >
          {result.items.map((item) => {
            const low = item.currentStock.lte(item.minimumStock);
            return (
              <Link
                href={`/app/inventory/${item.id}`}
                className="inventory-row"
                key={item.id}
              >
                <span className="inventory-primary">
                  <strong>{item.name}</strong>
                  <small>
                    {item.category.name}
                    {item.sku ? ` · ${item.sku}` : ""}
                  </small>
                </span>
                <span className={`stock-quantity ${low ? "is-low" : ""}`}>
                  <strong>{item.currentStock.toFixed(3)}</strong>
                  <small>
                    {inventoryUnitSymbols[
                      item.baseUnit as keyof typeof inventoryUnitSymbols
                    ] ?? item.baseUnit}
                  </small>
                </span>
                <span className="stock-minimum">
                  Mín. {item.minimumStock.toFixed(3)}
                </span>
                <span
                  className={
                    low
                      ? "status-badge status-warning"
                      : "status-badge status-active"
                  }
                >
                  {low ? "Stock bajo" : "Disponible"}
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
            {filtered ? "Sin coincidencias" : "Stock inicial"}
          </p>
          <h2>
            {filtered
              ? "No encontramos artículos con estos filtros."
              : "Todavía no hay artículos."}
          </h2>
          <p>
            {filtered
              ? "Limpiá los filtros o probá otra búsqueda."
              : "Creá una categoría y el primer insumo para empezar."}
          </p>
          <Link
            href={
              filtered
                ? "/app/inventory"
                : session.user.role === "ADMIN"
                  ? "/app/inventory/categories"
                  : "/app"
            }
            className="ghost-button button-link"
          >
            {filtered
              ? "Limpiar filtros"
              : session.user.role === "ADMIN"
                ? "Configurar inventario"
                : "Volver al inicio"}
          </Link>
        </section>
      )}

      {result.pages > 1 ? (
        <nav className="pagination" aria-label="Paginación">
          {result.page > 1 ? (
            <Link href={pageHref({ ...params, page: result.page - 1 })}>
              Anterior
            </Link>
          ) : (
            <span />
          )}
          <span>
            Página {result.page} de {result.pages}
          </span>
          {result.page < result.pages ? (
            <Link href={pageHref({ ...params, page: result.page + 1 })}>
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
