import { expect, test, type Page } from "@playwright/test";

import {
  createTestPrisma,
  e2eUsers,
  resetE2EAuthRateLimit,
} from "./auth.fixtures";

const categoryName = "Compras E2E";
const itemName = "PPF Compra E2E";
const supplierName = "Proveedor E2E";

async function login(
  page: Page,
  user: (typeof e2eUsers)[keyof typeof e2eUsers],
) {
  await resetE2EAuthRateLimit();
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Contraseña").fill(user.password);
  await page.getByRole("button", { name: "Ingresar" }).click();
  await expect(page).toHaveURL(/\/app$/);
}

async function cleanup() {
  const prisma = createTestPrisma();
  try {
    const purchases = await prisma.purchase.findMany({
      where: { supplier: { name: supplierName } },
      select: { id: true },
    });
    const purchaseIds = purchases.map((purchase) => purchase.id);
    const purchaseItems = await prisma.purchaseItem.findMany({
      where: { purchaseId: { in: purchaseIds } },
      select: { id: true, itemId: true },
    });
    const itemIds = [...new Set(purchaseItems.map((item) => item.itemId))];
    const movements = await prisma.inventoryMovement.findMany({
      where: {
        OR: [
          { purchaseItemId: { in: purchaseItems.map((item) => item.id) } },
          { itemId: { in: itemIds } },
        ],
      },
      select: { id: true },
    });
    await prisma.idempotencyKey.deleteMany({
      where: {
        OR: [
          { resultReference: { in: purchaseIds } },
          { resultReference: { in: movements.map((movement) => movement.id) } },
        ],
      },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { reversalOfId: { not: null }, itemId: { in: itemIds } },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { itemId: { in: itemIds } },
    });
    const financial = await prisma.financialEntry.findMany({
      where: {
        OR: [
          { purchaseId: { in: purchaseIds } },
          { reversalOf: { purchaseId: { in: purchaseIds } } },
        ],
      },
      select: { id: true, reversalOfId: true },
    });
    await prisma.financialEntry.deleteMany({
      where: {
        id: {
          in: financial
            .filter((entry) => entry.reversalOfId)
            .map((entry) => entry.id),
        },
      },
    });
    await prisma.financialEntry.deleteMany({
      where: { purchaseId: { in: purchaseIds } },
    });
    await prisma.purchaseItem.deleteMany({
      where: { purchaseId: { in: purchaseIds } },
    });
    await prisma.purchase.deleteMany({ where: { id: { in: purchaseIds } } });
    const inventoryItems = await prisma.inventoryItem.findMany({
      where: { name: itemName },
      select: { id: true },
    });
    const inventoryIds = inventoryItems.map((item) => item.id);
    await prisma.purchasePresentation.deleteMany({
      where: { itemId: { in: inventoryIds } },
    });
    await prisma.inventoryItem.deleteMany({
      where: { id: { in: inventoryIds } },
    });
    await prisma.inventoryCategory.deleteMany({
      where: { name: categoryName },
    });
    await prisma.supplier.deleteMany({ where: { name: supplierName } });
  } finally {
    await prisma.$disconnect();
  }
}

test.beforeAll(async () => {
  await cleanup();
  const prisma = createTestPrisma();
  try {
    const category = await prisma.inventoryCategory.create({
      data: { name: categoryName },
    });
    const item = await prisma.inventoryItem.create({
      data: {
        categoryId: category.id,
        name: itemName,
        sku: "BUY-E2E",
        baseUnit: "meter",
        minimumStock: "5",
      },
    });
    await prisma.purchasePresentation.create({
      data: { itemId: item.id, name: "Rollo 15 m", factorToBase: "15" },
    });
  } finally {
    await prisma.$disconnect();
  }
});
test.afterAll(cleanup);

test("ADMIN posts one purchase into stock and cash while STAFF is denied", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await login(page, e2eUsers.admin);
  await page.getByRole("link", { name: "Compras", exact: true }).click();
  await page.getByRole("link", { name: "Proveedores" }).click();
  await page.getByLabel("Nombre *").fill(supplierName);
  await page.getByRole("button", { name: "Agregar proveedor" }).click();
  await expect(page.getByText(supplierName)).toBeVisible();
  await page.getByRole("link", { name: "← Compras" }).click();
  await page.getByRole("link", { name: "Nueva compra" }).click();
  await page.getByLabel("Proveedor *").selectOption({ label: supplierName });
  await page.getByLabel("Artículo *").selectOption({ label: itemName });
  await page.getByLabel("Presentación *").selectOption({ label: "Rollo 15 m" });
  await page.getByLabel("Cantidad *").fill("2");
  await page.getByLabel("Costo unitario USD *").fill("600");
  await page.getByRole("button", { name: "Registrar compra" }).click();
  await expect(
    page.getByText("Compra registrada: stock y egreso se actualizaron juntos."),
  ).toBeVisible();
  await expect(page.getByText("+30.000 m")).toBeVisible();
  await expect(page.getByText("Egreso USD 1200.00")).toBeVisible();
  await page.getByRole("button", { name: "Cerrar sesión" }).click();

  await login(page, e2eUsers.staff);
  await expect(
    page.getByRole("link", { name: "Compras", exact: true }),
  ).toHaveCount(0);
  await page.goto("/app/purchases");
  await expect(page.getByText("403")).toBeVisible();
});
