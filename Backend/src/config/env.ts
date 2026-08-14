import { config } from "dotenv";
import { z } from "zod";

config();

const envSchema = z.object({
  NODE_ENV: z
    .string()
    .trim()
    .optional()
    .transform((value) => {
      const normalized = (value ?? "development").toLowerCase();
      return ["development", "test", "production"].includes(normalized)
        ? normalized
        : "development";
    })
    .pipe(z.enum(["development", "test", "production"])),
  PORT: z.coerce.number().default(5000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  JWT_SECRET: z.string().min(16, "JWT_SECRET must be at least 16 characters"),
  JWT_EXPIRES: z.string().min(1, "JWT_EXPIRES is required").default("7d"),
  FRONTEND_URL: z.string().url("FRONTEND_URL must be a valid URL")
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
}

export const env = parsed.data;
