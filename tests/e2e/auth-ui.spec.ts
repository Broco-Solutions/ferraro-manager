import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { e2eUsers, resetE2EAuthRateLimit } from "./auth.fixtures";

test("login exposes branded accessible idle and error states", async ({
  page,
}) => {
  await resetE2EAuthRateLimit();
  await page.goto("/login");

  await expect(
    page.getByRole("img", { name: "Ferraro Detail" }).first(),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
  const accessibility = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(accessibility.violations).toEqual([]);

  await page.getByLabel("Email").fill(e2eUsers.admin.email);
  await page.getByLabel("Contraseña").fill("credencial-incorrecta");
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "No pudimos ingresar" }),
  ).toBeVisible();
  await expect(page.getByLabel("Email")).toHaveValue(e2eUsers.admin.email);
});

test("login announces its localized submitting state", async ({ page }) => {
  await resetE2EAuthRateLimit();
  await page.route("**/api/auth/sign-in/email", async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    await route.continue();
  });
  await page.goto("/login");
  await page.getByLabel("Email").fill(e2eUsers.staff.email);
  await page.getByLabel("Contraseña").fill(e2eUsers.staff.password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(
    page.getByRole("button", { name: "Ingresando…" }),
  ).toBeDisabled();
  await expect(page).toHaveURL(/\/app$/, { timeout: 15_000 });
});

test("unknown routes use the reusable branded not-found state", async ({
  page,
}) => {
  await page.goto("/ruta-inexistente");
  await expect(page.getByText("404")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Esta página no existe" }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Volver al inicio" }),
  ).toHaveAttribute("href", "/app");
});
