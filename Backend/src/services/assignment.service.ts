import { AssignmentPriority, AssignmentStatus, Prisma } from "@prisma/client";
import { prisma } from "../config/database";
import { HttpError } from "../middleware/error.middleware";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  updateAssignmentStatusSchema,
  assignmentQuerySchema,
} from "../validators/assignment.validator";

const normalizeFilters = (query: Record<string, any>) => {
  const parsed = assignmentQuerySchema.parse(query);

  const filters: Prisma.AssignmentWhereInput = {
    userId: query.userId ?? undefined,
  };

  if (parsed.search) {
    filters.OR = [
      { title: { contains: parsed.search } },
      { description: { contains: parsed.search } },
      { course: { contains: parsed.search } },
    ];
  }

  if (parsed.status) {
    filters.status = parsed.status;
  }

  if (parsed.priority) {
    filters.priority = parsed.priority;
  }

  if (parsed.course) {
    filters.course = { contains: parsed.course };
  }

  return { parsed, filters };
};

export const listAssignmentsForUser = async (userId: string, query: Record<string, any>) => {
  const { parsed, filters } = normalizeFilters({ ...query, userId });

  const total = await prisma.assignment.count({ where: filters });

  const assignments = await prisma.assignment.findMany({
    where: filters,
    orderBy:
      parsed.sort === "newest"
        ? { createdAt: "desc" }
        : parsed.sort === "oldest"
          ? { createdAt: "asc" }
          : parsed.sort === "dueDate"
            ? { dueDate: "asc" }
            : { priority: "desc" },
    skip: (parsed.page - 1) * parsed.limit,
    take: parsed.limit,
  });

  return {
    assignments,
    total,
    page: parsed.page,
    limit: parsed.limit,
    totalPages: Math.max(1, Math.ceil(total / parsed.limit)),
  };
};

export const getAssignmentForUser = async (userId: string, assignmentId: string) => {
  return prisma.assignment.findFirst({
    where: {
      id: assignmentId,
      userId,
    },
  });
};

export const createAssignmentForUser = async (userId: string, input: Record<string, any>) => {
  const parsed = createAssignmentSchema.parse(input);

  return prisma.assignment.create({
    data: {
      userId,
      title: parsed.title.trim(),
      description: parsed.description.trim(),
      course: parsed.course.trim(),
      dueDate: new Date(parsed.dueDate),
      priority: parsed.priority,
      status: parsed.status,
    },
  });
};

export const updateAssignmentForUser = async (userId: string, assignmentId: string, input: Record<string, any>) => {
  const existing = await getAssignmentForUser(userId, assignmentId);

  if (!existing) {
    return null;
  }

  const parsed = updateAssignmentSchema.parse(input);

  return prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      ...(parsed.title !== undefined ? { title: parsed.title.trim() } : {}),
      ...(parsed.description !== undefined ? { description: parsed.description.trim() } : {}),
      ...(parsed.course !== undefined ? { course: parsed.course.trim() } : {}),
      ...(parsed.dueDate !== undefined ? { dueDate: new Date(parsed.dueDate) } : {}),
      ...(parsed.priority !== undefined ? { priority: parsed.priority } : {}),
      ...(parsed.status !== undefined ? { status: parsed.status } : {}),
    },
  });
};

export const deleteAssignmentForUser = async (userId: string, assignmentId: string) => {
  const existing = await getAssignmentForUser(userId, assignmentId);

  if (!existing) {
    return null;
  }

  await prisma.assignment.delete({
    where: { id: assignmentId },
  });

  return true;
};

export const updateAssignmentStatusForUser = async (userId: string, assignmentId: string, status: AssignmentStatus) => {
  const existing = await getAssignmentForUser(userId, assignmentId);

  if (!existing) {
    return null;
  }

  const parsed = updateAssignmentStatusSchema.parse({ status });

  return prisma.assignment.update({
    where: { id: assignmentId },
    data: {
      status: parsed.status,
    },
  });
};
