import { describe, expect, it } from "vitest";
import {
  nextSalaryMonth,
  salaryAmountSchema,
  salaryMonthSchema,
  salaryMonthsBetween,
} from "@/modules/salaries/domain/salary-schema";

describe("salary inputs and monthly recurrence", () => {
  it("accepts Argentine decimal commas without interpreting ambiguous grouping", () => {
    expect(salaryAmountSchema.parse(" 1234567,50 ")).toBe("1234567.50");
    expect(salaryAmountSchema.parse("1234567.50")).toBe("1234567.50");
    for (const invalid of [
      "0",
      "0,00",
      "-10",
      "1.000.000",
      "1.234,56",
      "Infinity",
      "1e6",
      "2.345",
      "",
    ]) {
      expect(salaryAmountSchema.safeParse(invalid).success).toBe(false);
    }
  });
  it("crosses years and backfills each month exactly once", () => {
    expect(nextSalaryMonth("2026-12")).toBe("2027-01");
    expect(salaryMonthSchema.parse("2100-01")).toBe("2100-01");
    expect(salaryMonthsBetween("2026-11", "2027-02")).toEqual([
      "2026-11",
      "2026-12",
      "2027-01",
      "2027-02",
    ]);
    expect(salaryMonthsBetween("2026-11", "2026-10")).toEqual([]);
    for (const invalid of ["2026-00", "2026-13", "2026-1", "1999-12"]) {
      expect(salaryMonthSchema.safeParse(invalid).success).toBe(false);
    }
  });
});
