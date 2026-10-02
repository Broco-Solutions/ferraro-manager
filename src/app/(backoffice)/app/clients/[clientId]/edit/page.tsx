import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getClientDetail } from "@/modules/clients/application/client-service";
import { ClientForm } from "@/modules/clients/ui/client-form";

export const metadata: Metadata = { title: "Editar cliente" };

export default async function EditClientPage({
  params,
}: {
  params: Promise<{ clientId: string }>;
}) {
  const { clientId } = await params;
  const client = await getClientDetail(clientId);
  if (!client) notFound();
  return (
    <div className="page-stack page-narrow">
      <Link href={`/app/clients/${client.id}`} className="back-link">
        ← Volver a la ficha
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Cliente</p>
          <h1>Editar {client.displayName}</h1>
        </div>
      </header>
      <ClientForm values={client} />
    </div>
  );
}
