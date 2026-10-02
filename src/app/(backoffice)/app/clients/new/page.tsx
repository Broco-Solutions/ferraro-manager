import type { Metadata } from "next";
import Link from "next/link";

import { ClientForm } from "@/modules/clients/ui/client-form";

export const metadata: Metadata = { title: "Nuevo cliente" };

export default function NewClientPage() {
  return (
    <div className="page-stack page-narrow">
      <Link href="/app/clients" className="back-link">
        ← Clientes
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Alta rápida</p>
          <h1>Nuevo cliente</h1>
          <p className="page-description">
            Sólo pedimos lo necesario. Podés agregar el vehículo al guardar.
          </p>
        </div>
      </header>
      <ClientForm />
    </div>
  );
}
