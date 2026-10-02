import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  setClientArchivedAction,
  setVehicleArchivedAction,
} from "@/modules/clients/application/actions";
import { getClientDetail } from "@/modules/clients/application/client-service";
import { VehicleForm } from "@/modules/clients/ui/vehicle-form";

export const metadata: Metadata = { title: "Ficha de cliente" };

interface PageProps {
  params: Promise<{ clientId: string }>;
  searchParams: Promise<{
    saved?: string;
    possibleDuplicates?: string;
    vehicleSaved?: string;
    statusChanged?: string;
  }>;
}

export default async function ClientDetailPage({
  params,
  searchParams,
}: PageProps) {
  const { clientId } = await params;
  const notices = await searchParams;
  const client = await getClientDetail(clientId);
  if (!client) notFound();

  return (
    <div className="page-stack">
      <Link href="/app/clients" className="back-link">
        ← Clientes
      </Link>
      {notices.saved || notices.vehicleSaved || notices.statusChanged ? (
        <p className="success-banner" role="status">
          Los cambios se guardaron correctamente.
        </p>
      ) : null}
      {notices.possibleDuplicates ? (
        <p className="warning-banner" role="status">
          Encontramos {notices.possibleDuplicates} cliente(s) con teléfono o
          email similar. Revisá la lista para evitar duplicados.
        </p>
      ) : null}
      <header className="page-header page-header-actions">
        <div>
          <p className="eyebrow">Ficha de cliente</p>
          <h1>{client.displayName}</h1>
          <p className="page-description">
            {[client.phone, client.email, client.instagram]
              .filter(Boolean)
              .join(" · ") || "Sin datos de contacto cargados"}
          </p>
        </div>
        <div className="header-actions">
          <Link
            href={`/app/clients/${client.id}/edit`}
            className="ghost-button button-link"
          >
            Editar
          </Link>
          <form action={setClientArchivedAction}>
            <input type="hidden" name="id" value={client.id} />
            <input
              type="hidden"
              name="archived"
              value={String(client.active)}
            />
            <button className="ghost-button" type="submit">
              {client.active ? "Archivar" : "Restaurar"}
            </button>
          </form>
        </div>
      </header>

      <section className="detail-summary">
        <div>
          <span>Estado</span>
          <strong>{client.active ? "Activo" : "Archivado"}</strong>
        </div>
        <div>
          <span>WhatsApp</span>
          <strong>{client.whatsapp || "Sin cargar"}</strong>
        </div>
        <div>
          <span>Alta</span>
          <strong>
            {new Intl.DateTimeFormat("es-AR", {
              dateStyle: "medium",
              timeZone: "America/Argentina/Buenos_Aires",
            }).format(client.createdAt)}
          </strong>
        </div>
      </section>

      {client.notes ? (
        <section className="quiet-panel">
          <div>
            <p className="eyebrow">Notas internas</p>
            <h2>Contexto</h2>
          </div>
          <p>{client.notes}</p>
        </section>
      ) : null}

      <section className="section-stack">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Garage</p>
            <h2>Vehículos</h2>
          </div>
          <span>{client.vehicles.length}</span>
        </div>
        {client.vehicles.length ? (
          <div className="vehicle-grid">
            {client.vehicles.map((vehicle) => (
              <article
                className={`vehicle-card ${vehicle.active ? "" : "is-archived"}`}
                key={vehicle.id}
              >
                <div className="vehicle-visual">
                  <span>{vehicle.brand.slice(0, 1)}</span>
                </div>
                <div className="vehicle-card-copy">
                  <p className="card-kicker">
                    {vehicle.active ? "Activo" : "Archivado"}
                  </p>
                  <h3>
                    {vehicle.brand} {vehicle.model}
                  </h3>
                  <p>
                    {[vehicle.version, vehicle.year, vehicle.color]
                      .filter(Boolean)
                      .join(" · ") || "Sin detalles adicionales"}
                  </p>
                </div>
                <div className="vehicle-actions">
                  <Link
                    href={`/app/clients/${client.id}/vehicles/${vehicle.id}/edit`}
                    className="text-link"
                  >
                    Editar
                  </Link>
                  <form action={setVehicleArchivedAction}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <input type="hidden" name="vehicleId" value={vehicle.id} />
                    <input
                      type="hidden"
                      name="archived"
                      value={String(vehicle.active)}
                    />
                    <button type="submit" className="text-button">
                      {vehicle.active ? "Archivar" : "Restaurar"}
                    </button>
                  </form>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="inline-empty">
            <strong>Sin vehículos todavía</strong>
            <p>Agregá el primero sin salir de esta ficha.</p>
          </div>
        )}
      </section>

      <details className="form-disclosure" open={!client.vehicles.length}>
        <summary>Agregar vehículo</summary>
        <div className="form-disclosure-body">
          <VehicleForm clientId={client.id} />
        </div>
      </details>

      <section className="timeline-placeholder">
        <p className="eyebrow">Historial</p>
        <h2>Listo para crecer con el cliente</h2>
        <p>
          Turnos, trabajos y fotos aparecerán acá cuando se incorporen en sus
          BUILDs.
        </p>
      </section>
    </div>
  );
}
