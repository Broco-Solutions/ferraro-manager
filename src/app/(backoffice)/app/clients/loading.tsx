import { Skeleton } from "@/components/ui/feedback";
import styles from "@/modules/clients/ui/clients.module.css";

export default function ClientsLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando clientes"
      className={styles.loading}
    >
      <Skeleton height="3.5rem" width="18rem" />
      <Skeleton height="4.5rem" />
      <div className={styles.loading}>
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton height="5.75rem" key={index} />
        ))}
      </div>
    </div>
  );
}
