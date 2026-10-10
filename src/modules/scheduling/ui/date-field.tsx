"use client";

import { useRouter } from "next/navigation";

export function CalendarDateField({
  className,
  date,
  view,
}: {
  className?: string;
  date: string;
  view: "day" | "week" | "month";
}) {
  const router = useRouter();

  return (
    <input
      aria-label="Elegir fecha"
      className={className}
      onChange={(event) => {
        if (event.target.value) {
          router.push(`/app/calendar?view=${view}&date=${event.target.value}`);
        }
      }}
      type="date"
      value={date}
    />
  );
}
