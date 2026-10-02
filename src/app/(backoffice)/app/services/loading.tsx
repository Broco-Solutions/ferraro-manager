export default function ServicesLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Cargando catálogo">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-filter" />
      <div className="skeleton-list">
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
        <div className="skeleton skeleton-row" />
      </div>
    </div>
  );
}
