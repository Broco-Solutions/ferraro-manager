import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="state-page">
      <div className="state-card">
        <p className="state-code">404</p>
        <h1>Esta página no existe</h1>
        <p>
          La dirección puede ser incorrecta o el contenido ya no está
          disponible.
        </p>
        <Link className="primary-button button-link" href="/app">
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
