import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { requireRole } from "@/modules/identity/application/authorization";
import {
  acceptQuoteAction,
  duplicateQuoteAction,
  issueQuoteAction,
  rejectQuoteAction,
} from "@/modules/quotes/application/actions";
import { getQuoteDetail } from "@/modules/quotes/application/quote-service";

export const metadata: Metadata = { title: "Presupuesto" };
const labels = {
  DRAFT: "Borrador",
  SENT: "Enviado",
  ACCEPTED: "Aceptado",
  REJECTED: "Rechazado",
} as const;

export default async function QuoteDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ quoteId: string }>;
  searchParams: Promise<{
    saved?: string;
    issued?: string;
    accepted?: string;
    rejected?: string;
  }>;
}) {
  await requireRole("ADMIN");
  const [{ quoteId }, notices] = await Promise.all([params, searchParams]);
  const quote = await getQuoteDetail(quoteId);
  if (!quote) notFound();
  const appointment = quote.acceptedServiceCase?.appointments[0];
  return (
    <div className="page-stack page-narrow">
      <Link href="/app/quotes" className="back-link">
        ← Presupuestos
      </Link>
      {notices.saved ? (
        <p className="success-banner" role="status">
          El borrador quedó guardado.
        </p>
      ) : null}
      {notices.issued ? (
        <p className="success-banner" role="status">
          Presupuesto emitido y PDF congelado.
        </p>
      ) : null}
      {notices.accepted ? (
        <p className="success-banner" role="status">
          Presupuesto aceptado. El importe acordado quedó fijado.
        </p>
      ) : null}
      {notices.rejected ? (
        <p className="warning-banner" role="status">
          Presupuesto marcado como rechazado.
        </p>
      ) : null}
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">{labels[quote.status]}</p>
          <h1>{quote.number}</h1>
          <p className="page-description">
            {quote.client.displayName} · {quote.vehicle.brand}{" "}
            {quote.vehicle.model}
          </p>
        </div>
        <div className="header-actions">
          <Link
            href={`/api/quotes/${quote.id}/pdf`}
            target="_blank"
            className="ghost-button button-link"
          >
            {quote.status === "DRAFT" ? "Preview PDF" : "Descargar PDF"}
          </Link>
          {quote.status === "DRAFT" ? (
            <Link
              href={`/app/quotes/${quote.id}/edit`}
              className="ghost-button button-link"
            >
              Editar
            </Link>
          ) : null}
        </div>
      </header>
      <section className="quote-detail-sheet">
        <div className="quote-detail-heading">
          <div>
            <span>Cliente</span>
            <strong>{quote.client.displayName}</strong>
          </div>
          <div>
            <span>Vehículo</span>
            <strong>
              {quote.vehicle.brand} {quote.vehicle.model}
            </strong>
          </div>
        </div>
        <div className="quote-detail-lines">
          {quote.items.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.nameSnapshot}</strong>
                {item.descriptionSnapshot ? (
                  <p>{item.descriptionSnapshot}</p>
                ) : null}
              </div>
              <span>
                {item.quantity.toFixed(3).replace(/\.?0+$/, "")} × USD{" "}
                {item.unitPriceUsd.toFixed(2)}
              </span>
              <b>USD {item.totalUsd.toFixed(2)}</b>
            </article>
          ))}
        </div>
        <div className="quote-detail-total">
          <span>
            Subtotal <b>USD {quote.subtotalUsd.toFixed(2)}</b>
          </span>
          {quote.discountUsd.isPositive() ? (
            <span>
              Descuento <b>− USD {quote.discountUsd.toFixed(2)}</b>
            </span>
          ) : null}
          <strong>Total · USD {quote.totalUsd.toFixed(2)}</strong>
        </div>
      </section>
      <section className="quote-actions-panel">
        {quote.status === "DRAFT" ? (
          <form action={issueQuoteAction}>
            <input type="hidden" name="quoteId" value={quote.id} />
            <ConfirmButton
              className="primary-button"
              message="¿Emitir este presupuesto? Su contenido quedará bloqueado y se generará el PDF definitivo."
            >
              Emitir presupuesto
            </ConfirmButton>
          </form>
        ) : null}
        {quote.status === "SENT" ? (
          <>
            <form action={acceptQuoteAction}>
              <input type="hidden" name="quoteId" value={quote.id} />
              <ConfirmButton
                className="primary-button"
                message="¿Confirmar que el cliente aceptó? El total pasará a ser el importe acordado."
              >
                Marcar aceptado
              </ConfirmButton>
            </form>
            <form action={rejectQuoteAction}>
              <input type="hidden" name="quoteId" value={quote.id} />
              <ConfirmButton
                className="ghost-button"
                message="¿Marcar este presupuesto como rechazado?"
              >
                Marcar rechazado
              </ConfirmButton>
            </form>
          </>
        ) : null}
        {quote.status === "ACCEPTED" && !appointment ? (
          <Link
            href={`/app/quotes/${quote.id}/schedule`}
            className="primary-button button-link"
          >
            Convertir en turno
          </Link>
        ) : null}
        {appointment ? (
          <Link
            href={`/app/calendar/${appointment.id}`}
            className="primary-button button-link"
          >
            Ver turno
          </Link>
        ) : null}
        {quote.acceptedServiceCase ? (
          <Link
            href={`/app/finance/cases/${quote.acceptedServiceCase.id}`}
            className="ghost-button button-link"
          >
            Ver cobros
          </Link>
        ) : null}
        <form action={duplicateQuoteAction}>
          <input type="hidden" name="quoteId" value={quote.id} />
          <button className="ghost-button">Duplicar como borrador</button>
        </form>
      </section>
      <p className="muted-copy">
        Aceptar o emitir no registra ningún cobro. La operación y la caja
        permanecen independientes.
      </p>
    </div>
  );
}
