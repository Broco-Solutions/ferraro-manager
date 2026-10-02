import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";

import { brandConfig } from "@/config/brand";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: brandConfig.productName,
    template: `%s · ${brandConfig.productName}`,
  },
  description: "Gestión interna de Ferraro Detail.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#151714",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
