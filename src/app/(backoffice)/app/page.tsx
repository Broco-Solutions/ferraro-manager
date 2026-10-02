import type { Metadata } from "next";

import { brandConfig } from "@/config/brand";
import { formatBusinessDateTime } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Inicio" };

export default function AppHomePage() {
  return (
    <div className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Base operativa</p>
          <h1>La operación empieza por conocer cada auto.</h1>
          <p className="page-description">
            La base de {brandConfig.businessName} está activa y la gestión de
            clientes y vehículos ya está disponible.
          </p>
        </div>
        <span className="status-pill">
          <span aria-hidden="true" /> Clientes activos
        </span>
      </header>

      <section className="foundation-grid" aria-label="Estado de la base">
        <article className="foundation-card foundation-card-featured">
          <p className="card-kicker">Zona del negocio</p>
          <h2>Rosario</h2>
          <p>America/Argentina/Buenos_Aires</p>
          <small>{formatBusinessDateTime(new Date())}</small>
        </article>
        <article className="foundation-card">
          <p className="card-kicker">Operación financiera</p>
          <h2>USD</h2>
          <p>Moneda única definida por contrato.</p>
        </article>
        <article className="foundation-card">
          <p className="card-kicker">En construcción</p>
          <h2>Catálogo de servicios</h2>
          <p>La próxima capa del circuito operativo.</p>
        </article>
      </section>

      <section className="quiet-panel">
        <div>
          <p className="eyebrow">Alcance controlado</p>
          <h2>Sin funciones simuladas</h2>
        </div>
        <p>
          Sólo clientes y vehículos están habilitados por ahora. Los demás
          destinos se activarán al completar sus respectivos BUILDs.
        </p>
      </section>
    </div>
  );
}
