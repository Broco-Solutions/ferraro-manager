import Link from "next/link";
import type { ReactNode } from "react";

import { brandConfig } from "@/config/brand";
import { getNavigationForRole } from "@/modules/identity/application/navigation";
import type { AuthenticatedUser } from "@/modules/identity/application/session";
import { LogoutButton } from "@/modules/identity/ui/logout-button";
import { GlobalSearchBar } from "@/modules/search/ui/global-search-bar";
import { MobileMenu } from "@/components/patterns/mobile-menu";

interface AppShellProps {
  children: ReactNode;
  user: AuthenticatedUser;
}

function Navigation({ user }: { user: AuthenticatedUser }) {
  const items = getNavigationForRole(user.role);

  return (
    <nav aria-label="Navegación principal" className="primary-nav">
      {items.map((item) =>
        item.href ? (
          <Link key={item.label} href={item.href} className="nav-link">
            <span className="nav-dot" aria-hidden="true" />
            <span>{item.label}</span>
          </Link>
        ) : (
          <span
            key={item.label}
            className="nav-link nav-link-disabled"
            aria-disabled="true"
            title="Disponible en un próximo BUILD"
          >
            <span className="nav-dot" aria-hidden="true" />
            <span>{item.label}</span>
            <span className="nav-upcoming">Próximo</span>
          </span>
        ),
      )}
    </nav>
  );
}

export function AppShell({ children, user }: AppShellProps) {
  const mobileItems = getNavigationForRole(user.role).filter(
    (item) => item.href && item.mobile,
  );

  return (
    <div className="app-shell">
      <aside className="desktop-sidebar">
        <Link className="brand-lockup" href="/app" aria-label="Ir al inicio">
          <span className="brand-mark">{brandConfig.mark}</span>
          <span className="brand-copy">
            <strong>{brandConfig.shortName}</strong>
            <small>Manager</small>
          </span>
        </Link>

        <Navigation user={user} />

        <div className="sidebar-account">
          <span className="account-avatar" aria-hidden="true">
            {user.name.slice(0, 1).toUpperCase()}
          </span>
          <div>
            <strong>{user.name}</strong>
            <small>{user.role === "ADMIN" ? "Administrador" : "Equipo"}</small>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="app-main-column">
        <header className="mobile-header">
          <Link className="brand-lockup" href="/app" aria-label="Ir al inicio">
            <span className="brand-mark">{brandConfig.mark}</span>
            <span className="brand-copy">
              <strong>{brandConfig.shortName}</strong>
              <small>Manager</small>
            </span>
          </Link>
          <MobileMenu>
            <Navigation user={user} />
            <LogoutButton />
          </MobileMenu>
        </header>

        <GlobalSearchBar />

        <main className="app-content">{children}</main>

        <nav className="mobile-bottom-nav" aria-label="Accesos rápidos">
          {mobileItems.map((item) => (
            <Link key={item.label} href={item.href ?? "/app"}>
              <span className="nav-dot" aria-hidden="true" />
              {item.shortLabel}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
