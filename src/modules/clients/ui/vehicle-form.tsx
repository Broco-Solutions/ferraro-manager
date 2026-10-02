"use client";

import { useActionState } from "react";

import {
  saveVehicleAction,
  type FormActionState,
} from "@/modules/clients/application/actions";

const initialState: FormActionState = { status: "idle" };

interface VehicleValues {
  id?: string;
  brand?: string;
  model?: string;
  version?: string | null;
  year?: number | null;
  color?: string | null;
  notes?: string | null;
}

export function VehicleForm({
  clientId,
  values = {},
}: {
  clientId: string;
  values?: VehicleValues;
}) {
  const [state, action, pending] = useActionState(
    saveVehicleAction,
    initialState,
  );
  return (
    <form action={action} className="entity-form entity-form-compact">
      <input type="hidden" name="clientId" value={clientId} />
      {values.id ? (
        <input type="hidden" name="vehicleId" value={values.id} />
      ) : null}
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <div className="form-grid">
        <label className="field-group">
          <span>Marca *</span>
          <input
            name="brand"
            defaultValue={values.brand}
            required
            maxLength={80}
            aria-invalid={Boolean(state.fields?.brand)}
          />
        </label>
        <label className="field-group">
          <span>Modelo *</span>
          <input
            name="model"
            defaultValue={values.model}
            required
            maxLength={80}
            aria-invalid={Boolean(state.fields?.model)}
          />
        </label>
        <label className="field-group">
          <span>Versión</span>
          <input
            name="version"
            defaultValue={values.version ?? ""}
            maxLength={100}
          />
        </label>
        <label className="field-group">
          <span>Año</span>
          <input
            name="year"
            defaultValue={values.year ?? ""}
            inputMode="numeric"
            min={1900}
            max={2100}
          />
        </label>
        <label className="field-group">
          <span>Color</span>
          <input
            name="color"
            defaultValue={values.color ?? ""}
            maxLength={60}
          />
        </label>
        <label className="field-group field-span-2">
          <span>Observaciones</span>
          <textarea name="notes" defaultValue={values.notes ?? ""} rows={3} />
        </label>
      </div>
      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={pending}>
          {pending
            ? "Guardando…"
            : values.id
              ? "Guardar vehículo"
              : "Agregar vehículo"}
        </button>
      </div>
    </form>
  );
}
