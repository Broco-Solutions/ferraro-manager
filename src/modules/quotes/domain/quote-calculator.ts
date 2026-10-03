const MONEY_SCALE = 2;
const QUANTITY_SCALE = 3;

function parseFixed(value: string, scale: number, field: string): bigint {
  const normalized = value.trim();
  const match = /^(\d+)(?:\.(\d+))?$/.exec(normalized);
  if (!match || (match[2]?.length ?? 0) > scale)
    throw new Error(`INVALID_${field}`);
  const whole = match[1] ?? "0";
  const fraction = (match[2] ?? "").padEnd(scale, "0");
  return BigInt(whole) * 10n ** BigInt(scale) + BigInt(fraction || "0");
}

function fixed(value: bigint, scale: number) {
  const divisor = 10n ** BigInt(scale);
  const whole = value / divisor;
  const fraction = String(value % divisor).padStart(scale, "0");
  return `${whole}.${fraction}`;
}

export interface QuoteLineInput {
  serviceId?: string;
  name: string;
  description?: string;
  quantity: string;
  unitPriceUsd: string;
  discountUsd: string;
}

export function calculateQuote(
  lines: readonly QuoteLineInput[],
  globalDiscountUsd: string,
) {
  if (!lines.length) throw new Error("QUOTE_ITEMS_REQUIRED");
  const items = lines.map((line, index) => {
    const quantity = parseFixed(line.quantity, QUANTITY_SCALE, "QUANTITY");
    const unitPrice = parseFixed(line.unitPriceUsd, MONEY_SCALE, "MONEY");
    const discount = parseFixed(line.discountUsd || "0", MONEY_SCALE, "MONEY");
    if (quantity <= 0n) throw new Error("INVALID_QUANTITY");
    const gross = (quantity * unitPrice + 500n) / 1_000n;
    if (discount > gross) throw new Error("ITEM_DISCOUNT_EXCEEDS_GROSS");
    return {
      serviceId: line.serviceId,
      nameSnapshot: line.name.trim(),
      descriptionSnapshot: line.description?.trim() || undefined,
      quantity: fixed(quantity, QUANTITY_SCALE),
      unitPriceUsd: fixed(unitPrice, MONEY_SCALE),
      discountUsd: fixed(discount, MONEY_SCALE),
      totalUsd: fixed(gross - discount, MONEY_SCALE),
      sortOrder: index,
      totalCents: gross - discount,
    };
  });
  const subtotal = items.reduce((sum, item) => sum + item.totalCents, 0n);
  const globalDiscount = parseFixed(
    globalDiscountUsd || "0",
    MONEY_SCALE,
    "MONEY",
  );
  if (globalDiscount > subtotal)
    throw new Error("GLOBAL_DISCOUNT_EXCEEDS_SUBTOTAL");
  return {
    items: items.map((item) => ({
      serviceId: item.serviceId,
      nameSnapshot: item.nameSnapshot,
      descriptionSnapshot: item.descriptionSnapshot,
      quantity: item.quantity,
      unitPriceUsd: item.unitPriceUsd,
      discountUsd: item.discountUsd,
      totalUsd: item.totalUsd,
      sortOrder: item.sortOrder,
    })),
    subtotalUsd: fixed(subtotal, MONEY_SCALE),
    discountUsd: fixed(globalDiscount, MONEY_SCALE),
    totalUsd: fixed(subtotal - globalDiscount, MONEY_SCALE),
  };
}
