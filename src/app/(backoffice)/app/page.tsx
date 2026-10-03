import type { Metadata } from "next";
import Link from "next/link";

import {
  getAdminDashboard,
  getOperationalDashboard,
} from "@/modules/dashboard/application/dashboard-service";
import { requireUser } from "@/modules/identity/application/session";
import {
  formatBusinessDateTime,
  getBusinessDateKey,
} from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Inicio" };

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
});

export default async function AppHomePage() {
  const session = await requireUser();
  const now = new Date();
  const [operational, admin] = await Promise.all([
    getOperationalDashboard(now),
    session.user.role === "ADMIN"
      ? getAdminDashboard(now)
      : Promise.resolve(null),
  ]);
  const quickActions = [
    { label: "Nuevo turno", href: "/app/calendar/new", all: true },
    { label: "Nuevo cliente", href: "/app/clients/new", all: true },
    { label: "Nuevo trabajo", href: "/app/jobs/new", all: true },
    { label: "Presupuesto", href: "/app/quotes/new", all: false },
    { label: "Compra", href: "/app/purchases/new", all: false },
    { label: "Ingreso / egreso", href: "/app/finance/new", all: false },
  ].filter((item) => item.all || session.user.role === "ADMIN");

  return (
    <div className="page-stack dashboard-page">
      <header className="page-header dashboard-header">
        <div>
          <p className="eyebrow">{getBusinessDateKey(now)}</p>
          <h1>¿Qué pasa hoy en Ferraro?</h1>
          <p className="page-description">
            {operational.todayAppointments.length
              ? `${operational.todayAppointments.length} turno(s) activo(s) en la jornada.`
              : "La jornada no tiene turnos confirmados."}
          </p>
        </div>
        <span className="status-pill">
          <span aria-hidden="true" /> Rosario · {formatBusinessDateTime(now)}
        </span>
      </header>

      <nav className="quick-actions" aria-label="Acciones rápidas">
        {quickActions.map((item) => (
          <Link key={item.href} href={item.href}>
            <span>+</span>
            {item.label}
          </Link>
        ))}
      </nav>

      {admin ? (
        <section className="dashboard-kpis" aria-label="Resumen del mes">
          <Kpi
            label="Cobrado este mes"
            value={money.format(admin.collectedUsd.toNumber())}
            detail="Caja de clientes neta"
          />
          <Kpi
            label="Egresos este mes"
            value={money.format(admin.outflowUsd.toNumber())}
            detail="Salidas reales de caja"
          />
          <Kpi
            label="Flujo neto"
            value={money.format(admin.cashNetUsd.toNumber())}
            detail="Ingresos menos egresos"
          />
          <Kpi
            label="Trabajos del mes"
            value={String(admin.jobsThisMonth)}
            detail={`Ticket acordado medio ${money.format(admin.averageAgreedUsd.toNumber())}`}
          />
          <Kpi
            label="Saldo pendiente realizado"
            value={money.format(admin.pendingBalanceUsd.toNumber())}
            detail={`${admin.pendingCases.length} caso(s) prioritario(s)`}
            attention
          />
        </section>
      ) : null}

      <div className="dashboard-columns">
        <section className="dashboard-panel dashboard-panel-primary">
          <PanelHeading
            eyebrow="Agenda"
            title="Turnos de hoy"
            href="/app/calendar"
            link="Ver agenda"
          />
          {operational.todayAppointments.length ? (
            <div className="dashboard-list">
              {operational.todayAppointments.map((appointment) => (
                <Link
                  href={`/app/calendar/${appointment.id}`}
                  key={appointment.id}
                >
                  <time>{formatBusinessDateTime(appointment.startAt)}</time>
                  <strong>
                    {appointment.serviceCase.vehicle.brand}{" "}
                    {appointment.serviceCase.vehicle.model}
                  </strong>
                  <small>{appointment.serviceCase.client.displayName}</small>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="Jornada despejada"
              text="Creá un turno o revisá los próximos días."
            />
          )}
        </section>
        <section className="dashboard-panel">
          <PanelHeading
            eyebrow="Próximamente"
            title="Siguientes turnos"
            count={operational.upcomingAppointments.length}
          />
          {operational.upcomingAppointments.length ? (
            <div className="dashboard-list compact">
              {operational.upcomingAppointments.map((appointment) => (
                <Link
                  href={`/app/calendar/${appointment.id}`}
                  key={appointment.id}
                >
                  <time>{formatBusinessDateTime(appointment.startAt)}</time>
                  <strong>
                    {appointment.serviceCase.vehicle.brand}{" "}
                    {appointment.serviceCase.vehicle.model}
                  </strong>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="Sin próximos turnos"
              text="La agenda futura está libre."
            />
          )}
        </section>
      </div>

      <div className="dashboard-columns">
        <section className="dashboard-panel">
          <PanelHeading
            eyebrow="Actividad"
            title="Trabajos recientes"
            href="/app/jobs"
            link="Ver todos"
          />
          {operational.recentJobs.length ? (
            <div className="dashboard-list compact">
              {operational.recentJobs.map((job) => (
                <Link href={`/app/jobs/${job.id}`} key={job.id}>
                  <time>{formatBusinessDateTime(job.performedAt)}</time>
                  <strong>
                    {job.serviceCase.vehicle.brand}{" "}
                    {job.serviceCase.vehicle.model}
                  </strong>
                  <small>
                    {job.serviceCase.client.displayName} · {job._count.photos}{" "}
                    foto(s)
                  </small>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="Sin trabajos recientes"
              text="Los trabajos realizados aparecerán acá."
            />
          )}
        </section>
        <section className="dashboard-panel">
          <PanelHeading
            eyebrow="Inventario"
            title="Stock bajo"
            href="/app/inventory?lowStock=1"
            link="Revisar"
          />
          {operational.lowStock.length ? (
            <div className="dashboard-list compact">
              {operational.lowStock.map((item) => (
                <Link href={`/app/inventory/${item.id}`} key={item.id}>
                  <strong>{item.name}</strong>
                  <small>
                    {item.currentStock.toFixed(3)} {item.baseUnit} · mínimo{" "}
                    {item.minimumStock.toFixed(3)}
                  </small>
                </Link>
              ))}
            </div>
          ) : (
            <Empty
              title="Stock dentro de mínimos"
              text="No hay alertas de reposición."
            />
          )}
        </section>
      </div>

      {admin ? (
        <div className="dashboard-columns">
          <section className="dashboard-panel">
            <PanelHeading
              eyebrow="Cobranza"
              title="Saldos pendientes"
              count={admin.pendingCases.length}
            />
            <div className="dashboard-list compact">
              {admin.pendingCases.map((serviceCase) => (
                <Link
                  href={`/app/finance/cases/${serviceCase.id}`}
                  key={serviceCase.id}
                >
                  <strong>{serviceCase.client.displayName}</strong>
                  <small>
                    {serviceCase.vehicle.brand} {serviceCase.vehicle.model} ·{" "}
                    {money.format(serviceCase.balance.toNumber())}
                  </small>
                </Link>
              ))}
              {!admin.pendingCases.length ? (
                <p>Sin saldos conocidos pendientes.</p>
              ) : null}
            </div>
          </section>
          <section className="dashboard-panel">
            <PanelHeading
              eyebrow="Definición comercial"
              title="Importe por definir"
              count={admin.undefinedAmountCases.length}
            />
            <div className="dashboard-list compact">
              {admin.undefinedAmountCases.map((serviceCase) => (
                <Link
                  href={`/app/finance/cases/${serviceCase.id}`}
                  key={serviceCase.id}
                >
                  <strong>{serviceCase.client.displayName}</strong>
                  <small>
                    {serviceCase.vehicle.brand} {serviceCase.vehicle.model}
                  </small>
                </Link>
              ))}
              {!admin.undefinedAmountCases.length ? (
                <p>Todos los trabajos tienen importe definido.</p>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      {admin?.expiredQuotes.length ? (
        <section className="dashboard-panel alert-panel">
          <PanelHeading
            eyebrow="Seguimiento"
            title="Presupuestos vencidos"
            count={admin.expiredQuotes.length}
          />
          <div className="dashboard-list compact">
            {admin.expiredQuotes.map((quote) => (
              <Link href={`/app/quotes/${quote.id}`} key={quote.id}>
                <strong>{quote.number}</strong>
                <small>{quote.client.displayName}</small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Kpi({
  label,
  value,
  detail,
  attention = false,
}: {
  label: string;
  value: string;
  detail: string;
  attention?: boolean;
}) {
  return (
    <article className={attention ? "kpi-attention" : undefined}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function PanelHeading({
  eyebrow,
  title,
  href,
  link,
  count,
}: {
  eyebrow: string;
  title: string;
  href?: string;
  link?: string;
  count?: number;
}) {
  return (
    <div className="section-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {href ? <Link href={href}>{link}</Link> : <span>{count ?? 0}</span>}
    </div>
  );
}

function Empty({ title, text }: { title: string; text: string }) {
  return (
    <div className="inline-empty">
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
