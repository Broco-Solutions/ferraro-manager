import type { Metadata } from "next";
import Link from "next/link";

import { requireRole } from "@/modules/identity/application/authorization";
import { listActiveCategories } from "@/modules/services/application/service-catalog";
import { ServiceForm } from "@/modules/services/ui/catalog-forms";

export const metadata: Metadata = { title: "Nuevo servicio" };

export default async function NewServicePage() {
  await requireRole("ADMIN");
  const categories = await listActiveCategories();
  return (
    <div className="page-stack page-narrow">
      <Link href="/app/services" className="back-link">
        ← Servicios
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Catálogo</p>
          <h1>Nuevo servicio</h1>
          <p className="page-description">
            El precio puede quedar a cotizar. Nada se hardcodea.
          </p>
        </div>
      </header>
      {categories.length ? (
        <ServiceForm categories={categories} />
      ) : (
        <section className="empty-state">
          <h2>Primero necesitás una categoría.</h2>
          <p>
            Volvé al catálogo y agregá una categoría como Protección o
            Detailing.
          </p>
          <Link href="/app/services" className="ghost-button button-link">
            Volver al catálogo
          </Link>
        </section>
      )}
    </div>
  );
}
