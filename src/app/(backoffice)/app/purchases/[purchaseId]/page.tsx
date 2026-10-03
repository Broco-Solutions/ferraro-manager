import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { requireRole } from "@/modules/identity/application/authorization";
import { inventoryUnitSymbols } from "@/modules/inventory/domain/inventory-schema";
import { voidPurchaseAction } from "@/modules/purchases/application/actions";
import { getPurchaseDetail } from "@/modules/purchases/application/purchase-service";
import { formatBusinessDate } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Detalle de compra" };

function unitSymbol(unit: string) {
  return (
    inventoryUnitSymbols[unit as keyof typeof inventoryUnitSymbols] ?? unit
  );
}

export default async function PurchaseDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ purchaseId: string }>;
  searchParams: Promise<{
    created?: string;
    voided?: string;
    voidError?: string;
  }>;
}) {
  await requireRole("ADMIN");
  const [{ purchaseId }, notice] = await Promise.all([params, searchParams]);
  const purchase = await getPurchaseDetail(purchaseId);
  if (!purchase) notFound();
  return (
    <div className="page-stack">
      <Link href="/app/purchases" className="back-link">
        ← Compras
      </Link>
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">{purchase.supplier.name}</p>
          <h1>{purchase.number}</h1>
          <p className="page-description">
            {formatBusinessDate(purchase.businessDate, { timeZone: "UTC" })}
            {purchase.reference ? ` · ${purchase.reference}` : ""}
          </p>
        </div>
        <div className="purchase-hero-total">
          <small>Total</small>
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
        </div>
      </header>
      {notice.created ? (
        <p className="success-banner">
          Compra registrada: stock y egreso se actualizaron juntos.
        </p>
      ) : null}
      {notice.voided ? (
        <p className="success-banner">
          Compra anulada mediante movimientos compensatorios.
        </p>
      ) : null}
      {notice.voidError === "stock" ? (
        <p className="error-banner" role="alert">
          No se puede anular porque parte del stock de esta compra ya fue
          consumido. Resolvé primero la diferencia de inventario.
        </p>
      ) : null}
      <section className="detail-section">
        <div className="section-heading-row">
          <div>
            <p className="card-kicker">Detalle snapshot</p>
            <h2>Artículos comprados</h2>
          </div>
        </div>
        <div className="purchase-detail-lines">
          {purchase.items.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.itemNameSnapshot}</strong>
                <small>
                  {item.presentationNameSnapshot} · factor{" "}
                  {item.factorToBaseSnapshot.toString()}
                </small>
              </div>
              <span>
                {item.quantityPurchased.toFixed(3)} × USD{" "}
                {item.unitCostUsd.toFixed(2)}
              </span>
              <span>
                +{item.quantityBase.toFixed(3)}{" "}
                {unitSymbol(item.baseUnitSnapshot)}
              </span>
              <strong>USD {item.totalUsd.toFixed(2)}</strong>
            </article>
          ))}
        </div>
      </section>
      <section className="purchase-integrity">
        <article>
          <span>Inventario</span>
          <strong>
            {purchase.items.every((item) => item.inventoryMovement)
              ? "Movimientos vinculados"
              : "Inconsistente"}
          </strong>
        </article>
        <article>
          <span>Caja</span>
          <strong>
            {purchase.financialEntry
              ? `Egreso USD ${purchase.financialEntry.amountUsd.toFixed(2)}`
              : "Inconsistente"}
          </strong>
        </article>
      </section>
      {purchase.notes ? (
        <section className="detail-section">
          <p className="card-kicker">Observaciones</p>
          <p>{purchase.notes}</p>
        </section>
      ) : null}
      {purchase.status === "POSTED" ? (
        <details className="detail-section disclosure-section">
          <summary>Anular compra</summary>
          <p>
            La anulación compensa stock y caja. No elimina la compra ni sus
            movimientos.
          </p>
          <form action={voidPurchaseAction} className="inline-create-form">
            <input type="hidden" name="purchaseId" value={purchase.id} />
            <label className="field-group">
              <span>Motivo *</span>
              <input name="reason" minLength={3} required />
            </label>
            <button className="danger-button">Confirmar anulación</button>
          </form>
        </details>
      ) : (
        <section className="detail-section">
          <p className="card-kicker">Anulación</p>
          <h2>Compra anulada</h2>
          <p>{purchase.voidReason}</p>
        </section>
      )}
    </div>
  );
}
