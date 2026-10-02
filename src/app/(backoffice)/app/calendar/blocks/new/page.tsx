import type { Metadata } from "next";
import Link from "next/link";

import { BlockForm } from "@/modules/scheduling/ui/block-form";
import { getBusinessDateKey } from "@/shared/date-time/business-time";

export const metadata: Metadata = { title: "Bloquear agenda" };

export default async function NewBlockPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const date =
    params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date)
      ? params.date
      : getBusinessDateKey(new Date());
  return (
    <div className="page-stack page-narrow">
      <Link href={`/app/calendar?view=day&date=${date}`} className="back-link">
        ← Agenda
      </Link>
      <header className="page-header">
        <div>
          <p className="eyebrow">Indisponibilidad</p>
          <h1>Bloquear agenda</h1>
          <p className="page-description">No crea cliente, turno ni trabajo.</p>
        </div>
      </header>
      <BlockForm startLocal={`${date}T09:00`} endLocal={`${date}T18:00`} />
    </div>
  );
}
