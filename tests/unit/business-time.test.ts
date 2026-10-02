import { describe, expect, it } from "vitest";

import {
  BUSINESS_TIME_ZONE,
  getBusinessDateKey,
} from "@/shared/date-time/business-time";

describe("business timezone", () => {
  it("uses the Rosario IANA timezone", () => {
    expect(BUSINESS_TIME_ZONE).toBe("America/Argentina/Buenos_Aires");
  });

  it("resolves today at the local day boundary, not the UTC day", () => {
    const instant = new Date("2026-10-02T02:30:00.000Z");

    expect(getBusinessDateKey(instant)).toBe("2026-10-01");
  });
});
