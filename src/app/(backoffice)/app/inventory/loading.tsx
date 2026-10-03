export default function InventoryLoading() {
  return (
    <div
      className="page-stack"
      aria-busy="true"
      aria-label="Cargando inventario"
    >
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-filter" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
      <div className="skeleton skeleton-row" />
    </div>
  );
}
