"use client";

import { useActionState, useState } from "react";

import {
  saveAppointmentAction,
  type SchedulingFormState,
} from "@/modules/scheduling/application/actions";

const initialState: SchedulingFormState = { status: "idle" };

interface OptionData {
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
}: {
  options: OptionData;
  values: AppointmentValues;
  idempotencyKey?: string;
}) {
  const [state, action, pending] = useActionState(
    saveAppointmentAction,
    initialState,
  );
  const firstClientId = values.clientId ?? options.clients[0]?.id ?? "";
  const [clientId, setClientId] = useState(firstClientId);
  const selectedClient = options.clients.find(
    (client) => client.id === clientId,
  );
  const [vehicleId, setVehicleId] = useState(
    values.vehicleId ?? selectedClient?.vehicles[0]?.id ?? "",
  );
  const isEdit = Boolean(values.id);

  return (
    <form action={action} className="entity-form">
      {values.id ? <input type="hidden" name="id" value={values.id} /> : null}
      {idempotencyKey ? (
        <input type="hidden" name="idempotencyKey" value={idempotencyKey} />
      ) : null}
      {state.message ? (
        <p className="form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Vehículo</h2>
          <p>El caso comercial se crea automáticamente.</p>
        </div>
        {isEdit ? (
          <div className="appointment-identity">
            <strong>{values.clientLabel}</strong>
            <span>{values.vehicleLabel}</span>
          </div>
        ) : (
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
                    options.clients.find((client) => client.id === next)
                      ?.vehicles[0]?.id ?? "",
                  );
                }}
                required
              >
                {options.clients.map((client) => (
                  <option value={client.id} key={client.id}>
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
                  <option value={vehicle.id} key={vehicle.id}>
                    {vehicle.brand} {vehicle.model}
                    {vehicle.year ? ` · ${vehicle.year}` : ""}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Horario</h2>
          <p>La agenda admite turnos simultáneos y de varios días.</p>
        </div>
        <div className="form-grid">
          <label className="field-group">
            <span>Inicio *</span>
            <input
              type="datetime-local"
              name="startLocal"
              defaultValue={values.startLocal}
              required
            />
          </label>
          <label className="field-group">
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
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Servicios</h2>
          <p>Opcionales; se guardan como snapshot del turno.</p>
        </div>
        <div className="choice-grid">
          {options.services.length ? (
            options.services.map((service) => (
              <label className="choice-card" key={service.id}>
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
            <p className="muted-copy">
              No hay servicios activos. Podés agendar igual.
            </p>
          )}
        </div>
      </section>
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Responsables</h2>
          <p>Asignación opcional del equipo.</p>
        </div>
        <div className="choice-grid">
          {options.employees.map((employee) => (
            <label className="choice-card" key={employee.id}>
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
      <section className="form-section">
        <div className="form-section-heading">
          <h2>Detalles</h2>
          <p>Las notas son siempre internas.</p>
        </div>
        <div className="form-grid">
          <label className="field-group field-span-2">
            <span>Notas internas</span>
            <textarea
              name="internalNotes"
              defaultValue={values.internalNotes ?? ""}
              rows={4}
            />
          </label>
          <label className="toggle-field field-span-2">
            <input
              type="checkbox"
              name="visibleToClient"
              defaultChecked={values.visibleToClient ?? true}
            />
            <span>Mostrar este turno en el portal cuando exista</span>
          </label>
        </div>
      </section>
      <div className="form-actions">
        <button className="primary-button" disabled={pending}>
          {pending ? "Guardando…" : isEdit ? "Guardar turno" : "Crear turno"}
        </button>
      </div>
    </form>
  );
}
