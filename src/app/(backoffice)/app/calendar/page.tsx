import type { Metadata } from "next";
import Link from "next/link";

import { ConfirmButton } from "@/components/ui/confirm-button";
import { cancelCalendarBlockAction } from "@/modules/scheduling/application/actions";
import { getCalendarRange } from "@/modules/scheduling/application/scheduling-service";
import {
  addCivilDays,
  businessDayRange,
  formatBusinessTime,
  getBusinessDateKey,
} from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Agenda" };

type View = "day" | "week" | "month";

function safeDateKey(value?: string) {
  return value && /^\d{4}-\d{2}-\d{2}$/.test(value)
    ? value
    : getBusinessDateKey(new Date());
}

function weekStart(dateKey: string) {
  const year = Number(dateKey.slice(0, 4));
  const month = Number(dateKey.slice(5, 7));
  const day = Number(dateKey.slice(8, 10));
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay() || 7;
  return addCivilDays(dateKey, 1 - weekday);
}

function monthStart(dateKey: string) {
  return `${dateKey.slice(0, 7)}-01`;
}
function nextMonth(dateKey: string, offset: number) {
  const year = Number(dateKey.slice(0, 4));
  const month = Number(dateKey.slice(5, 7));
  return new Date(Date.UTC(year, month - 1 + offset, 1))
    .toISOString()
    .slice(0, 10);
}

function viewConfig(view: View, dateKey: string) {
  if (view === "day")
    return {
      startKey: dateKey,
      endKey: addCivilDays(dateKey, 1),
      days: [dateKey],
      previous: addCivilDays(dateKey, -1),
      next: addCivilDays(dateKey, 1),
    };
  if (view === "week") {
    const startKey = weekStart(dateKey);
    return {
      startKey,
      endKey: addCivilDays(startKey, 7),
      days: Array.from({ length: 7 }, (_, index) =>
        addCivilDays(startKey, index),
      ),
      previous: addCivilDays(dateKey, -7),
      next: addCivilDays(dateKey, 7),
    };
  }
  const startKey = monthStart(dateKey);
  const endKey = nextMonth(startKey, 1);
  const count = Math.round(
    (Date.parse(`${endKey}T00:00:00Z`) - Date.parse(`${startKey}T00:00:00Z`)) /
      86_400_000,
  );
  return {
    startKey,
    endKey,
    days: Array.from({ length: count }, (_, index) =>
      addCivilDays(startKey, index),
    ),
    previous: nextMonth(startKey, -1),
    next: nextMonth(startKey, 1),
  };
}

