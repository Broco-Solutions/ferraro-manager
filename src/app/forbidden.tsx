import Link from "next/link";

export default function ForbiddenPage() {
  return (
    <main className="state-page">
      <div className="state-card">
        <p className="state-code">403</p>
        <h1>No tenés acceso a esta sección</h1>
        <p>Tu sesión es válida, pero tu rol no permite realizar esta acción.</p>
        <Link className="primary-button button-link" href="/app">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
