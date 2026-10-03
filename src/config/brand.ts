export const brandConfig = {
  productName: "Ferraro Manager",
  businessName: "Ferraro Detail",
  shortName: "Ferraro",
  mark: "F",
  location: "Rosario, Santa Fe",
  country: "Argentina",
  contact: {
    phone: "",
    email: "",
    instagram: "",
  },
  pdf: {
    templateVersion: 1,
    defaultTerms:
      "Los valores se expresan en USD. La fecha de ejecución queda sujeta a disponibilidad de agenda.",
  },
  theme: {
    accentToken: "--color-accent",
    surfaceToken: "--color-surface",
  },
} as const;

export type BrandConfig = typeof brandConfig;
