"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="es-AR">
      <body>
        <main className="state-page">
          <div className="state-card">
            <p className="state-code">Error</p>
            <h1>Ferraro Manager no pudo iniciar</h1>
            <p>Reintentá. Si persiste, contactá al responsable técnico.</p>
            <button className="primary-button" type="button" onClick={reset}>
              Reintentar
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
