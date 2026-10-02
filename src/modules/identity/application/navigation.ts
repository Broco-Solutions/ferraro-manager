import type { UserRole } from "@/modules/identity/domain/roles";

export interface NavigationItem {
  label: string;
  href?: string;
  shortLabel: string;
  roles: readonly UserRole[];
  upcoming?: boolean;
}

const navigation: readonly NavigationItem[] = [
  {
    label: "Inicio",
    shortLabel: "Inicio",
    href: "/app",
    roles: ["ADMIN", "STAFF"],
  },
  {
    label: "Agenda",
    shortLabel: "Agenda",
    roles: ["ADMIN", "STAFF"],
    upcoming: true,
  },
  {
    label: "Clientes",
    shortLabel: "Clientes",
    href: "/app/clients",
    roles: ["ADMIN", "STAFF"],
  },
  {
    label: "Trabajos",
    shortLabel: "Trabajos",
    roles: ["ADMIN", "STAFF"],
    upcoming: true,
  },
  {
    label: "Inventario",
    shortLabel: "Stock",
    roles: ["ADMIN", "STAFF"],
    upcoming: true,
  },
  {
    label: "Administración",
    shortLabel: "Admin",
    href: "/app/admin",
    roles: ["ADMIN"],
  },
] as const;

export function getNavigationForRole(role: UserRole): NavigationItem[] {
  return navigation.filter((item) => item.roles.includes(role));
}
