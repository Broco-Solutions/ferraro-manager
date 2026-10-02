"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application route error", { digest: error.digest });
  }, [error]);

  return (
    <main className="state-page">
      <div className="state-card">
        <p className="state-code">Error</p>
        <h1>No pudimos cargar esta sección</h1>
        <p>
          Intentá nuevamente. Si el problema continúa, avisá a un administrador.
        </p>
        <button className="primary-button" type="button" onClick={reset}>
          Reintentar
        </button>
      </div>
    </main>
  );
}
