import { Router } from "express";
import {
  createAssignment,
  deleteAssignment,
  getAssignment,
  getAssignments,
  updateAssignment,
  updateAssignmentStatus,
} from "../controllers/assignment.controller";
import { requireAuth } from "../middleware/auth.middleware";
import { validate } from "../middleware/validation.middleware";
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  updateAssignmentStatusSchema,
  assignmentQuerySchema,
} from "../validators/assignment.validator";

export const assignmentRoutes = Router();

assignmentRoutes.use(requireAuth);
assignmentRoutes.get("/", validate(assignmentQuerySchema, "query"), getAssignments);
assignmentRoutes.get("/:id", getAssignment);
assignmentRoutes.post("/", validate(createAssignmentSchema), createAssignment);
assignmentRoutes.put("/:id", validate(updateAssignmentSchema), updateAssignment);
assignmentRoutes.delete("/:id", deleteAssignment);
assignmentRoutes.patch("/:id/status", validate(updateAssignmentStatusSchema), updateAssignmentStatus);
