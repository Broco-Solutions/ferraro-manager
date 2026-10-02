import { expect, test, type Page } from "@playwright/test";

import { createTestPrisma, e2eUsers } from "./auth.fixtures";

const clientName = "Sofía Alvarado — E2E";

async function login(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(e2eUsers.staff.email);
  await page.getByLabel("Contraseña").fill(e2eUsers.staff.password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

test.afterAll(async () => {
  const prisma = createTestPrisma();
  try {
    const clients = await prisma.client.findMany({
      where: { displayName: clientName },
      select: { id: true },
    });
    await prisma.vehicle.deleteMany({
      where: { clientId: { in: clients.map((client) => client.id) } },
    });
    await prisma.client.deleteMany({
      where: { id: { in: clients.map((client) => client.id) } },
    });
  } finally {
    await prisma.$disconnect();
  }
});

test("STAFF creates a client, adds a vehicle and finds it by model", async ({
  page,
}) => {
  await login(page);
  await page.getByRole("link", { name: "Clientes" }).first().click();
  await page.getByRole("link", { name: "Nuevo cliente" }).click();
  await page.getByLabel("Nombre identificatorio *").fill(clientName);
  await page.getByLabel("Teléfono").fill("+54 9 341 555 0198");
  await page.getByRole("button", { name: "Crear cliente" }).click();
  await expect(page.getByRole("heading", { name: clientName })).toBeVisible();

  await page.getByLabel("Marca *").fill("Audi");
  await page.getByLabel("Modelo *").fill("RS3");
  await page.getByLabel("Año").fill("2025");
  await page.getByLabel("Color").fill("Gris Daytona");
  await page.getByRole("button", { name: "Agregar vehículo" }).click();
  await expect(page.getByRole("heading", { name: "Audi RS3" })).toBeVisible();

  await page.getByRole("link", { name: "Clientes" }).first().click();
  await page.getByPlaceholder("Nombre, teléfono o vehículo").fill("RS3");
  await page.getByRole("button", { name: "Aplicar" }).click();
  await expect(page.getByText(clientName)).toBeVisible();
  await expect(page.getByText("Audi RS3")).toBeVisible();
});
