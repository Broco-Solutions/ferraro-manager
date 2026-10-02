export const brandConfig = {
  productName: "Ferraro Manager",
  businessName: "Ferraro Detail",
  shortName: "Ferraro",
  mark: "F",
  location: "Rosario, Santa Fe",
  theme: {
    accentToken: "--color-accent",
    surfaceToken: "--color-surface",
  },
} as const;

export type BrandConfig = typeof brandConfig;
