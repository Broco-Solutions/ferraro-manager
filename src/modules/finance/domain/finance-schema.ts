import { z } from "zod";

const money = z
  .string()
  .trim()
  .regex(
    /^\d{1,12}(\.\d{1,2})?$/,
    "Ingresá un monto válido con hasta 2 decimales.",
  )
  .refine((value) => Number(value) > 0, "El monto debe ser mayor a cero.");

const optionalText = (maximum: number) =>
  z
    .string()
    .trim()
    .max(maximum)
    .optional()
    .transform((value) => value || undefined);

export const financialEntryInputSchema = z
  .object({
    kind: z.enum([
      "CUSTOMER_PAYMENT",
      "CUSTOMER_REFUND",
      "MANUAL_INCOME",
      "MANUAL_EXPENSE",
    ]),
    amountUsd: money,
    occurredLocal: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/),
    serviceCaseId: z.string().uuid().optional().or(z.literal("")),
    categoryId: z.string().uuid().optional().or(z.literal("")),
    paymentMethod: z
      .enum(["TRANSFER", "CASH", "OTHER"])
      .optional()
      .or(z.literal("")),
    description: optionalText(500),
    idempotencyKey: z.string().uuid(),
  })
  .superRefine((value, context) => {
    if (value.kind.startsWith("CUSTOMER_") && !value.serviceCaseId) {
      context.addIssue({
        code: "custom",
        path: ["serviceCaseId"],
        message: "Seleccioná el trabajo o servicio al que corresponde.",
      });
    }
    if (value.kind.startsWith("MANUAL_") && !value.categoryId) {
      context.addIssue({
        code: "custom",
        path: ["categoryId"],
        message: "Seleccioná una categoría.",
      });
    }
  });

export const amountRevisionSchema = z.object({
  serviceCaseId: z.string().uuid(),
  amountUsd: z
    .string()
    .trim()
    .regex(/^\d{1,12}(\.\d{1,2})?$/, "Ingresá un importe válido."),
  reason: z.string().trim().min(3, "Explicá brevemente el cambio.").max(300),
});

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2).max(80),
  direction: z.enum(["INFLOW", "OUTFLOW"]),
});

export type FinancialEntryInput = z.input<typeof financialEntryInputSchema>;
