"use client";

import { useActionState, useMemo, useState } from "react";

import {
  saveQuoteAction,
  type QuoteFormState,
} from "@/modules/quotes/application/actions";

import styles from "./quotes.module.css";

const initialState: QuoteFormState = { status: "idle" };

interface QuoteOptions {
  clients: {
    id: string;
    displayName: string;
    vehicles: {
      id: string;
      brand: string;
      model: string;
      year: number | null;
    }[];
  }[];
  services: {
    id: string;
    name: string;
    commercialDescription: string | null;
    basePriceUsd: string | null;
    category: { name: string };
  }[];
}

interface Line {
  key: string;
  serviceId: string;
  name: string;
  description: string;
  quantity: string;
  unitPriceUsd: string;
  discountUsd: string;
}

interface QuoteValues {
  quoteId?: string;
  clientId?: string;
  vehicleId?: string;
  issuedOn: string;
  validUntil?: string;
  notes?: string | null;
  terms?: string | null;
  discountUsd?: string;
  items?: Omit<Line, "key">[];
}

function blankLine(): Line {
  return {
    key: crypto.randomUUID(),
    serviceId: "",
    name: "",
    description: "",
    quantity: "1",
    unitPriceUsd: "0",
    discountUsd: "0",
  };
}

export function QuoteForm({
  options,
  values,
}: {
  options: QuoteOptions;
  values: QuoteValues;
}) {
  const [state, action, pending] = useActionState(
    saveQuoteAction,
    initialState,
  );
  const firstClient = values.clientId ?? options.clients[0]?.id ?? "";
  const [clientId, setClientId] = useState(firstClient);
  const selectedClient = options.clients.find((item) => item.id === clientId);
  const [vehicleId, setVehicleId] = useState(
    values.vehicleId ?? selectedClient?.vehicles[0]?.id ?? "",
  );
  const [lines, setLines] = useState<Line[]>(
    values.items?.length
      ? values.items.map((item) => ({ ...item, key: crypto.randomUUID() }))
      : [blankLine()],
  );
  const [globalDiscount, setGlobalDiscount] = useState(
    values.discountUsd ?? "0",
  );
  const summary = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      const quantity = Number(line.quantity) || 0;
      const price = Number(line.unitPriceUsd) || 0;
      const discount = Number(line.discountUsd) || 0;
      return sum + Math.max(0, quantity * price - discount);
    }, 0);
    return {
      subtotal,
      total: Math.max(0, subtotal - (Number(globalDiscount) || 0)),
    };
  }, [lines, globalDiscount]);

  function updateLine(key: string, patch: Partial<Line>) {
    setLines((current) =>
      current.map((line) => (line.key === key ? { ...line, ...patch } : line)),
    );
  }

  return (
    <form action={action} className={styles.editor}>
      {values.quoteId ? (
        <input type="hidden" name="quoteId" value={values.quoteId} />
      ) : null}
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Cliente y vehículo</h2>
          <p>La propuesta siempre queda asociada al propietario correcto.</p>
        </div>
        <div className="form-grid">
          <label className="field-group">
            <span>Cliente *</span>
            <select
              name="clientId"
              value={clientId}
              onChange={(event) => {
                const next = event.target.value;
                setClientId(next);
                setVehicleId(
                  options.clients.find((item) => item.id === next)?.vehicles[0]
                    ?.id ?? "",
                );
              }}
              required
            >
              {options.clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.displayName}
                </option>
              ))}
            </select>
          </label>
          <label className="field-group">
            <span>Vehículo *</span>
            <select
              name="vehicleId"
              value={vehicleId}
              onChange={(event) => setVehicleId(event.target.value)}
              required
            >
              {selectedClient?.vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.brand} {vehicle.model}
                  {vehicle.year ? ` · ${vehicle.year}` : ""}
                </option>
              ))}
            </select>
          </label>
          <label className="field-group">
            <span>Fecha *</span>
            <input
              type="date"
              name="issuedOn"
              defaultValue={values.issuedOn}
              required
            />
          </label>
          <label className="field-group">
            <span>Válido hasta</span>
            <input
              type="date"
              name="validUntil"
              defaultValue={values.validUntil}
            />
          </label>
        </div>
      </section>
      <section className="quote-lines-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Propuesta</p>
            <h2>Servicios e ítems</h2>
          </div>
          <button
            type="button"
            className="ghost-button"
            onClick={() => setLines((current) => [...current, blankLine()])}
          >
            Agregar ítem
          </button>
        </div>
        <div className="quote-lines">
          {lines.map((line, index) => (
            <article className="quote-line-card" key={line.key}>
              <header>
                <strong>Ítem {index + 1}</strong>
                {lines.length > 1 ? (
                  <button
                    type="button"
                    className="text-button"
                    onClick={() =>
                      setLines((current) =>
                        current.filter((item) => item.key !== line.key),
                      )
                    }
                  >
                    Quitar
                  </button>
                ) : null}
              </header>
              <label className="field-group quote-service-select">
                <span>Desde catálogo</span>
                <select
                  name="itemServiceId"
                  value={line.serviceId}
                  onChange={(event) => {
                    const service = options.services.find(
                      (item) => item.id === event.target.value,
                    );
                    updateLine(
                      line.key,
                      service
                        ? {
                            serviceId: service.id,
                            name: service.name,
                            description: service.commercialDescription ?? "",
                            unitPriceUsd: service.basePriceUsd ?? "0",
                          }
                        : { serviceId: "" },
                    );
                  }}
                >
                  <option value="">Ítem manual</option>
                  {options.services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.category.name} · {service.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="quote-line-grid">
                <label className="field-group quote-line-name">
                  <span>Nombre *</span>
                  <input
                    name="itemName"
                    value={line.name}
                    onChange={(event) =>
                      updateLine(line.key, { name: event.target.value })
                    }
                    maxLength={180}
                    required
                  />
                </label>
                <label className="field-group quote-line-description">
                  <span>Descripción</span>
                  <textarea
                    name="itemDescription"
                    value={line.description}
                    onChange={(event) =>
                      updateLine(line.key, { description: event.target.value })
                    }
                    rows={2}
                  />
                </label>
                <label className="field-group">
                  <span>Cantidad *</span>
                  <input
                    name="itemQuantity"
                    value={line.quantity}
                    onChange={(event) =>
                      updateLine(line.key, { quantity: event.target.value })
                    }
                    inputMode="decimal"
                    required
                  />
                </label>
                <label className="field-group">
                  <span>Precio unitario USD *</span>
                  <input
                    name="itemUnitPriceUsd"
                    value={line.unitPriceUsd}
                    onChange={(event) =>
                      updateLine(line.key, { unitPriceUsd: event.target.value })
                    }
                    inputMode="decimal"
                    required
                  />
                </label>
                <label className="field-group">
                  <span>Descuento USD</span>
                  <input
                    name="itemDiscountUsd"
                    value={line.discountUsd}
                    onChange={(event) =>
                      updateLine(line.key, { discountUsd: event.target.value })
                    }
                    inputMode="decimal"
                  />
                </label>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Condiciones</h2>
          <p>Textos claros que también aparecerán en el PDF.</p>
        </div>
        <div className="form-grid">
          <label className="field-group field-span-2">
            <span>Observaciones</span>
            <textarea name="notes" defaultValue={values.notes ?? ""} rows={3} />
          </label>
          <label className="field-group field-span-2">
            <span>Condiciones</span>
            <textarea name="terms" defaultValue={values.terms ?? ""} rows={4} />
          </label>
        </div>
      </section>
      <aside className={styles.summary} aria-label="Resumen del presupuesto">
        <div>
          <span>Subtotal estimado</span>
          <strong>USD {summary.subtotal.toFixed(2)}</strong>
        </div>
        <label className="field-group">
          <span>Descuento general USD</span>
          <input
            name="discountUsd"
            value={globalDiscount}
            onChange={(event) => setGlobalDiscount(event.target.value)}
            inputMode="decimal"
          />
        </label>
        <div className={styles.summaryTotal}>
          <span>Total estimado</span>
          <strong>USD {summary.total.toFixed(2)}</strong>
        </div>
        <button className="primary-button" disabled={pending}>
          {pending
            ? "Guardando…"
            : values.quoteId
              ? "Guardar borrador"
              : "Crear presupuesto"}
        </button>
        <small>El servidor recalcula los importes con precisión decimal.</small>
      </aside>
    </form>
  );
}
