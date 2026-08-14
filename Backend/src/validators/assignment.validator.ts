import { AssignmentPriority, AssignmentStatus } from "@prisma/client";
import { z } from "zod";

const normalizeEnumValue = (value: string) => value.trim().replace(/[\s-]+/g, "_").toUpperCase();
const statusValues = Object.values(AssignmentStatus) as [string, ...string[]];
const priorityValues = Object.values(AssignmentPriority) as [string, ...string[]];

const normalizedStatusSchema = z
  .string()
  .transform((value) => normalizeEnumValue(value))
  .pipe(z.enum(statusValues));

const normalizedPrioritySchema = z
  .string()
  .transform((value) => normalizeEnumValue(value))
  .pipe(z.enum(priorityValues));

const optionalNormalizedStatusSchema = z
  .union([z.string(), z.undefined()])
  .optional()
  .transform((value) => {
    if (!value || value === "all") return undefined;
    return normalizeEnumValue(value);
  })
  .pipe(z.enum(statusValues).optional());

const optionalNormalizedPrioritySchema = z
  .union([z.string(), z.undefined()])
  .optional()
  .transform((value) => {
    if (!value || value === "all") return undefined;
    return normalizeEnumValue(value);
  })
  .pipe(z.enum(priorityValues).optional());

export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  course: z.string().min(1, "Course is required"),
  dueDate: z.coerce.date(),
  priority: normalizedPrioritySchema.default(AssignmentPriority.MEDIUM),
  status: normalizedStatusSchema.default(AssignmentStatus.PENDING),
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const updateAssignmentStatusSchema = z.object({
  status: normalizedStatusSchema,
});

export const assignmentQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: optionalNormalizedStatusSchema,
  priority: optionalNormalizedPrioritySchema,
  course: z.string().trim().optional(),
  sort: z.enum(["newest", "oldest", "dueDate", "priority"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
