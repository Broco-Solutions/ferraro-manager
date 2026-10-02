import { expect, test, type Page } from "@playwright/test";

import {
  createTestPrisma,
  e2eUsers,
  resetE2EAuthRateLimit,
} from "./auth.fixtures";

const clientName = "Trabajo E2E Cliente";
const serviceName = "Trabajo E2E Cerámico";
let appointmentId = "";
let caseId = "";
let clientId = "";
let vehicleId = "";
let categoryId = "";
let serviceId = "";

async function login(page: Page) {
  await resetE2EAuthRateLimit();
  await page.goto("/login");
  await page.getByLabel("Email").fill(e2eUsers.staff.email);
  await page.getByLabel("Contraseña").fill(e2eUsers.staff.password);
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
    const cases = await prisma.serviceCase.findMany({
      where: { clientId: { in: clientIds } },
      select: { id: true },
    });
    const caseIds = cases.map((item) => item.id);
    const appointments = await prisma.appointment.findMany({
      where: { serviceCaseId: { in: caseIds } },
      select: { id: true },
    });
    const appointmentIds = appointments.map((item) => item.id);
    const jobs = await prisma.job.findMany({
      where: { serviceCaseId: { in: caseIds } },
      select: { id: true },
    });
    const jobIds = jobs.map((item) => item.id);
    await prisma.jobEmployee.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.jobService.deleteMany({ where: { jobId: { in: jobIds } } });
    await prisma.job.deleteMany({ where: { id: { in: jobIds } } });
    await prisma.appointmentEmployee.deleteMany({
      where: { appointmentId: { in: appointmentIds } },
    });
    await prisma.appointmentService.deleteMany({
      where: { appointmentId: { in: appointmentIds } },
    });
    await prisma.appointment.deleteMany({
      where: { id: { in: appointmentIds } },
    });
    await prisma.serviceCase.deleteMany({ where: { id: { in: caseIds } } });
    const services = await prisma.service.findMany({
      where: { name: serviceName },
      select: { id: true },
    });
    await prisma.service.deleteMany({
      where: { id: { in: services.map((item) => item.id) } },
    });
    await prisma.serviceCategory.deleteMany({
      where: { name: "Trabajo E2E Categoría" },
    });
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
    const client = await prisma.client.create({
      data: { displayName: clientName },
    });
    clientId = client.id;
    const vehicle = await prisma.vehicle.create({
      data: { clientId, brand: "Mercedes-Benz", model: "AMG GT", year: 2025 },
    });
    vehicleId = vehicle.id;
    const category = await prisma.serviceCategory.create({
      data: { name: "Trabajo E2E Categoría" },
    });
    categoryId = category.id;
    const service = await prisma.service.create({
      data: { categoryId, name: serviceName },
    });
    serviceId = service.id;
    const serviceCase = await prisma.serviceCase.create({
      data: { clientId, vehicleId, origin: "DIRECT_APPOINTMENT" },
    });
    caseId = serviceCase.id;
    const appointment = await prisma.appointment.create({
      data: {
        serviceCaseId: caseId,
        startAt: new Date("2026-10-22T12:00:00Z"),
        endAt: new Date("2026-10-22T16:00:00Z"),
        services: { create: { serviceId, nameSnapshot: serviceName } },
      },
    });
    appointmentId = appointment.id;
  } finally {
    await prisma.$disconnect();
  }
});
test.afterAll(cleanup);

test("STAFF converts a confirmed appointment into a separate job", async ({
  page,
}) => {
  await login(page);
  await page.goto(`/app/calendar/${appointmentId}`);
  await page.getByRole("link", { name: "Marcar realizado" }).click();
  await expect(
    page.getByRole("heading", { name: "Marcar como realizado" }),
  ).toBeVisible();
  await expect(page.getByText(clientName)).toBeVisible();
  await expect(page.getByText(serviceName)).toBeVisible();
  await page.getByLabel("Notas del trabajo").fill("Control final E2E completo");
  await page
    .getByRole("button", { name: "Confirmar trabajo realizado" })
    .click();
  await expect(page.getByText("El trabajo quedó registrado.")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Mercedes-Benz AMG GT" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Ver turno" }).click();
  await expect(page.getByText("Trabajo realizado").first()).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver trabajo" })).toBeVisible();
});
