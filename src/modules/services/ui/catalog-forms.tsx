"use client";

import { useActionState, useState } from "react";

import {
  createCategoryAction,
  createVariantAction,
  saveServiceAction,
  type CatalogFormState,
} from "@/modules/services/application/actions";

const initialState: CatalogFormState = { status: "idle" };

function ErrorMessage({ state }: { state: CatalogFormState }) {
  return state.message ? (
    <p className="form-error" role="alert">
      {state.message}
    </p>
  ) : null;
}

export function CategoryForm() {
  const [state, action, pending] = useActionState(
    createCategoryAction,
    initialState,
  );
  return (
    <form action={action} className="inline-create-form">
      <label className="field-group">
        <span>Nueva categoría</span>
        <input name="name" placeholder="Ej. Protección" required />
      </label>
      <input type="hidden" name="sortOrder" value="0" />
      <button className="ghost-button" disabled={pending}>
        {pending ? "Guardando…" : "Agregar"}
      </button>
      <ErrorMessage state={state} />
    </form>
  );
}

interface ServiceValues {
  id?: string;
  categoryId?: string;
  name?: string;
  internalDescription?: string | null;
  commercialDescription?: string | null;
  basePriceUsd?: string | null;
  estimatedDurationMinutes?: number | null;
  sortOrder?: number;
}

export function ServiceForm({
  categories,
  values = {},
}: {
  categories: { id: string; name: string }[];
  values?: ServiceValues;
}) {
  const [state, action, pending] = useActionState(
    saveServiceAction,
    initialState,
  );
  return (
    <form action={action} className="entity-form">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      <ErrorMessage state={state} />
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Servicio</h2>
          <p>Nombre y categoría para toda la operación.</p>
        </div>
        <div className="form-grid">
          <label className="field-group">
            <span>Categoría *</span>
            <select name="categoryId" defaultValue={values.categoryId} required>
              <option value="">Seleccionar</option>
              {categories.map((category) => (
                <option value={category.id} key={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="field-group">
            <span>Nombre *</span>
            <input name="name" defaultValue={values.name} required />
          </label>
          <label className="field-group">
            <span>Precio base USD</span>
            <input
              name="basePriceUsd"
              defaultValue={values.basePriceUsd ?? ""}
              inputMode="decimal"
              placeholder="A cotizar"
            />
          </label>
          <label className="field-group">
            <span>Duración estimada (min)</span>
            <input
              name="estimatedDurationMinutes"
              defaultValue={values.estimatedDurationMinutes ?? ""}
              inputMode="numeric"
            />
          </label>
          <label className="field-group">
            <span>Orden</span>
            <input
              name="sortOrder"
              defaultValue={values.sortOrder ?? 0}
              inputMode="numeric"
            />
          </label>
        </div>
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Descripciones</h2>
          <p>Una interna para el equipo y otra comercial para presupuestos.</p>
        </div>
        <div className="form-grid">
          <label className="field-group field-span-2">
            <span>Descripción interna</span>
            <textarea
              name="internalDescription"
              defaultValue={values.internalDescription ?? ""}
              rows={3}
            />
          </label>
          <label className="field-group field-span-2">
            <span>Descripción comercial</span>
            <textarea
              name="commercialDescription"
              defaultValue={values.commercialDescription ?? ""}
              rows={4}
            />
          </label>
        </div>
      </section>
      <div className="form-actions">
        <button className="primary-button" disabled={pending}>
          {pending
            ? "Guardando…"
            : values.id
              ? "Guardar cambios"
              : "Crear servicio"}
        </button>
      </div>
    </form>
  );
}

export function VariantForm({ serviceId }: { serviceId: string }) {
  const [state, action, pending] = useActionState(
    createVariantAction,
    initialState,
  );
  const [type, setType] = useState<"VEHICLE_CLASS" | "MODEL_EXCEPTION">(
    "VEHICLE_CLASS",
  );
  return (
    <form action={action} className="entity-form entity-form-compact">
      <input type="hidden" name="serviceId" value={serviceId} />
      <ErrorMessage state={state} />
      <div className="form-grid">
        <label className="field-group">
          <span>Tipo *</span>
          <select
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value as typeof type)}
          >
            <option value="VEHICLE_CLASS">Segmento</option>
            <option value="MODEL_EXCEPTION">Marca/modelo exacto</option>
          </select>
        </label>
        <label className="field-group">
          <span>Etiqueta *</span>
          <input
            name="label"
            placeholder={
              type === "VEHICLE_CLASS" ? "Ej. SUV" : "Ej. Ford Raptor"
            }
            required
          />
        </label>
        {type === "VEHICLE_CLASS" ? (
          <label className="field-group">
            <span>Segmento *</span>
            <select name="vehicleClass" required>
              <option value="">Seleccionar</option>
              <option value="SEDAN">Sedan</option>
              <option value="SUV">SUV</option>
              <option value="PICKUP">Pickup</option>
              <option value="OTHER">Otro</option>
            </select>
          </label>
        ) : (
          <>
            <label className="field-group">
              <span>Marca exacta *</span>
              <input name="matchBrand" required />
            </label>
            <label className="field-group">
              <span>Modelo exacto *</span>
              <input name="matchModel" required />
            </label>
          </>
        )}
        <label className="field-group">
          <span>Precio USD *</span>
          <input name="priceUsd" inputMode="decimal" required />
        </label>
        <label className="field-group">
          <span>Duración (min)</span>
          <input name="estimatedDurationMinutes" inputMode="numeric" />
        </label>
        <label className="field-group">
          <span>Prioridad</span>
          <input name="priority" defaultValue="0" inputMode="numeric" />
        </label>
      </div>
      <div className="form-actions">
        <button className="primary-button" disabled={pending}>
          {pending ? "Guardando…" : "Agregar variante"}
        </button>
      </div>
    </form>
  );
}
