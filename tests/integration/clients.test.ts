import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { UserRole } from "@/generated/prisma/client";
import { prisma } from "@/infrastructure/db/client";
import {
  archiveClient,
  createClient,
  createVehicle,
  findPossibleDuplicates,
  listClients,
  updateVehicle,
} from "@/modules/clients/application/client-service";

const actorEmail = "build1-clients@ferraro.test";
let actorId = "";
const createdClientIds: string[] = [];

describe("clients and vehicles integration", () => {
  beforeAll(async () => {
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    const actor = await prisma.user.create({
      data: {
        name: "Operador Clientes",
        email: actorEmail,
        role: UserRole.STAFF,
        active: true,
      },
    });
    actorId = actor.id;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { clientId: { in: createdClientIds } },
    });
    await prisma.client.deleteMany({ where: { id: { in: createdClientIds } } });
    await prisma.user.deleteMany({ where: { email: actorEmail } });
    await prisma.$disconnect();
  });

  it("creates a client, warns about a normalized duplicate and finds the vehicle", async () => {
    const first = await createClient(
      { displayName: "Juan Pérez", phone: "+54 9 341 555-0182" },
      { id: actorId },
    );
    createdClientIds.push(first.id);
    await createVehicle(
      first.id,
      { brand: "BMW", model: "M3", year: 2024, color: "Negro" },
      { id: actorId },
    );

    const duplicates = await findPossibleDuplicates({ phone: "5493415550182" });
    expect(duplicates.map((item) => item.id)).toContain(first.id);
    const search = await listClients({ query: "M3" });
    expect(search.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: first.id, displayName: "Juan Pérez" }),
      ]),
    );
  });

  it("enforces vehicle ownership and archives without deleting", async () => {
    const owner = await createClient(
      { displayName: "Martina López" },
      { id: actorId },
    );
    const other = await createClient(
      { displayName: "Lucía Benítez" },
      { id: actorId },
    );
    createdClientIds.push(owner.id, other.id);
    const vehicle = await createVehicle(
      owner.id,
      { brand: "Porsche", model: "Macan", color: "Gris" },
      { id: actorId },
    );

    await expect(
      updateVehicle(
        other.id,
        vehicle.id,
        { brand: "Porsche", model: "Macan" },
        { id: actorId },
      ),
    ).rejects.toThrow("VEHICLE_NOT_FOUND");
    await archiveClient(owner.id, { id: actorId });
    await expect(
      prisma.client.findUnique({ where: { id: owner.id } }),
    ).resolves.toMatchObject({
      active: false,
    });
    await expect(
      prisma.vehicle.findUnique({ where: { id: vehicle.id } }),
    ).resolves.not.toBeNull();
  });
});
