import type { Metadata } from "next";
import { LockKeyIcon, PaletteIcon } from "@phosphor-icons/react/dist/ssr";

import { Page, PageHeader } from "@/components/patterns/page";
import { requireRole } from "@/modules/identity/application/authorization";
import styles from "@/modules/search/ui/search-results.module.css";

export const metadata: Metadata = { title: "Administración" };

export default async function AdminFoundationPage() {
  await requireRole("ADMIN");

  return (
    <Page className={styles.page} size="narrow">
      <PageHeader
        eyebrow="Sólo ADMIN"
        title="Administración"
        description="Configuración disponible en esta versión, protegida por autorización en servidor."
      />
      <section
        className={styles.adminList}
        aria-label="Configuración administrativa"
      >
        <article className={styles.adminRow}>
          <LockKeyIcon aria-hidden="true" size={24} weight="duotone" />
          <div>
            <strong>Control de acceso</strong>
            <p>La ruta y sus proyecciones validan rol ADMIN en servidor.</p>
          </div>
          <span className="status-badge status-active">Verificado</span>
        </article>
        <article className={styles.adminRow}>
          <PaletteIcon aria-hidden="true" size={24} weight="duotone" />
          <div>
            <strong>Sistema visual</strong>
            <p>Catálogo interno de componentes, tokens y estados.</p>
          </div>
          <span className="status-badge">Disponible</span>
        </article>
      </section>
    </Page>
  );
}
