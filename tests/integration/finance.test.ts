import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import { createPostgresAdapter } from "@/infrastructure/db/adapter";
import {
  createFinancialCategory,
  getCaseFinancialSummary,
  listFinancialEntries,
  recordFinancialEntry,
  reverseFinancialEntry,
  setAgreedAmount,
} from "@/modules/finance/application/finance-service";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({
  adapter: createPostgresAdapter(connectionString),
});
const suffix = randomUUID().slice(0, 8);
let actorId = "";
let clientId = "";
let vehicleId = "";
let caseId = "";
let jobId = "";
let categoryId = "";
const entryIds: string[] = [];

describe("finance, deposits and balances", () => {
  beforeAll(async () => {
    actorId = (
      await prisma.user.create({
        data: {
          name: `Finance actor ${suffix}`,
          email: `finance-${suffix}@ferraro.test`,
          emailVerified: true,
          role: "ADMIN",
        },
      })
    ).id;
    clientId = (
      await prisma.client.create({
        data: { displayName: `Finance client ${suffix}` },
      })
    ).id;
    vehicleId = (
      await prisma.vehicle.create({
        data: { clientId, brand: "BMW", model: "M3", year: 2026 },
      })
    ).id;
    caseId = (
      await prisma.serviceCase.create({
        data: {
          clientId,
          vehicleId,
          origin: "DIRECT_JOB",
          createdById: actorId,
        },
      })
    ).id;
    categoryId = (
      await createFinancialCategory(
        { name: `Marketing ${suffix}`, direction: "OUTFLOW" },
        { id: actorId },
      )
    ).id;
  });

  afterAll(async () => {
    await prisma.idempotencyKey.deleteMany({
      where: { resultReference: { in: entryIds } },
    });
    await prisma.financialEntry.deleteMany({
      where: { serviceCaseId: caseId },
    });
    await prisma.financialEntry.deleteMany({ where: { categoryId } });
    await prisma.serviceCaseAmountRevision.deleteMany({
      where: { serviceCaseId: caseId },
    });
    if (jobId) await prisma.job.delete({ where: { id: jobId } });
    await prisma.serviceCase.delete({ where: { id: caseId } });
    await prisma.financialCategory.delete({ where: { id: categoryId } });
    await prisma.vehicle.delete({ where: { id: vehicleId } });
    await prisma.client.delete({ where: { id: clientId } });
    await prisma.user.delete({ where: { id: actorId } });
    await prisma.$disconnect();
  });

  it("does not treat an undefined agreed amount as zero", async () => {
    const summary = await getCaseFinancialSummary(caseId);
    expect(summary?.agreedAmountUsd).toBeNull();
    expect(summary?.collectedUsd.toFixed(2)).toBe("0.00");
    expect(summary?.balanceUsd).toBeNull();
  });

  it("supports a deposit, partials, work with debt, final payment and reversal", async () => {
    await setAgreedAmount(
      { serviceCaseId: caseId, amountUsd: "1000", reason: "Alcance acordado" },
      { id: actorId },
    );

    const depositKey = randomUUID();
    const deposit = await recordFinancialEntry(
      {
        kind: "CUSTOMER_PAYMENT",
        amountUsd: "200",
        occurredLocal: "2026-10-02T10:00",
        serviceCaseId: caseId,
        paymentMethod: "TRANSFER",
        idempotencyKey: depositKey,
      },
      { id: actorId },
    );
    entryIds.push(deposit.id);
    await expect(
      recordFinancialEntry(
        {
          kind: "CUSTOMER_PAYMENT",
          amountUsd: "200",
          occurredLocal: "2026-10-02T10:00",
          serviceCaseId: caseId,
          paymentMethod: "TRANSFER",
          idempotencyKey: depositKey,
        },
        { id: actorId },
      ),
    ).resolves.toMatchObject({ id: deposit.id, replayed: true });

    jobId = (
      await prisma.job.create({
        data: {
          serviceCaseId: caseId,
          performedAt: new Date("2026-10-03T15:00:00.000Z"),
          createdById: actorId,
          updatedById: actorId,
        },
      })
    ).id;
    expect(
      (await getCaseFinancialSummary(caseId))?.balanceUsd?.toFixed(2),
    ).toBe("800.00");

    const partial = await recordFinancialEntry(
      {
        kind: "CUSTOMER_PAYMENT",
        amountUsd: "300",
        occurredLocal: "2026-10-03T13:00",
        serviceCaseId: caseId,
        paymentMethod: "CASH",
        idempotencyKey: randomUUID(),
      },
      { id: actorId },
    );
    entryIds.push(partial.id);
    const reversal = await reverseFinancialEntry(
      { entryId: partial.id, reason: "Carga duplicada" },
      { id: actorId },
    );
    entryIds.push(reversal.id);
    await expect(
      reverseFinancialEntry(
        { entryId: partial.id, reason: "Segundo intento" },
        { id: actorId },
      ),
    ).resolves.toMatchObject({ id: reversal.id, replayed: true });

    const finalPayment = await recordFinancialEntry(
      {
        kind: "CUSTOMER_PAYMENT",
        amountUsd: "800",
        occurredLocal: "2026-10-04T09:00",
        serviceCaseId: caseId,
        paymentMethod: "TRANSFER",
        idempotencyKey: randomUUID(),
      },
      { id: actorId },
    );
    entryIds.push(finalPayment.id);
    const summary = await getCaseFinancialSummary(caseId);
    expect(summary?.collectedUsd.toFixed(2)).toBe("1000.00");
    expect(summary?.balanceUsd?.toFixed(2)).toBe("0.00");
    expect(summary?.revisions).toHaveLength(1);
  });

  it("records a refund as an outflow without changing job state", async () => {
    const refund = await recordFinancialEntry(
      {
        kind: "CUSTOMER_REFUND",
        amountUsd: "50",
        occurredLocal: "2026-10-05T11:00",
        serviceCaseId: caseId,
        paymentMethod: "TRANSFER",
        idempotencyKey: randomUUID(),
      },
      { id: actorId },
    );
    entryIds.push(refund.id);
    const [summary, job] = await Promise.all([
      getCaseFinancialSummary(caseId),
      prisma.job.findUniqueOrThrow({ where: { id: jobId } }),
    ]);
    expect(summary?.collectedUsd.toFixed(2)).toBe("950.00");
    expect(summary?.balanceUsd?.toFixed(2)).toBe("50.00");
    expect(job.voidedAt).toBeNull();
  });

  it("records categorized manual cash without attaching it to a customer", async () => {
    const expense = await recordFinancialEntry(
      {
        kind: "MANUAL_EXPENSE",
        amountUsd: "120.50",
        occurredLocal: "2026-10-31T23:30",
        categoryId,
        description: "Campaña local",
        idempotencyKey: randomUUID(),
      },
      { id: actorId },
    );
    entryIds.push(expense.id);
    const ledger = await listFinancialEntries({ month: "2026-10" });
    const stored = ledger.items.find((entry) => entry.id === expense.id);
    expect(stored).toMatchObject({
      direction: "OUTFLOW",
      type: "MANUAL_EXPENSE",
      serviceCase: null,
      category: { name: `Marketing ${suffix}` },
    });
  });
});
