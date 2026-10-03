export default function FinanceLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Cargando finanzas">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-panel" />
      <div className="skeleton skeleton-panel" />
    </div>
  );
}
