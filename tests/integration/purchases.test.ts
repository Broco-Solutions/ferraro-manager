import { randomUUID } from "node:crypto";

import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { PrismaClient } from "@/generated/prisma/client";
import { createPostgresAdapter } from "@/infrastructure/db/adapter";
import {
  adjustInventory,
  createInventoryCategory,
  createPurchasePresentation,
  reconcileInventory,
  saveInventoryItem,
} from "@/modules/inventory/application/inventory-service";
import {
  createSupplier,
  getPurchaseDetail,
  postPurchase,
  voidPurchase,
} from "@/modules/purchases/application/purchase-service";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required");
const prisma = new PrismaClient({
  adapter: createPostgresAdapter(connectionString),
});
const suffix = randomUUID().slice(0, 8);
let actorId = "";
let categoryId = "";
let itemId = "";
let presentationId = "";
let supplierId = "";
let purchaseId = "";

describe("suppliers and atomic purchases", () => {
  beforeAll(async () => {
    actorId = (
      await prisma.user.create({
        data: {
          name: `Purchase actor ${suffix}`,
          email: `purchase-${suffix}@ferraro.test`,
          emailVerified: true,
          role: "ADMIN",
        },
      })
    ).id;
    categoryId = (
      await createInventoryCategory(
        { name: `Purchase films ${suffix}` },
        { id: actorId },
      )
    ).id;
    itemId = (
      await saveInventoryItem(
        undefined,
        {
          categoryId,
          name: `PPF Purchase ${suffix}`,
          sku: `PUR-${suffix}`,
          baseUnit: "meter",
          minimumStock: "5",
          costHintUsd: "30",
          notes: "",
        },
        { id: actorId },
      )
    ).id;
    presentationId = (
      await createPurchasePresentation({
        itemId,
        name: "Rollo 15 m",
        factorToBase: "15",
      })
    ).id;
    supplierId = (
      await createSupplier(
        { name: `Supplier ${suffix}`, email: `supplier-${suffix}@test.com` },
        { id: actorId },
      )
    ).id;
  });

  afterAll(async () => {
    const movements = await prisma.inventoryMovement.findMany({
      where: { itemId },
      select: { id: true },
    });
    await prisma.idempotencyKey.deleteMany({
      where: {
        OR: [
          { resultReference: purchaseId },
          { resultReference: { in: movements.map((movement) => movement.id) } },
        ],
      },
    });
    await prisma.inventoryMovement.deleteMany({
      where: { reversalOfId: { not: null }, itemId },
    });
    await prisma.inventoryMovement.deleteMany({ where: { itemId } });
    if (purchaseId) {
      const finance = await prisma.financialEntry.findMany({
        where: { OR: [{ purchaseId }, { reversalOf: { purchaseId } }] },
        select: { id: true, reversalOfId: true },
      });
      await prisma.financialEntry.deleteMany({
        where: {
          id: {
            in: finance
              .filter((entry) => entry.reversalOfId)
              .map((entry) => entry.id),
          },
        },
      });
      await prisma.financialEntry.deleteMany({ where: { purchaseId } });
      await prisma.purchaseItem.deleteMany({ where: { purchaseId } });
      await prisma.purchase.delete({ where: { id: purchaseId } });
    }
    await prisma.purchasePresentation.delete({ where: { id: presentationId } });
    await prisma.inventoryItem.delete({ where: { id: itemId } });
    await prisma.inventoryCategory.delete({ where: { id: categoryId } });
    await prisma.supplier.delete({ where: { id: supplierId } });
    await prisma.user.delete({ where: { id: actorId } });
    await prisma.$disconnect();
  });

  it("posts stock snapshots and exactly one expense atomically and idempotently", async () => {
    const key = randomUUID();
    const input = {
      supplierId,
      businessDate: "2026-10-03",
      reference: "FAC-10",
      notes: "Ingreso principal",
      idempotencyKey: key,
      items: [
        { itemId, presentationId, quantityPurchased: "2", unitCostUsd: "600" },
      ],
    };
    const purchase = await postPurchase(input, { id: actorId });
    purchaseId = purchase.id;
    await expect(postPurchase(input, { id: actorId })).resolves.toMatchObject({
      id: purchase.id,
      replayed: true,
    });
    const detail = await getPurchaseDetail(purchase.id);
    const item = await prisma.inventoryItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    const expenses = await prisma.financialEntry.findMany({
      where: { purchaseId },
    });
    expect(detail?.items[0]).toMatchObject({
      itemNameSnapshot: `PPF Purchase ${suffix}`,
      presentationNameSnapshot: "Rollo 15 m",
    });
    expect(detail?.items[0]?.factorToBaseSnapshot.toString()).toBe("15");
    expect(detail?.items[0]?.quantityBase.toFixed(3)).toBe("30.000");
    expect(detail?.totalUsd.toFixed(2)).toBe("1200.00");
    expect(item.currentStock.toFixed(3)).toBe("30.000");
    expect(expenses).toHaveLength(1);
    expect(expenses[0]?.type).toBe("PURCHASE");
    expect((await reconcileInventory(itemId))[0]?.matches).toBe(true);
  });

  it("rolls back a void when purchased stock has already been used", async () => {
    await adjustInventory(
      {
        itemId,
        direction: "OUT",
        quantityBase: "1",
        reason: "Uso posterior",
        allowNegative: false,
        idempotencyKey: randomUUID(),
      },
      { id: actorId },
    );
    await expect(
      voidPurchase(
        { purchaseId, reason: "Factura incorrecta" },
        { id: actorId },
      ),
    ).rejects.toThrow("PURCHASE_STOCK_ALREADY_USED");
    const [purchase, reversals] = await Promise.all([
      prisma.purchase.findUniqueOrThrow({ where: { id: purchaseId } }),
      prisma.inventoryMovement.count({ where: { itemId, type: "REVERSAL" } }),
    ]);
    expect(purchase.status).toBe("POSTED");
    expect(reversals).toBe(0);
  });

  it("voids through stock and cash compensations once stock is restored", async () => {
    const restore = await adjustInventory(
      {
        itemId,
        direction: "IN",
        quantityBase: "1",
        reason: "Restaurar para anulación",
        allowNegative: false,
        idempotencyKey: randomUUID(),
      },
      { id: actorId },
    );
    const result = await voidPurchase(
      { purchaseId, reason: "Factura anulada" },
      { id: actorId },
    );
    await expect(
      voidPurchase({ purchaseId, reason: "Segundo intento" }, { id: actorId }),
    ).resolves.toMatchObject({ replayed: true });
    const detail = await getPurchaseDetail(result.id);
    const item = await prisma.inventoryItem.findUniqueOrThrow({
      where: { id: itemId },
    });
    expect(detail?.status).toBe("VOIDED");
    expect(detail?.financialEntry?.reversedBy).toBeTruthy();
    expect(item.currentStock.toFixed(3)).toBe("0.000");
    expect((await reconcileInventory(itemId))[0]?.matches).toBe(true);
    const restoreMovement = await prisma.inventoryMovement.findUniqueOrThrow({
      where: { id: restore.id },
    });
    expect(restoreMovement.type).toBe("ADJUSTMENT_IN");
  });
});
