"use client";

import { type FormEvent, useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/infrastructure/auth/client";

const genericError =
  "No pudimos iniciar sesión. Revisá tus datos e intentá nuevamente.";

const subscribeToHydration = () => () => undefined;
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function LoginForm() {
  const router = useRouter();
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    getClientSnapshot,
    getServerSnapshot,
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");

    const response = await authClient.signIn.email({
      email,
      password,
      rememberMe: false,
    });

    if (response.error) {
      setError(genericError);
      setIsSubmitting(false);
      return;
    }

    router.replace("/app");
    router.refresh();
  }

  return (
    <form
      className="login-form"
      method="post"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="field-group">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          inputMode="email"
          required
          autoFocus
          disabled={!isHydrated || isSubmitting}
        />
      </div>

      <div className="field-group">
        <label htmlFor="password">Contraseña</label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          minLength={12}
          required
          disabled={!isHydrated || isSubmitting}
        />
      </div>

      {error ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button
        className="primary-button"
        type="submit"
        disabled={!isHydrated || isSubmitting}
      >
        {isSubmitting ? "Ingresando…" : "Ingresar"}
      </button>
    </form>
  );
}
