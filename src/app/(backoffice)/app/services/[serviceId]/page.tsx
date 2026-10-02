import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/modules/identity/application/authorization";
import {
  toggleServiceAction,
  toggleVariantAction,
} from "@/modules/services/application/actions";
import { getAdminService } from "@/modules/services/application/service-catalog";
import { ServiceForm, VariantForm } from "@/modules/services/ui/catalog-forms";

export const metadata: Metadata = { title: "Configurar servicio" };

export default async function ServiceDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ serviceId: string }>;
  searchParams: Promise<{ saved?: string; variantSaved?: string }>;
}) {
  await requireRole("ADMIN");
  const [{ serviceId }, notices] = await Promise.all([params, searchParams]);
  const { service, categories } = await getAdminService(serviceId);
  if (!service) notFound();
  return (
    <div className="page-stack page-narrow">
      <Link href="/app/services" className="back-link">
        ← Servicios
      </Link>
      {notices.saved || notices.variantSaved ? (
        <p className="success-banner">
          Los cambios se guardaron correctamente.
        </p>
      ) : null}
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">{service.category.name}</p>
          <h1>{service.name}</h1>
          <p className="page-description">
            {service.basePriceUsd
              ? `Base USD ${service.basePriceUsd.toFixed(2)}`
              : "Servicio a cotizar"}
          </p>
        </div>
        <form action={toggleServiceAction}>
          <input type="hidden" name="id" value={service.id} />
          <input type="hidden" name="active" value={String(!service.active)} />
          <button className="ghost-button">
            {service.active ? "Desactivar" : "Activar"}
          </button>
        </form>
      </header>
      <ServiceForm
        categories={categories}
        values={{
          id: service.id,
          categoryId: service.categoryId,
          name: service.name,
          internalDescription: service.internalDescription,
          commercialDescription: service.commercialDescription,
          basePriceUsd: service.basePriceUsd?.toString(),
          estimatedDurationMinutes: service.estimatedDurationMinutes,
          sortOrder: service.sortOrder,
        }}
      />
      <section className="section-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Pricing simple</p>
            <h2>Variantes</h2>
          </div>
          <span>{service.variants.length}</span>
        </div>
        {service.variants.length ? (
          <div className="variant-list">
            {service.variants.map((variant) => (
              <article
                className={`variant-row ${variant.active ? "" : "is-archived"}`}
                key={variant.id}
              >
                <div>
                  <strong>{variant.label}</strong>
                  <small>
                    {variant.type === "VEHICLE_CLASS"
                      ? `Segmento ${variant.vehicleClass}`
                      : `${variant.matchBrand} ${variant.matchModel}`}{" "}
                    · prioridad {variant.priority}
                  </small>
                </div>
                <b>USD {variant.priceUsd.toFixed(2)}</b>
                <form action={toggleVariantAction}>
                  <input type="hidden" name="id" value={variant.id} />
                  <input type="hidden" name="serviceId" value={service.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={String(!variant.active)}
                  />
                  <button className="text-button">
                    {variant.active ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </article>
            ))}
          </div>
        ) : (
          <div className="inline-empty">
            <strong>Sin variantes</strong>
            <p>El sistema sugerirá el precio base o “a cotizar”.</p>
          </div>
        )}
        <details className="form-disclosure">
          <summary>Agregar variante</summary>
          <div className="form-disclosure-body">
            <VariantForm serviceId={service.id} />
          </div>
        </details>
      </section>
    </div>
  );
}
