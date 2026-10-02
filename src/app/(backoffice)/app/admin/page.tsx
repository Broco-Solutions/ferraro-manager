import type { Metadata } from "next";

import { requireRole } from "@/modules/identity/application/authorization";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminFoundationPage() {
  await requireRole("ADMIN");

  return (
    <div className="page-stack narrow-page">
      <header className="page-header">
        <div>
          <p className="eyebrow">Sólo ADMIN</p>
          <h1>Área administrativa protegida</h1>
          <p className="page-description">
            Esta ruta valida autorización en servidor. Las funciones
            administrativas llegarán en sus BUILDs correspondientes.
          </p>
        </div>
      </header>
      <section className="quiet-panel">
        <div>
          <p className="card-kicker">Control de acceso</p>
          <h2>Permiso verificado</h2>
        </div>
        <p>
          La navegación ayuda a orientar, pero no reemplaza esta validación.
        </p>
      </section>
    </div>
  );
}
