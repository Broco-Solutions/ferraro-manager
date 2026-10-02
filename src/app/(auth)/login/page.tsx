import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { brandConfig } from "@/config/brand";
import { getOptionalSession } from "@/modules/identity/application/session";
import { LoginForm } from "@/modules/identity/ui/login-form";

export const metadata: Metadata = { title: "Ingresar" };

export default async function LoginPage() {
  const session = await getOptionalSession();

  if (session) {
    redirect("/app");
  }

  return (
    <main className="login-page">
      <section className="login-brand-panel" aria-label="Ferraro Manager">
        <div className="login-brand-content">
          <span className="brand-mark brand-mark-large">
            {brandConfig.mark}
          </span>
          <p className="eyebrow">Rosario · Argentina</p>
          <h1>El taller, claro y bajo control.</h1>
          <p>Una base simple y precisa para operar cada jornada de Ferraro.</p>
        </div>
      </section>

      <section className="login-form-panel">
        <div className="login-card">
          <div className="mobile-login-brand">
            <span className="brand-mark">{brandConfig.mark}</span>
            <strong>{brandConfig.productName}</strong>
          </div>
          <p className="eyebrow">Acceso interno</p>
          <h2>Bienvenido</h2>
          <p className="muted-copy">
            Ingresá con las credenciales provistas por un administrador.
          </p>
          <LoginForm />
          <p className="login-help">
            El registro público está deshabilitado. Si necesitás acceso,
            contactá a un administrador.
          </p>
        </div>
      </section>
    </main>
  );
}
