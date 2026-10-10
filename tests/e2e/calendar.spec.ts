import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

import {
  createTestPrisma,
  e2eUsers,
  resetE2EAuthRateLimit,
} from "./auth.fixtures";

const clientName = "Agenda E2E Cliente";
const categoryName = "Agenda E2E Categoría";
let clientId = "";

async function login(page: Page) {
  await resetE2EAuthRateLimit();
  await page.goto("/login");
  await page.getByLabel("Email").fill(e2eUsers.staff.email);
  await page
    .getByRole("textbox", { name: "Contraseña" })
    .fill(e2eUsers.staff.password);
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
    const ids = clients.map((client) => client.id);
    const cases = await prisma.serviceCase.findMany({
      where: { clientId: { in: ids } },
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
    await prisma.appointment.deleteMany({
      where: { id: { in: appointmentIds } },
    });
    await prisma.idempotencyKey.deleteMany({
      where: { resultReference: { in: appointmentIds } },
    });
    await prisma.serviceCase.deleteMany({ where: { id: { in: caseIds } } });
    await prisma.vehicle.deleteMany({ where: { clientId: { in: ids } } });
    await prisma.client.deleteMany({ where: { id: { in: ids } } });
    await prisma.calendarBlock.deleteMany({
      where: { reason: "Agenda E2E bloqueo" },
    });
    const categories = await prisma.serviceCategory.findMany({
      where: { name: categoryName },
      select: { id: true },
    });
    await prisma.service.deleteMany({
      where: { categoryId: { in: categories.map((category) => category.id) } },
    });
    await prisma.serviceCategory.deleteMany({
      where: { id: { in: categories.map((category) => category.id) } },
    });
  } finally {
    await prisma.$disconnect();
  }
}

test.beforeAll(async () => {
  await cleanup();
  const prisma = createTestPrisma();
  try {
    const client = await prisma.client.create({
      data: { displayName: clientName },
    });
    clientId = client.id;
    await prisma.vehicle.create({
      data: { clientId, brand: "BMW", model: "M3", year: 2024 },
    });
    const category = await prisma.serviceCategory.create({
      data: { name: categoryName },
    });
    await prisma.service.create({
      data: {
        categoryId: category.id,
        name: "Cerámico Agenda E2E",
        estimatedDurationMinutes: 240,
      },
    });
  } finally {
    await prisma.$disconnect();
  }
});
test.afterAll(cleanup);

test("STAFF schedules overlapping cars and a block prevents a new reservation", async ({
  page,
}) => {
  test.setTimeout(60_000);
  await login(page);
  await page.goto("/app/calendar/new?date=2026-10-15");
  await page.getByLabel("Cliente *").selectOption(clientId);
  await page.getByLabel("Inicio *").fill("2026-10-15T09:00");
  await page.getByLabel("Fin *").fill("2026-10-15T13:00");
  await page.getByText("Cerámico Agenda E2E").click();
  await page.getByRole("button", { name: "Crear turno" }).click();
  await expect(page.getByText("Turno confirmado")).toBeVisible();

  await page.goto("/app/calendar/new?date=2026-10-15");
  await page.getByLabel("Cliente *").selectOption(clientId);
  await page.getByLabel("Inicio *").fill("2026-10-15T10:00");
  await page.getByLabel("Fin *").fill("2026-10-15T12:00");
  await page.getByRole("button", { name: "Crear turno" }).click();
  await expect(page.getByText("Turno confirmado")).toBeVisible();

  await page.goto("/app/calendar/blocks/new?date=2026-10-16");
  await page.getByLabel("Motivo *").fill("Agenda E2E bloqueo");
  await page.getByLabel("Inicio *").fill("2026-10-16T09:00");
  await page.getByLabel("Fin *").fill("2026-10-16T18:00");
  await page.getByRole("button", { name: "Crear bloqueo" }).click();
  await expect(page.getByText("Bloqueo creado correctamente.")).toBeVisible();

  await page.goto("/app/calendar/new?date=2026-10-16");
  await page.getByLabel("Cliente *").selectOption(clientId);
  await page.getByLabel("Inicio *").fill("2026-10-16T10:00");
  await page.getByLabel("Fin *").fill("2026-10-16T12:00");
  await page.getByRole("button", { name: "Crear turno" }).click();
  await expect(
    page.getByRole("alert").filter({ hasText: "horario está bloqueado" }),
  ).toBeVisible();
});

test("calendar views, date control and status labels remain keyboard accessible", async ({
  page,
}) => {
  await login(page);
  await page.goto("/app/calendar?view=day&date=2026-10-15");

  await expect(page.getByLabel(/BMW M3, Confirmado/)).toHaveCount(2);
  const dayAxe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(dayAxe.violations).toEqual([]);

  const weekView = page.getByRole("link", { name: "Semana" });
  await weekView.focus();
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/view=week&date=2026-10-15/);
  await expect(
    page.getByRole("region", { name: "Semana desplazable" }),
  ).toBeVisible();

  await page.getByLabel("Elegir fecha").fill("2026-10-16");
  await expect(page).toHaveURL(/view=week&date=2026-10-16/);
  await expect(page.getByText("Agenda E2E bloqueo")).toBeVisible();

  await page.getByRole("link", { name: "Mes" }).click();
  await expect(page).toHaveURL(/view=month&date=2026-10-16/);
  await expect(
    page.getByRole("region", { name: /viernes, 16 de octubre de 2026/i }),
  ).toBeVisible();
});
