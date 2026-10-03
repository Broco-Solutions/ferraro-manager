"use client";

import { useEffect, useRef } from "react";

export function GlobalSearchBar() {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    function focusSearch(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", focusSearch);
    return () => window.removeEventListener("keydown", focusSearch);
  }, []);
  return (
    <form action="/app/search" className="global-search-bar" role="search">
      <label htmlFor="global-search">Buscar en Ferraro</label>
      <input
        ref={inputRef}
        id="global-search"
        name="q"
        type="search"
        minLength={2}
        placeholder="Cliente, M3, trabajo, presupuesto…"
      />
      <kbd>Ctrl K</kbd>
      <button>Buscar</button>
    </form>
  );
}
