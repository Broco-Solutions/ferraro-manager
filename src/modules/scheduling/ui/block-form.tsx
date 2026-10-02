"use client";

import { useActionState } from "react";

import {
  saveCalendarBlockAction,
  type SchedulingFormState,
} from "@/modules/scheduling/application/actions";

const initialState: SchedulingFormState = { status: "idle" };

export function BlockForm({
  startLocal,
  endLocal,
}: {
  startLocal: string;
  endLocal: string;
}) {
  const [state, action, pending] = useActionState(
    saveCalendarBlockAction,
    initialState,
  );
  return (
    <form action={action} className="entity-form">
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Bloqueo</h2>
          <p>Impide nuevas reservas dentro del rango.</p>
        </div>
        <div className="form-grid">
          <label className="field-group field-span-2">
            <span>Motivo *</span>
            <input
              name="reason"
              placeholder="Taller cerrado, mantenimiento…"
              required
            />
          </label>
          <label className="field-group">
            <span>Inicio *</span>
            <input
              type="datetime-local"
              name="startLocal"
              defaultValue={startLocal}
              required
            />
          </label>
          <label className="field-group">
            <span>Fin *</span>
            <input
              type="datetime-local"
              name="endLocal"
              defaultValue={endLocal}
              required
            />
          </label>
          <label className="toggle-field field-span-2">
            <input type="checkbox" name="allDay" />
            <span>Mostrar como día completo</span>
          </label>
          <label className="field-group field-span-2">
            <span>Notas internas</span>
            <textarea name="notes" rows={3} />
          </label>
        </div>
      </section>
      <div className="form-actions">
        <button className="primary-button" disabled={pending}>
          {pending ? "Guardando…" : "Crear bloqueo"}
        </button>
      </div>
    </form>
  );
}
