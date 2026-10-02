import type { Prisma } from "@/generated/prisma/client";

import { prisma } from "@/infrastructure/db/client";
import {
  clientInputSchema,
  normalizePhone,
  vehicleInputSchema,
  type ClientInput,
  type VehicleInput,
} from "@/modules/clients/domain/client-schema";

interface Actor {
  id: string;
}

export async function createClient(input: ClientInput, actor: Actor) {
  const data = clientInputSchema.parse(input);
  return prisma.client.create({
    data: {
      ...data,
      normalizedPhone: normalizePhone(data.phone),
      email: data.email?.toLowerCase(),
      createdById: actor.id,
      updatedById: actor.id,
    },
    select: { id: true },
  });
}

export async function updateClient(
  id: string,
  input: ClientInput,
  actor: Actor,
) {
  const data = clientInputSchema.parse(input);
  return prisma.client.update({
    where: { id },
    data: {
      ...data,
      normalizedPhone: normalizePhone(data.phone),
      email: data.email?.toLowerCase(),
      updatedById: actor.id,
    },
    select: { id: true },
  });
}

export async function archiveClient(id: string, actor: Actor) {
  return prisma.client.update({
    where: { id },
    data: { active: false, archivedAt: new Date(), updatedById: actor.id },
    select: { id: true },
  });
}

export async function restoreClient(id: string, actor: Actor) {
  return prisma.client.update({
    where: { id },
    data: { active: true, archivedAt: null, updatedById: actor.id },
    select: { id: true },
  });
}

export async function createVehicle(
  clientId: string,
  input: VehicleInput,
  actor: Actor,
) {
  const data = vehicleInputSchema.parse(input);
  return prisma.$transaction(async (tx) => {
    const client = await tx.client.findUnique({
      where: { id: clientId },
      select: { active: true },
    });
    if (!client) throw new Error("CLIENT_NOT_FOUND");
    return tx.vehicle.create({
      data: { ...data, clientId, createdById: actor.id, updatedById: actor.id },
      select: { id: true, clientId: true },
    });
  });
}

export async function updateVehicle(
  clientId: string,
  vehicleId: string,
  input: VehicleInput,
  actor: Actor,
) {
  const data = vehicleInputSchema.parse(input);
  const result = await prisma.vehicle.updateMany({
    where: { id: vehicleId, clientId },
    data: { ...data, updatedById: actor.id },
  });
  if (result.count !== 1) throw new Error("VEHICLE_NOT_FOUND");
  return { id: vehicleId, clientId };
}

export async function setVehicleArchived(
  clientId: string,
  vehicleId: string,
  archived: boolean,
  actor: Actor,
) {
  const result = await prisma.vehicle.updateMany({
    where: { id: vehicleId, clientId },
    data: {
      active: !archived,
      archivedAt: archived ? new Date() : null,
      updatedById: actor.id,
    },
  });
  if (result.count !== 1) throw new Error("VEHICLE_NOT_FOUND");
}

export async function findPossibleDuplicates(input: {
  phone?: string;
  email?: string;
  excludeId?: string;
}) {
  const normalizedPhone = normalizePhone(input.phone);
  const email = input.email?.trim().toLowerCase();
  if (!normalizedPhone && !email) return [];

  return prisma.client.findMany({
    where: {
      id: input.excludeId ? { not: input.excludeId } : undefined,
      OR: [
        ...(normalizedPhone ? [{ normalizedPhone }] : []),
        ...(email
          ? [{ email: { equals: email, mode: "insensitive" as const } }]
          : []),
      ],
    },
    select: {
      id: true,
      displayName: true,
      phone: true,
      email: true,
      active: true,
    },
    take: 5,
  });
}

export async function listClients(options: {
  query?: string;
  status?: "active" | "archived" | "all";
  page?: number;
  pageSize?: number;
}) {
  const query = options.query?.trim();
  const page = Math.max(1, options.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, options.pageSize ?? 20));
  const where: Prisma.ClientWhereInput = {
    active:
      options.status === "all"
        ? undefined
        : options.status === "archived"
          ? false
          : true,
    OR: query
      ? [
          { displayName: { contains: query, mode: "insensitive" } },
          { firstName: { contains: query, mode: "insensitive" } },
          { lastName: { contains: query, mode: "insensitive" } },
          { phone: { contains: query, mode: "insensitive" } },
          {
            normalizedPhone: { contains: normalizePhone(query) ?? "__none__" },
          },
          {
            vehicles: {
              some: {
                OR: [
                  { brand: { contains: query, mode: "insensitive" } },
                  { model: { contains: query, mode: "insensitive" } },
                ],
              },
            },
          },
        ]
      : undefined,
  };

  const [items, total] = await prisma.$transaction([
    prisma.client.findMany({
      where,
      select: {
        id: true,
        displayName: true,
        phone: true,
        whatsapp: true,
        email: true,
        active: true,
        createdAt: true,
        vehicles: {
          where: { active: true },
          select: {
            id: true,
            brand: true,
            model: true,
            year: true,
            color: true,
          },
          orderBy: { createdAt: "desc" },
          take: 3,
        },
        _count: { select: { vehicles: true } },
      },
      orderBy: [{ active: "desc" }, { displayName: "asc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.client.count({ where }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    pages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getClientDetail(id: string) {
  return prisma.client.findUnique({
    where: { id },
    include: {
      vehicles: { orderBy: [{ active: "desc" }, { createdAt: "desc" }] },
    },
  });
}

export async function getVehicleDetail(clientId: string, vehicleId: string) {
  return prisma.vehicle.findFirst({ where: { id: vehicleId, clientId } });
}
