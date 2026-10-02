"use client";

import { useActionState } from "react";

import {
  saveClientAction,
  type FormActionState,
} from "@/modules/clients/application/actions";

const initialState: FormActionState = { status: "idle" };

interface ClientValues {
  id?: string;
  displayName?: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  instagram?: string | null;
  notes?: string | null;
}

function FieldError({ state, name }: { state: FormActionState; name: string }) {
  const error = state.fields?.[name];
  return error ? <span className="field-error">{error}</span> : null;
}

export function ClientForm({ values = {} }: { values?: ClientValues }) {
  const [state, action, pending] = useActionState(
    saveClientAction,
    initialState,
  );
  return (
    <form action={action} className="entity-form">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Identificación</h2>
          <p>Usá el nombre con el que el equipo reconoce al cliente.</p>
        </div>
        <div className="form-grid">
          <label className="field-group field-span-2">
            <span>Nombre identificatorio *</span>
            <input
              name="displayName"
              defaultValue={values.displayName}
              autoFocus
              required
              maxLength={120}
              aria-invalid={Boolean(state.fields?.displayName)}
            />
            <FieldError state={state} name="displayName" />
          </label>
          <label className="field-group">
            <span>Nombre</span>
            <input
              name="firstName"
              defaultValue={values.firstName ?? ""}
              maxLength={80}
              autoComplete="given-name"
            />
          </label>
          <label className="field-group">
            <span>Apellido</span>
            <input
              name="lastName"
              defaultValue={values.lastName ?? ""}
              maxLength={80}
              autoComplete="family-name"
            />
          </label>
        </div>
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Contacto</h2>
          <p>Completá sólo los canales que realmente use.</p>
        </div>
        <div className="form-grid">
          <label className="field-group">
            <span>Teléfono</span>
            <input
              name="phone"
              defaultValue={values.phone ?? ""}
              type="tel"
              autoComplete="tel"
            />
          </label>
          <label className="field-group">
            <span>WhatsApp</span>
            <input
              name="whatsapp"
              defaultValue={values.whatsapp ?? ""}
              type="tel"
            />
          </label>
          <label className="field-group">
            <span>Email</span>
            <input
              name="email"
              defaultValue={values.email ?? ""}
              type="email"
              autoComplete="email"
              aria-invalid={Boolean(state.fields?.email)}
            />
            <FieldError state={state} name="email" />
          </label>
          <label className="field-group">
            <span>Instagram</span>
            <input
              name="instagram"
              defaultValue={values.instagram ?? ""}
              placeholder="@usuario"
            />
          </label>
        </div>
      </section>
      <section className="form-section">
        <label className="field-group">
          <span>Notas internas</span>
          <textarea
            name="notes"
            defaultValue={values.notes ?? ""}
            rows={4}
            maxLength={2000}
          />
        </label>
      </section>
      <div className="form-actions">
        <button className="primary-button" type="submit" disabled={pending}>
          {pending
            ? "Guardando…"
            : values.id
              ? "Guardar cambios"
              : "Crear cliente"}
        </button>
      </div>
    </form>
  );
}
