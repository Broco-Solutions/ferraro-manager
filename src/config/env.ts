import { z } from "zod";

const serverEnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().url().startsWith("postgres"),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  BUSINESS_TIME_ZONE: z
    .literal("America/Argentina/Buenos_Aires")
    .default("America/Argentina/Buenos_Aires"),
  BUSINESS_CURRENCY: z.literal("USD").default("USD"),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function parseServerEnv(input: NodeJS.ProcessEnv): ServerEnv {
  const result = serverEnvSchema.safeParse(input);

  if (!result.success) {
    const invalidKeys = result.error.issues
      .map((issue) => issue.path.join("."))
      .filter(Boolean)
      .join(", ");

    throw new Error(`Invalid server environment: ${invalidKeys}`);
  }

  return result.data;
}

export const env = parseServerEnv(process.env);
