import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/modules/identity/application/authorization";
import { toggleServiceAction } from "@/modules/services/application/actions";
import { listAdminCatalog } from "@/modules/services/application/service-catalog";
import { CategoryForm } from "@/modules/services/ui/catalog-forms";

export const metadata: Metadata = { title: "Servicios" };

export default async function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ categorySaved?: string }>;
}) {
  await requireRole("ADMIN");
  const [catalog, notice] = await Promise.all([
    listAdminCatalog(),
    searchParams,
  ]);
  const count = catalog.reduce(
    (total, category) => total + category.services.length,
    0,
  );
  return (
    <div className="page-stack">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Catálogo comercial</p>
          <h1>Servicios</h1>
          <p className="page-description">
            Precios sugeridos configurables, sin reglas ocultas.
          </p>
        </div>
        <Link href="/app/services/new" className="primary-button button-link">
          Nuevo servicio
        </Link>
      </header>
      {notice.categorySaved ? (
        <p className="success-banner">Categoría creada.</p>
      ) : null}
      <CategoryForm />
      <div className="results-meta">
        <strong>{count}</strong> {count === 1 ? "servicio" : "servicios"}
      </div>
      {catalog.length ? (
        <div className="catalog-stack">
          {catalog.map((category) => (
            <section className="catalog-category" key={category.id}>
              <header>
                <div>
                  <p className="card-kicker">Categoría</p>
                  <h2>{category.name}</h2>
                </div>
                <span>{category.services.length}</span>
              </header>
              {category.services.length ? (
                <div className="service-list">
                  {category.services.map((service) => (
                    <article
                      className={`service-row ${service.active ? "" : "is-archived"}`}
                      key={service.id}
                    >
                      <div>
                        <strong>{service.name}</strong>
                        <small>
                          {service.basePriceUsd
                            ? `USD ${service.basePriceUsd.toFixed(2)}`
                            : "A cotizar"}{" "}
                          ·{" "}
                          {service.estimatedDurationMinutes
                            ? `${service.estimatedDurationMinutes} min`
                            : "Duración abierta"}
                        </small>
                      </div>
                      <span className="variant-count">
                        {service.variants.length}{" "}
                        {service.variants.length === 1
                          ? "variante"
                          : "variantes"}
                      </span>
                      <Link
                        href={`/app/services/${service.id}`}
                        className="text-link"
                      >
                        Configurar
                      </Link>
                      <form action={toggleServiceAction}>
                        <input type="hidden" name="id" value={service.id} />
                        <input
                          type="hidden"
                          name="active"
                          value={String(!service.active)}
                        />
                        <button className="text-button">
                          {service.active ? "Desactivar" : "Activar"}
                        </button>
                      </form>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="inline-empty">
                  <strong>Sin servicios en esta categoría</strong>
                  <p>Podés usarla al crear el próximo servicio.</p>
                </div>
              )}
            </section>
          ))}
        </div>
      ) : (
        <section className="empty-state">
          <p className="eyebrow">Catálogo inicial</p>
          <h2>Creá una categoría para empezar.</h2>
          <p>
            Después vas a poder cargar servicios, precios base y variantes
            simples.
          </p>
        </section>
      )}
    </div>
  );
}
