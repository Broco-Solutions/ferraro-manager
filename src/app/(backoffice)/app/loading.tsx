export default function AppLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-live="polite">
      <span className="sr-only">Cargando</span>
      <div className="skeleton skeleton-title" />
      <div className="foundation-grid">
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
        <div className="skeleton skeleton-card" />
      </div>
    </div>
  );
}
