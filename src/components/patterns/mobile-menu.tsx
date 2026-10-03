"use client";

import { useEffect, useRef, type MouseEvent, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export function MobileMenu({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    menuRef.current?.removeAttribute("open");
  }, [pathname]);

  function closeAfterNavigation(event: MouseEvent<HTMLDetailsElement>) {
    if (event.target instanceof Element && event.target.closest("a")) {
      menuRef.current?.removeAttribute("open");
    }
  }

  return (
    <details
      className="mobile-menu"
      ref={menuRef}
      onClick={closeAfterNavigation}
    >
      <summary aria-label="Abrir menú">Menú</summary>
      <div className="mobile-menu-panel">{children}</div>
    </details>
  );
}
