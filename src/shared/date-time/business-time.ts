export const BUSINESS_TIME_ZONE = "America/Argentina/Buenos_Aires" as const;

const dateKeyFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: BUSINESS_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getBusinessDateKey(instant: Date): string {
  const parts = dateKeyFormatter.formatToParts(instant);
  const values = Object.fromEntries(
    parts
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
}

export function formatBusinessDateTime(
  instant: Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: BUSINESS_TIME_ZONE,
    dateStyle: "medium",
    timeStyle: "short",
    ...options,
  }).format(instant);
}