function DayEntries({
  day,
  selected,
  appointments,
  blocks,
  compact = false,
}: {
  day: string;
  selected: boolean;
  appointments: Awaited<ReturnType<typeof getCalendarRange>>["appointments"];
  blocks: Awaited<ReturnType<typeof getCalendarRange>>["blocks"];
  compact?: boolean;
}) {
  const range = businessDayRange(day);
  const dayAppointments = appointments.filter(
    (item) => item.startAt < range.end && item.endAt > range.start,
  );
  const dayBlocks = blocks.filter(
    (item) => item.startAt < range.end && item.endAt > range.start,
  );
  if (compact)
    return (
      <div className={`month-cell ${selected ? "is-selected" : ""}`}>
        <Link
          href={`/app/calendar?view=day&date=${day}`}
          className="month-date"
        >
          {Number(day.slice(-2))}
        </Link>
        <div className="month-events">
          {dayBlocks.slice(0, 1).map((block) => (
            <span className="month-event month-block" key={block.id}>
              {block.reason}
            </span>
          ))}
          {dayAppointments.slice(0, 3 - dayBlocks.length).map((appointment) => (
            <Link
              href={`/app/calendar/${appointment.id}`}
              className={`month-event status-${appointment.status.toLowerCase()}`}
              key={appointment.id}
            >
              {formatBusinessTime(appointment.startAt)}{" "}
              {appointment.serviceCase.vehicle.model}
            </Link>
          ))}
        </div>
      </div>
    );
  return (
    <section className={`calendar-day ${selected ? "is-selected" : ""}`}>
      <header>
        <span>
          {new Intl.DateTimeFormat("es-AR", {
            weekday: "short",
            timeZone: "UTC",
          }).format(new Date(`${day}T12:00:00Z`))}
        </span>
        <strong>{Number(day.slice(-2))}</strong>
      </header>
      <div className="day-events">
        {dayBlocks.map((block) => (
          <article className="calendar-event calendar-block" key={block.id}>
            <div>
              <small>
                {block.allDay
                  ? "Día completo"
                  : `${formatBusinessTime(block.startAt)}–${formatBusinessTime(block.endAt)}`}
              </small>
              <strong>{block.reason}</strong>
            </div>
            <form action={cancelCalendarBlockAction}>
              <input type="hidden" name="id" value={block.id} />
              <ConfirmButton
                className="text-button"
                message="¿Cancelar este bloqueo de agenda?"
              >
                Cancelar
              </ConfirmButton>
            </form>
          </article>
        ))}
        {dayAppointments.map((appointment) => (
          <Link
            href={`/app/calendar/${appointment.id}`}
            className={`calendar-event appointment-event status-${appointment.status.toLowerCase()}`}
            key={appointment.id}
          >
            <time>{formatBusinessTime(appointment.startAt)}</time>
            <div>
              <strong>
                {appointment.serviceCase.vehicle.brand}{" "}
                {appointment.serviceCase.vehicle.model}
              </strong>
              <span>{appointment.serviceCase.client.displayName}</span>
              <small>
                {appointment.services
                  .map((service) => service.nameSnapshot)
                  .join(" · ") || "Sin servicio definido"}
              </small>
            </div>
          </Link>
        ))}
        {!dayBlocks.length && !dayAppointments.length ? (
          <p className="day-empty">Sin actividad</p>
        ) : null}
      </div>
    </section>
  );
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; date?: string; blockSaved?: string }>;
}) {
  const params = await searchParams;
  const view: View =
    params.view === "week" || params.view === "month" ? params.view : "day";
  const dateKey = safeDateKey(params.date);
  const config = viewConfig(view, dateKey);
  const data = await getCalendarRange(
    businessDayRange(config.startKey).start,
    businessDayRange(config.endKey).start,
  );
  const today = getBusinessDateKey(new Date());
  return (
    <div className="page-stack calendar-page">
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Centro operativo</p>
          <h1>Agenda</h1>
          <p className="page-description">
            Turnos simultáneos, varios días y bloqueos claros.
          </p>
        </div>
        <div className="header-actions">
          <Link
            href={`/app/calendar/blocks/new?date=${dateKey}`}
            className="ghost-button button-link"
          >
            Bloquear
          </Link>
          <Link
            href={`/app/calendar/new?date=${dateKey}`}
            className="primary-button button-link"
          >
            Nuevo turno
          </Link>
        </div>
      </header>
      {params.blockSaved ? (
        <p className="success-banner">Bloqueo creado correctamente.</p>
      ) : null}
      <div className="calendar-toolbar">
        <div className="date-nav">
          <Link
            href={`/app/calendar?view=${view}&date=${config.previous}`}
            aria-label="Período anterior"
          >
            ←
          </Link>
          <Link href={`/app/calendar?view=${view}&date=${today}`}>Hoy</Link>
          <Link
            href={`/app/calendar?view=${view}&date=${config.next}`}
            aria-label="Período siguiente"
          >
            →
          </Link>
          <input
            type="date"
            value={dateKey}
            readOnly
            aria-label="Fecha seleccionada"
          />
        </div>
        <nav className="view-switcher" aria-label="Vista de agenda">
          {(["day", "week", "month"] as const).map((item) => (
            <Link
              className={view === item ? "is-active" : ""}
              href={`/app/calendar?view=${item}&date=${dateKey}`}
              key={item}
            >
              {item === "day" ? "Día" : item === "week" ? "Semana" : "Mes"}
            </Link>
          ))}
        </nav>
      </div>
      {view === "month" ? (
        <div className="month-grid">
          {config.days.map((day) => (
            <DayEntries
              key={day}
              day={day}
              selected={day === dateKey}
              appointments={data.appointments}
              blocks={data.blocks}
              compact
            />
          ))}
        </div>
      ) : (
        <div
          className={
            view === "week"
              ? "calendar-columns calendar-week"
              : "calendar-columns calendar-single"
          }
        >
          {config.days.map((day) => (
            <DayEntries
              key={day}
              day={day}
              selected={day === dateKey}
              appointments={data.appointments}
              blocks={data.blocks}
            />
          ))}
        </div>
      )}
    </div>
  );
}
