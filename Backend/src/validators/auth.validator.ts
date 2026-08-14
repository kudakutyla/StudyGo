import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Full name is required"),
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(1, "Confirm Password is required")
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
});

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required")
});
