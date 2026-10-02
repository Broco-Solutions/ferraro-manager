import type { UserRole } from "@/modules/identity/domain/roles";

export interface NavigationItem {
  label: string;
  href?: string;
  shortLabel: string;
  roles: readonly UserRole[];
  mobile?: boolean;
  upcoming?: boolean;
}

const navigation: readonly NavigationItem[] = [
  {
    label: "Inicio",
    shortLabel: "Inicio",
    href: "/app",
    roles: ["ADMIN", "STAFF"],
    mobile: true,
  },
  {
    label: "Agenda",
    shortLabel: "Agenda",
    href: "/app/calendar",
    roles: ["ADMIN", "STAFF"],
    mobile: true,
  },
  {
    label: "Clientes",
    shortLabel: "Clientes",
    href: "/app/clients",
    roles: ["ADMIN", "STAFF"],
    mobile: true,
  },
  {
    label: "Trabajos",
    shortLabel: "Trabajos",
    roles: ["ADMIN", "STAFF"],
    mobile: true,
    upcoming: true,
  },
  {
    label: "Inventario",
    shortLabel: "Stock",
    roles: ["ADMIN", "STAFF"],
    mobile: true,
    upcoming: true,
  },
  {
    label: "Servicios",
    shortLabel: "Servicios",
    href: "/app/services",
    roles: ["ADMIN"],
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
