"use client";

import { useActionState } from "react";

import { ClientVehiclePicker } from "@/modules/clients/ui/client-vehicle-picker";
import {
  saveAppointmentAction,
  type SchedulingFormState,
} from "@/modules/scheduling/application/actions";
import styles from "@/modules/scheduling/ui/calendar.module.css";

const initialState: SchedulingFormState = { status: "idle" };

interface OptionData {
  clients: {
    id: string;
    displayName: string;
    phone: string | null;
    email: string | null;
    vehicleCount: number;
  }[];
  vehicles: {
    id: string;
    clientId: string;
    brand: string;
    model: string;
    version: string | null;
    year: number | null;
    color: string | null;
    vehicleClass: "SEDAN" | "SUV" | "PICKUP" | "OTHER" | null;
  }[];
  services: {
    id: string;
    name: string;
    estimatedDurationMinutes: number | null;
    category: { name: string };
  }[];
  employees: { id: string; name: string }[];
}

interface AppointmentValues {
  id?: string;
  clientId?: string;
  vehicleId?: string;
  clientLabel?: string;
  vehicleLabel?: string;
  startLocal: string;
  endLocal: string;
  serviceIds?: string[];
  employeeIds?: string[];
  internalNotes?: string | null;
  visibleToClient?: boolean;
}

export function AppointmentForm({
  options,
  values,
  idempotencyKey,
  identityReassignment,
}: {
  options: OptionData;
  values: AppointmentValues;
  idempotencyKey?: string;
  identityReassignment?: { allowed: boolean; reason: string | null };
}) {
  const [state, action, pending] = useActionState(
    saveAppointmentAction,
    initialState,
  );
  const isEdit = Boolean(values.id);
  const identityLocked = isEdit && identityReassignment?.allowed === false;

  return (
    <form action={action} className={styles.form}>
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {idempotencyKey ? (
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      ) : null}
      {state.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}
      <section className={styles.formSection}>
        <div className={styles.formSectionHeading}>
          <h2>Cliente y vehículo</h2>
          <p>
            {isEdit
              ? "La identidad sólo puede cambiar cuando el caso todavía no tiene historial comercial."
              : "El caso comercial se crea automáticamente."}
          </p>
        </div>
        {identityLocked ? (
          <>
            <input name="clientId" type="hidden" value={values.clientId} />
            <input name="vehicleId" type="hidden" value={values.vehicleId} />
            <div className={styles.identity}>
              <strong>{values.clientLabel}</strong>
              <span>{values.vehicleLabel}</span>
            </div>
            <p className={styles.identityNotice} role="note">
              {identityReassignment?.reason}
            </p>
          </>
        ) : (
          <ClientVehiclePicker
            initialClientId={values.clientId}
            initialClients={options.clients}
            initialVehicleId={values.vehicleId}
            initialVehicles={options.vehicles}
          />
        )}
      </section>
      <section className={styles.formSection}>
        <div className={styles.formSectionHeading}>
          <h2>Horario</h2>
          <p>La agenda admite turnos simultáneos y de varios días.</p>
        </div>
        <div className={styles.formGrid}>
          <label className={styles.field}>
            <span>Inicio *</span>
            <input
              type="datetime-local"
              name="startLocal"
              defaultValue={values.startLocal}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Fin *</span>
            <input
              type="datetime-local"
              name="endLocal"
              defaultValue={values.endLocal}
              required
            />
          </label>
        </div>
      </section>
      <section className={styles.formSection}>
        <div className={styles.formSectionHeading}>
          <h2>Servicios</h2>
          <p>Opcionales; se guardan como snapshot del turno.</p>
        </div>
        <div className={styles.choiceGrid}>
          {options.services.length ? (
            options.services.map((service) => (
              <label className={styles.choice} key={service.id}>
                <input
                  type="checkbox"
                  name="serviceIds"
                  value={service.id}
                  defaultChecked={values.serviceIds?.includes(service.id)}
                />
                <span>
                  <strong>{service.name}</strong>
                  <small>
                    {service.category.name}
                    {service.estimatedDurationMinutes
                      ? ` · ${service.estimatedDurationMinutes} min`
                      : ""}
                  </small>
                </span>
              </label>
            ))
          ) : (
            <p className={styles.muted}>
              No hay servicios activos. Podés agendar igual.
            </p>
          )}
        </div>
      </section>
      <section className={styles.formSection}>
        <div className={styles.formSectionHeading}>
          <h2>Responsables</h2>
          <p>Asignación opcional del equipo.</p>
        </div>
        <div className={styles.choiceGrid}>
          {options.employees.map((employee) => (
            <label className={styles.choice} key={employee.id}>
              <input
                type="checkbox"
                name="employeeIds"
                value={employee.id}
                defaultChecked={values.employeeIds?.includes(employee.id)}
              />
              <span>
                <strong>{employee.name}</strong>
              </span>
            </label>
          ))}
        </div>
      </section>
      <section className={styles.formSection}>
        <div className={styles.formSectionHeading}>
          <h2>Detalles</h2>
          <p>Las notas son siempre internas.</p>
        </div>
        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.fieldSpan}`}>
            <span>Notas internas</span>
            <textarea
              name="internalNotes"
              defaultValue={values.internalNotes ?? ""}
              rows={4}
            />
          </label>
          <label className={`${styles.toggle} ${styles.fieldSpan}`}>
            <input
              type="checkbox"
              name="visibleToClient"
              defaultChecked={values.visibleToClient ?? true}
            />
            <span>Mostrar este turno en el portal cuando exista</span>
          </label>
        </div>
      </section>
      <div className={styles.formActions}>
        <button className={styles.submit} disabled={pending}>
          {pending ? "Guardando…" : isEdit ? "Guardar turno" : "Crear turno"}
        </button>
      </div>
    </form>
  );
}
