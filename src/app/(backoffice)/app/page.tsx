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
          <h1>Todo listo para construir con criterio.</h1>
          <p className="page-description">
            La foundation de {brandConfig.businessName} está activa. Los módulos
            operativos se incorporarán únicamente en sus BUILDs aprobados.
          </p>
        </div>
        <span className="status-pill">
          <span aria-hidden="true" /> Foundation activa
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
          <p className="card-kicker">Próxima etapa</p>
          <h2>Clientes y vehículos</h2>
          <p>Sólo después del gate humano de BUILD 0.</p>
        </article>
      </section>

      <section className="quiet-panel">
        <div>
          <p className="eyebrow">Alcance controlado</p>
          <h2>Sin funciones simuladas</h2>
        </div>
        <p>
          Agenda, clientes, trabajos y finanzas aparecen como destinos futuros,
          pero no se presentan como funciones disponibles antes de tiempo.
        </p>
      </section>
    </div>
  );
}
