export default function CalendarLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Cargando agenda">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-filter" />
      <div className="calendar-skeleton">
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </div>
    </div>
  );
}
