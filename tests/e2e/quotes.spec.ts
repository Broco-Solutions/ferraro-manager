import { rm } from "node:fs/promises";
import path from "node:path";

import { expect, test, type Page } from "@playwright/test";

import {
  createTestPrisma,
  e2eUsers,
  resetE2EAuthRateLimit,
} from "./auth.fixtures";

const clientName = "Presupuesto E2E Cliente";
const serviceName = "PPF Frontal E2E";
const categoryName = "Presupuesto E2E Protección";
let clientId = "";
let vehicleId = "";
let serviceId = "";

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
    const clients = await prisma.client.findMany({
      where: { displayName: clientName },
      select: { id: true },
    });
    const clientIds = clients.map((item) => item.id);
    const quotes = await prisma.quote.findMany({
      where: { clientId: { in: clientIds } },
      select: { id: true },
    });
    const quoteIds = quotes.map((item) => item.id);
    const cases = await prisma.serviceCase.findMany({
      where: { acceptedQuoteId: { in: quoteIds } },
      select: { id: true },
    });
    const caseIds = cases.map((item) => item.id);
    const appointments = await prisma.appointment.findMany({
      where: { serviceCaseId: { in: caseIds } },
      select: { id: true },
    });
    const appointmentIds = appointments.map((item) => item.id);
    await prisma.appointmentEmployee.deleteMany({
      where: { appointmentId: { in: appointmentIds } },
    });
    await prisma.appointmentService.deleteMany({
      where: { appointmentId: { in: appointmentIds } },
    });
    await prisma.idempotencyKey.deleteMany({
      where: { resultReference: { in: appointmentIds } },
    });
    await prisma.appointment.deleteMany({
      where: { id: { in: appointmentIds } },
    });
    await prisma.serviceCaseAmountRevision.deleteMany({
      where: { serviceCaseId: { in: caseIds } },
    });
    await prisma.serviceCase.deleteMany({ where: { id: { in: caseIds } } });
    await prisma.quoteItem.deleteMany({ where: { quoteId: { in: quoteIds } } });
    await prisma.quote.deleteMany({ where: { id: { in: quoteIds } } });
    for (const id of quoteIds) {
      await rm(path.resolve(process.cwd(), ".data/private/quotes", id), {
        recursive: true,
        force: true,
      });
    }
    const services = await prisma.service.findMany({
      where: { name: serviceName },
      select: { id: true },
    });
    await prisma.service.deleteMany({
      where: { id: { in: services.map((item) => item.id) } },
    });
    await prisma.serviceCategory.deleteMany({ where: { name: categoryName } });
    await prisma.vehicle.deleteMany({ where: { clientId: { in: clientIds } } });
    await prisma.client.deleteMany({ where: { id: { in: clientIds } } });
  } finally {
    await prisma.$disconnect();
  }
}

test.beforeAll(async () => {
  await cleanup();
  const prisma = createTestPrisma();
  try {
    clientId = (
      await prisma.client.create({ data: { displayName: clientName } })
    ).id;
    vehicleId = (
      await prisma.vehicle.create({
        data: {
          clientId,
          brand: "BMW",
          model: "M3",
          year: 2026,
          color: "Negro",
        },
      })
    ).id;
    const category = await prisma.serviceCategory.create({
      data: { name: categoryName },
    });
    serviceId = (
      await prisma.service.create({
        data: {
          categoryId: category.id,
          name: serviceName,
          commercialDescription: "Protección de frente completo",
          basePriceUsd: "850",
        },
      })
    ).id;
  } finally {
    await prisma.$disconnect();
  }
});
test.afterAll(cleanup);

test("ADMIN creates, emits, accepts and converts a quote into the same case appointment", async ({
  page,
}) => {
  test.setTimeout(90_000);
  await login(page, e2eUsers.admin);
  await page.goto("/app/quotes/new");
  await page.getByLabel("Cliente *").selectOption(clientId);
  await page.getByLabel("Vehículo *").selectOption(vehicleId);
  await page.getByLabel("Desde catálogo").selectOption(serviceId);
  await expect(page.getByLabel("Nombre *")).toHaveValue(serviceName);
  await page.getByLabel("Descuento general USD").fill("50");
  await page.getByLabel("Observaciones").fill("Propuesta E2E premium");
  await page.getByRole("button", { name: "Crear presupuesto" }).click();
  await expect(page.getByText("El borrador quedó guardado.")).toBeVisible();
  await expect(page.getByText("USD 800.00").last()).toBeVisible();

  const previewHref = await page
    .getByRole("link", { name: "Preview PDF" })
    .getAttribute("href");
  expect(previewHref).toBeTruthy();
  const preview = await page.request.get(previewHref!);
  expect(preview.ok()).toBeTruthy();
  expect(preview.headers()["content-type"]).toContain("application/pdf");
  expect((await preview.body()).subarray(0, 4).toString()).toBe("%PDF");

  await page.getByRole("button", { name: "Emitir presupuesto" }).click();
  await page
    .getByRole("alertdialog", { name: "Confirmar acción" })
    .getByRole("button", { name: "Emitir presupuesto" })
    .click();
  await expect(
    page.getByText("Presupuesto emitido y PDF congelado."),
  ).toBeVisible();
  await page.getByRole("button", { name: "Marcar aceptado" }).click();
  await page
    .getByRole("alertdialog", { name: "Confirmar acción" })
    .getByRole("button", { name: "Marcar aceptado" })
    .click();
  await expect(
    page.getByText("El importe acordado quedó fijado."),
  ).toBeVisible();
  await page.getByRole("link", { name: "Convertir en turno" }).click();
  await page.getByLabel("Inicio *").fill("2027-03-12T09:00");
  await page.getByLabel("Fin *").fill("2027-03-12T14:00");
  await page.getByRole("button", { name: "Crear turno" }).click();
  await expect(page.getByText("Turno confirmado")).toBeVisible();

  const prisma = createTestPrisma();
  try {
    const quote = await prisma.quote.findFirstOrThrow({
      where: { clientId },
      select: { id: true },
    });
    const serviceCase = await prisma.serviceCase.findUniqueOrThrow({
      where: { acceptedQuoteId: quote.id },
      select: { id: true, agreedAmountUsd: true },
    });
    const appointmentCount = await prisma.appointment.count({
      where: { serviceCaseId: serviceCase.id },
    });
    expect(serviceCase.agreedAmountUsd?.toFixed(2)).toBe("800.00");
    expect(appointmentCount).toBe(1);
  } finally {
    await prisma.$disconnect();
  }
});

test("STAFF cannot access quote data or its PDF route", async ({ page }) => {
  await login(page, e2eUsers.staff);
  await page.goto("/app/quotes");
  await expect(page.getByText("403")).toBeVisible();
  const prisma = createTestPrisma();
  const quote = await prisma.quote.findFirst({
    where: { clientId },
    select: { id: true },
  });
  await prisma.$disconnect();
  expect(quote).toBeTruthy();
  const response = await page.request.get(`/api/quotes/${quote!.id}/pdf`);
  expect(response.status()).toBe(403);
});
