export default function ClientsLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Cargando clientes">
      <div className="skeleton skeleton-title" />
      <div className="skeleton skeleton-filter" />
      <div className="skeleton-list">
        {Array.from({ length: 4 }, (_, index) => (
          <div className="skeleton skeleton-row" key={index} />
        ))}
      </div>
    </div>
  );
}
