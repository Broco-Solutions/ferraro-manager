import { describe, expect, it } from "vitest";

import { parseServerEnv } from "@/config/env";

const validEnv: NodeJS.ProcessEnv = {
  NODE_ENV: "test",
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/ferraro",
  BETTER_AUTH_SECRET: "a-secure-test-secret-with-more-than-32-characters",
  BETTER_AUTH_URL: "http://localhost:3000",
  BUSINESS_TIME_ZONE: "America/Argentina/Buenos_Aires",
  BUSINESS_CURRENCY: "USD",
};

describe("server environment", () => {
  it("accepts the contractual timezone and currency", () => {
    const parsed = parseServerEnv(validEnv);

    expect(parsed.BUSINESS_TIME_ZONE).toBe("America/Argentina/Buenos_Aires");
    expect(parsed.BUSINESS_CURRENCY).toBe("USD");
  });

  it("rejects an offset used as a timezone", () => {
    expect(() =>
      parseServerEnv({ ...validEnv, BUSINESS_TIME_ZONE: "UTC-3" }),
    ).toThrow("BUSINESS_TIME_ZONE");
  });

  it("does not expose secret values in validation errors", () => {
    const invalidSecret = "short-secret-value";

    expect(() =>
      parseServerEnv({ ...validEnv, BETTER_AUTH_SECRET: invalidSecret }),
    ).toThrow("BETTER_AUTH_SECRET");

    try {
      parseServerEnv({ ...validEnv, BETTER_AUTH_SECRET: invalidSecret });
    } catch (error) {
      expect(String(error)).not.toContain(invalidSecret);
    }
  });
});
