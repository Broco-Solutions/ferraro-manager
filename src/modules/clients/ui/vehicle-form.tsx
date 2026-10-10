"use client";

import { useActionState } from "react";

import { FormActions, FormGrid } from "@/components/patterns/page";
import { Button } from "@/components/ui/button";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import {
  saveVehicleAction,
  type FormActionState,
} from "@/modules/clients/application/actions";

import styles from "./clients.module.css";

const initialState: FormActionState = { status: "idle" };

interface VehicleValues {
  id?: string;
  brand?: string;
  model?: string;
  version?: string | null;
  year?: number | null;
  color?: string | null;
  vehicleClass?: "SEDAN" | "SUV" | "PICKUP" | "OTHER" | null;
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
    <form action={action} className={`${styles.form} ${styles.formCompact}`}>
      <input name="clientId" type="hidden" value={clientId} />
      {values.id ? (
        <input name="vehicleId" type="hidden" value={values.id} />
      ) : null}
      {state.message ? (
        <p className={styles.formError} role="alert">
          {state.message}
        </p>
      ) : null}
      <FormGrid>
        <Field error={state.fields?.brand} label="Marca" required>
          <Input
            defaultValue={values.brand}
            maxLength={80}
            name="brand"
            required
          />
        </Field>
        <Field error={state.fields?.model} label="Modelo" required>
          <Input
            defaultValue={values.model}
            maxLength={80}
            name="model"
            required
          />
        </Field>
        <Field label="Versión" optional>
          <Input
            defaultValue={values.version ?? ""}
            maxLength={100}
            name="version"
          />
        </Field>
        <Field label="Año" optional>
          <Input
            defaultValue={values.year ?? ""}
            inputMode="numeric"
            max={2100}
            min={1900}
            name="year"
          />
        </Field>
        <Field label="Color" optional>
          <Input
            defaultValue={values.color ?? ""}
            maxLength={60}
            name="color"
          />
        </Field>
        <Field label="Segmento" optional>
          <Select defaultValue={values.vehicleClass ?? ""} name="vehicleClass">
            <option value="">Sin definir</option>
            <option value="SEDAN">Sedan</option>
            <option value="SUV">SUV</option>
            <option value="PICKUP">Pickup</option>
            <option value="OTHER">Otro</option>
          </Select>
        </Field>
        <Field className={styles.fieldSpan} label="Observaciones" optional>
          <Textarea defaultValue={values.notes ?? ""} name="notes" rows={4} />
        </Field>
      </FormGrid>
      <FormActions>
        <Button loading={pending} type="submit">
          {values.id ? "Guardar vehículo" : "Agregar vehículo"}
        </Button>
      </FormActions>
    </form>
  );
}
