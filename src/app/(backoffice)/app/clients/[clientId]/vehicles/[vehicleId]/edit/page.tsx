import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getVehicleDetail } from "@/modules/clients/application/client-service";
import { VehicleForm } from "@/modules/clients/ui/vehicle-form";

export const metadata: Metadata = { title: "Editar vehículo" };

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ clientId: string; vehicleId: string }>;
}) {
  const { clientId, vehicleId } = await params;
  const vehicle = await getVehicleDetail(clientId, vehicleId);
  if (!vehicle) notFound();
  return (
    <div className="page-stack page-narrow">
      <Link href={`/app/clients/${clientId}`} className="back-link">
        ← Volver a la ficha
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Vehículo</p>
          <h1>
            Editar {vehicle.brand} {vehicle.model}
          </h1>
        </div>
      </header>
      <VehicleForm clientId={clientId} values={vehicle} />
    </div>
  );
}
