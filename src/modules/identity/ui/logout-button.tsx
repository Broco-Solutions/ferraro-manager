"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { authClient } from "@/infrastructure/auth/client";

export function LogoutButton() {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  async function handleLogout() {
    setIsPending(true);
    await authClient.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <button
      className="ghost-button"
      type="button"
      onClick={handleLogout}
      disabled={isPending}
    >
      {isPending ? "Saliendo…" : "Cerrar sesión"}
    </button>
  );
}
