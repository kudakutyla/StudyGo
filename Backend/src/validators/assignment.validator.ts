import { AssignmentPriority, AssignmentStatus } from "@prisma/client";
import { z } from "zod";

export const createAssignmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  course: z.string().min(1, "Course is required"),
  dueDate: z.coerce.date(),
  priority: z.enum(AssignmentPriority).default(AssignmentPriority.MEDIUM),
  status: z.enum(AssignmentStatus).default(AssignmentStatus.PENDING)
});

export const updateAssignmentSchema = createAssignmentSchema.partial();

export const updateAssignmentStatusSchema = z.object({
  status: z.enum(AssignmentStatus)
});

export const assignmentQuerySchema = z.object({
  search: z.string().trim().optional(),
  status: z.enum(AssignmentStatus).optional(),
  priority: z.enum(AssignmentPriority).optional(),
  course: z.string().trim().optional(),
  sort: z.enum(["newest", "oldest", "dueDate", "priority"]).default("newest"),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
});
