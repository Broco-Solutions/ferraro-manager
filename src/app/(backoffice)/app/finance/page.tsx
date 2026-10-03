import type { Metadata } from "next";
import Link from "next/link";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { reverseFinancialEntryAction } from "@/modules/finance/application/actions";
import { listFinancialEntries } from "@/modules/finance/application/finance-service";
import { requireRole } from "@/modules/identity/application/authorization";
import { formatBusinessDateTime } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Finanzas" };

const typeLabels = {
  CUSTOMER_PAYMENT: "Cobro de cliente",
  CUSTOMER_REFUND: "Devolución",
  PURCHASE: "Compra",
  MANUAL_INCOME: "Ingreso manual",
  MANUAL_EXPENSE: "Egreso manual",
  REVERSAL: "Reversión",
} as const;

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{
    month?: string;
    direction?: string;
    type?: string;
    page?: string;
    created?: string;
    reversed?: string;
  }>;
}) {
  await requireRole("ADMIN");
  const params = await searchParams;
  const result = await listFinancialEntries({
    month: params.month,
    direction: params.direction,
    type: params.type,
    page: Number(params.page) || 1,
  });
  const filtered = Boolean(params.direction || params.type);

  return (
    <div className="page-stack">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Caja interna · USD</p>
          <h1>Finanzas</h1>
          <p className="page-description">
            Caja real separada del importe acordado y del trabajo operativo.
          </p>
        </div>
        <div className="header-actions">
          <Link
            href="/app/finance/categories"
            className="ghost-button button-link"
          >
            Categorías
          </Link>
          <Link href="/app/finance/new" className="primary-button button-link">
            Nuevo movimiento
          </Link>
        </div>
      </header>

      {params.created ? (
        <p className="success-banner" role="status">
          Movimiento registrado sin modificar la agenda ni el trabajo.
        </p>
      ) : null}
      {params.reversed ? (
        <p className="success-banner" role="status">
          Movimiento revertido mediante un asiento compensatorio.
        </p>
      ) : null}

      <section className="kpi-strip" aria-label="Resumen del período">
        <article>
          <span>Entradas</span>
          <strong>USD {result.inflowUsd.toFixed(2)}</strong>
        </article>
        <article>
          <span>Salidas</span>
          <strong>USD {result.outflowUsd.toFixed(2)}</strong>
        </article>
        <article>
          <span>Flujo neto</span>
          <strong>USD {result.netUsd.toFixed(2)}</strong>
        </article>
      </section>

      <form className="filter-bar finance-filters" role="search">
        <label className="compact-field">
          <span>Mes</span>
          <input type="month" name="month" defaultValue={result.month} />
        </label>
        <label className="compact-field">
          <span>Dirección</span>
          <select name="direction" defaultValue={params.direction ?? ""}>
            <option value="">Todas</option>
            <option value="INFLOW">Entradas</option>
            <option value="OUTFLOW">Salidas</option>
          </select>
        </label>
        <label className="compact-field">
          <span>Tipo</span>
          <select name="type" defaultValue={params.type ?? ""}>
            <option value="">Todos</option>
            {Object.entries(typeLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <button className="ghost-button">Aplicar</button>
        {filtered ? (
          <Link
            href={`/app/finance?month=${result.month}`}
            className="text-link"
          >
            Limpiar
          </Link>
        ) : null}
      </form>

      <div className="results-meta">
        <strong>{result.total}</strong> movimientos
      </div>
      {result.items.length ? (
        <section
          className="financial-list"
          aria-label="Movimientos financieros"
        >
          {result.items.map((entry) => {
            const caseLabel = entry.serviceCase
              ? `${entry.serviceCase.client.displayName} · ${entry.serviceCase.vehicle.brand} ${entry.serviceCase.vehicle.model}`
              : entry.category?.name;
            return (
              <article className="financial-row" key={entry.id}>
                <div className="financial-main">
                  <span className="eyebrow">{typeLabels[entry.type]}</span>
                  <strong>
                    {caseLabel || entry.description || "Sin categoría"}
                  </strong>
                  <small>{formatBusinessDateTime(entry.occurredAt)}</small>
                </div>
                <strong
                  className={
                    entry.direction === "INFLOW"
                      ? "money-positive"
                      : "money-negative"
                  }
                >
                  {entry.direction === "INFLOW" ? "+" : "−"} USD{" "}
                  {entry.amountUsd.toFixed(2)}
                </strong>
                {entry.serviceCase ? (
                  <Link
                    href={`/app/finance/cases/${entry.serviceCase.id}`}
                    className="text-link"
                  >
                    Ver saldo
                  </Link>
                ) : null}
                {entry.type !== "REVERSAL" && !entry.reversedBy ? (
                  <form
                    action={reverseFinancialEntryAction}
                    className="reverse-form"
                  >
                    <input type="hidden" name="entryId" value={entry.id} />
                    <input
                      name="reason"
                      aria-label={`Motivo para revertir ${typeLabels[entry.type]}`}
                      placeholder="Motivo"
                      minLength={3}
                      required
                    />
                    <ConfirmButton
                      className="text-button danger-text"
                      message="Se creará un movimiento compensatorio. ¿Continuar?"
                    >
                      Revertir
                    </ConfirmButton>
                  </form>
                ) : (
                  <span className="status-badge">
                    {entry.type === "REVERSAL" ? "Compensación" : "Revertido"}
                  </span>
                )}
              </article>
            );
          })}
        </section>
      ) : (
        <section className="empty-state">
          <p className="eyebrow">
            {filtered ? "Sin coincidencias" : "Sin movimientos"}
          </p>
          <h2>
            {filtered
              ? "No hay movimientos con estos filtros."
              : "Todavía no hay movimientos en este período."}
          </h2>
          <p>Registrá caja sólo cuando el dinero efectivamente entra o sale.</p>
          <Link href="/app/finance/new" className="ghost-button button-link">
            Registrar movimiento
          </Link>
        </section>
      )}
    </div>
  );
}
