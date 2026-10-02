import { createHash } from "node:crypto";

import { AppointmentStatus, Prisma } from "@/generated/prisma/client";
import { prisma } from "@/infrastructure/db/client";
import {
  appointmentEditSchema,
  appointmentInputSchema,
  calendarBlockInputSchema,
  type AppointmentEditInput,
  type AppointmentInput,
  type CalendarBlockInput,
} from "@/modules/scheduling/domain/scheduling-schema";
import { businessLocalDateTimeToUtc } from "@/shared/date-time/business-time";

interface Actor {
  id: string;
}

function inputHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function assertRange(startAt: Date, endAt: Date) {
  if (endAt <= startAt) throw new Error("INVALID_APPOINTMENT_RANGE");
}

async function validatedRelations(
  tx: Prisma.TransactionClient,
  input: {
    clientId: string;
    vehicleId: string;
    serviceIds: string[];
    employeeIds: string[];
  },
) {
  const [vehicle, services, employees] = await Promise.all([
    tx.vehicle.findFirst({
      where: {
        id: input.vehicleId,
        clientId: input.clientId,
        active: true,
        client: { active: true },
      },
      select: { id: true },
    }),
    tx.service.findMany({
      where: {
        id: { in: input.serviceIds },
        active: true,
        category: { active: true },
      },
      select: {
        id: true,
        name: true,
        estimatedDurationMinutes: true,
        sortOrder: true,
      },
    }),
    tx.user.findMany({
      where: { id: { in: input.employeeIds }, active: true },
      select: { id: true },
    }),
  ]);
  if (!vehicle) throw new Error("VEHICLE_CLIENT_MISMATCH");
  if (services.length !== new Set(input.serviceIds).size)
    throw new Error("SERVICE_NOT_AVAILABLE");
  if (employees.length !== new Set(input.employeeIds).size)
    throw new Error("EMPLOYEE_NOT_AVAILABLE");
  return { services, employees };
}

async function assertNoBlock(
  tx: Prisma.TransactionClient,
  startAt: Date,
  endAt: Date,
  excludeAppointmentId?: string,
) {
  const block = await tx.calendarBlock.findFirst({
    where: { active: true, startAt: { lt: endAt }, endAt: { gt: startAt } },
    select: { reason: true },
  });
  if (block) throw new Error(`CALENDAR_BLOCKED:${block.reason}`);
  void excludeAppointmentId;
}

