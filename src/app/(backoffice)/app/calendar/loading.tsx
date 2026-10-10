import { Skeleton } from "@/components/ui/feedback";
import styles from "@/modules/scheduling/ui/calendar.module.css";

export default function CalendarLoading() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando agenda"
      className={styles.loading}
    >
      <Skeleton height="3.5rem" width="16rem" />
      <Skeleton height="3rem" />
      <Skeleton className={styles.loadingCalendar} />
    </div>
  );
}
