"use client";

import { useActionState } from "react";

import {
  saveCalendarBlockAction,
  type SchedulingFormState,
} from "@/modules/scheduling/application/actions";
import styles from "@/modules/scheduling/ui/calendar.module.css";

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
    <form action={action} className={styles.form}>
      {state.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}
      <section className={styles.formSection}>
        <div className={styles.formSectionHeading}>
          <h2>Bloqueo</h2>
          <p>Impide nuevas reservas dentro del rango.</p>
        </div>
        <div className={styles.formGrid}>
          <label className={`${styles.field} ${styles.fieldSpan}`}>
            <span>Motivo *</span>
            <input
              name="reason"
              placeholder="Taller cerrado, mantenimiento…"
              required
            />
          </label>
          <label className={styles.field}>
            <span>Inicio *</span>
            <input
              type="datetime-local"
              name="startLocal"
              defaultValue={startLocal}
              required
            />
          </label>
          <label className={styles.field}>
            <span>Fin *</span>
            <input
              type="datetime-local"
              name="endLocal"
              defaultValue={endLocal}
              required
            />
          </label>
          <label className={`${styles.toggle} ${styles.fieldSpan}`}>
            <input type="checkbox" name="allDay" />
            <span>Mostrar como día completo</span>
          </label>
          <label className={`${styles.field} ${styles.fieldSpan}`}>
            <span>Notas internas</span>
            <textarea name="notes" rows={3} />
          </label>
        </div>
      </section>
      <div className={styles.formActions}>
        <button className={styles.submit} disabled={pending}>
          {pending ? "Guardando…" : "Crear bloqueo"}
        </button>
      </div>
    </form>
  );
}