export async function createAppointment(input: AppointmentInput, actor: Actor) {
  const data = appointmentInputSchema.parse(input);
  const startAt = businessLocalDateTimeToUtc(data.startLocal);
  const endAt = businessLocalDateTimeToUtc(data.endLocal);
  assertRange(startAt, endAt);
  const requestHash = inputHash(data);

  return prisma.$transaction(async (tx) => {
    const existing = await tx.idempotencyKey.findUnique({
      where: {
        operation_key: {
          operation: "CREATE_APPOINTMENT",
          key: data.idempotencyKey,
        },
      },
    });
    if (existing) {
      if (existing.requestHash !== requestHash)
        throw new Error("IDEMPOTENCY_CONFLICT");
      if (!existing.resultReference) throw new Error("IDEMPOTENCY_INCOMPLETE");
      return { id: existing.resultReference, replayed: true };
    }
    const { services, employees } = await validatedRelations(tx, data);
    await assertNoBlock(tx, startAt, endAt);
    const serviceCase = await tx.serviceCase.create({
      data: {
        clientId: data.clientId,
        vehicleId: data.vehicleId,
        origin: "DIRECT_APPOINTMENT",
        createdById: actor.id,
      },
      select: { id: true },
    });
    const appointment = await tx.appointment.create({
      data: {
        serviceCaseId: serviceCase.id,
        startAt,
        endAt,
        status: "CONFIRMED",
        internalNotes: data.internalNotes,
        visibleToClient: data.visibleToClient,
        createdById: actor.id,
        updatedById: actor.id,
        services: {
          create: services.map((service, index) => ({
            serviceId: service.id,
            nameSnapshot: service.name,
            durationMinutesSnapshot: service.estimatedDurationMinutes,
            sortOrder: index,
          })),
        },
        employees: {
          create: employees.map((employee) => ({ userId: employee.id })),
        },
      },
      select: { id: true },
    });
    await tx.idempotencyKey.create({
      data: {
        operation: "CREATE_APPOINTMENT",
        key: data.idempotencyKey,
        actorId: actor.id,
        requestHash,
        resultReference: appointment.id,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });
    return { id: appointment.id, replayed: false };
  });
}

export async function updateAppointment(
  id: string,
  input: AppointmentEditInput,
  actor: Actor,
) {
  const data = appointmentEditSchema.parse(input);
  const startAt = businessLocalDateTimeToUtc(data.startLocal);
  const endAt = businessLocalDateTimeToUtc(data.endLocal);
  assertRange(startAt, endAt);
  return prisma.$transaction(async (tx) => {
    const current = await tx.appointment.findUnique({
      where: { id },
      include: { serviceCase: { select: { clientId: true, vehicleId: true } } },
    });
    if (!current) throw new Error("APPOINTMENT_NOT_FOUND");
    if (current.status !== AppointmentStatus.CONFIRMED)
      throw new Error("APPOINTMENT_NOT_EDITABLE");
    const { services, employees } = await validatedRelations(tx, {
      clientId: current.serviceCase.clientId,
      vehicleId: current.serviceCase.vehicleId,
      serviceIds: data.serviceIds,
      employeeIds: data.employeeIds,
    });
    await assertNoBlock(tx, startAt, endAt, id);
    await tx.appointmentService.deleteMany({ where: { appointmentId: id } });
    await tx.appointmentEmployee.deleteMany({ where: { appointmentId: id } });
    return tx.appointment.update({
      where: { id },
      data: {
        startAt,
        endAt,
        internalNotes: data.internalNotes,
        visibleToClient: data.visibleToClient,
        updatedById: actor.id,
        services: {
          create: services.map((service, index) => ({
            serviceId: service.id,
            nameSnapshot: service.name,
            durationMinutesSnapshot: service.estimatedDurationMinutes,
            sortOrder: index,
          })),
        },
        employees: {
          create: employees.map((employee) => ({ userId: employee.id })),
        },
      },
      select: { id: true },
    });
  });
}

export async function cancelAppointment(id: string, actor: Actor) {
  const result = await prisma.appointment.updateMany({
    where: { id, status: AppointmentStatus.CONFIRMED },
    data: {
      status: AppointmentStatus.CANCELLED,
      cancelledAt: new Date(),
      updatedById: actor.id,
    },
  });
  if (result.count !== 1) throw new Error("APPOINTMENT_NOT_CANCELLABLE");
}

export async function createCalendarBlock(
  input: CalendarBlockInput,
  actor: Actor,
) {
  const data = calendarBlockInputSchema.parse(input);
  const startAt = businessLocalDateTimeToUtc(data.startLocal);
  const endAt = businessLocalDateTimeToUtc(data.endLocal);
  assertRange(startAt, endAt);
  return prisma.calendarBlock.create({
    data: {
      reason: data.reason,
      startAt,
      endAt,
      allDay: data.allDay,
      notes: data.notes,
      createdById: actor.id,
      updatedById: actor.id,
    },
    select: { id: true },
  });
}

export async function cancelCalendarBlock(id: string, actor: Actor) {
  const result = await prisma.calendarBlock.updateMany({
    where: { id, active: true },
    data: { active: false, cancelledAt: new Date(), updatedById: actor.id },
  });
  if (result.count !== 1) throw new Error("BLOCK_NOT_ACTIVE");
}

export async function getCalendarRange(start: Date, end: Date) {
  const [appointments, blocks] = await Promise.all([
    prisma.appointment.findMany({
      where: { startAt: { lt: end }, endAt: { gt: start } },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        status: true,
        serviceCase: {
          select: {
            client: { select: { displayName: true } },
            vehicle: {
              select: { brand: true, model: true, year: true, color: true },
            },
          },
        },
        services: {
          select: { nameSnapshot: true },
          orderBy: { sortOrder: "asc" },
        },
        employees: { select: { user: { select: { name: true } } } },
      },
      orderBy: { startAt: "asc" },
    }),
    prisma.calendarBlock.findMany({
      where: { active: true, startAt: { lt: end }, endAt: { gt: start } },
      select: {
        id: true,
        startAt: true,
        endAt: true,
        allDay: true,
        reason: true,
      },
      orderBy: { startAt: "asc" },
    }),
  ]);
  return { appointments, blocks };
}

export async function listSchedulingOptions() {
  const [clients, services, employees] = await Promise.all([
    prisma.client.findMany({
      where: { active: true, vehicles: { some: { active: true } } },
      select: {
        id: true,
        displayName: true,
        vehicles: {
          where: { active: true },
          select: { id: true, brand: true, model: true, year: true },
          orderBy: [{ brand: "asc" }, { model: "asc" }],
        },
      },
      orderBy: { displayName: "asc" },
    }),
    prisma.service.findMany({
      where: { active: true, category: { active: true } },
      select: {
        id: true,
        name: true,
        estimatedDurationMinutes: true,
        category: { select: { name: true } },
      },
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    }),
    prisma.user.findMany({
      where: { active: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return { clients, services, employees };
}

export async function getAppointmentDetail(id: string) {
  return prisma.appointment.findUnique({
    where: { id },
    include: {
      serviceCase: { include: { client: true, vehicle: true } },
      job: { select: { id: true, voidedAt: true } },
      services: { orderBy: { sortOrder: "asc" } },
      employees: { include: { user: { select: { id: true, name: true } } } },
    },
  });
}
