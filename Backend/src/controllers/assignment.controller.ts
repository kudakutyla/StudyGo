import { Request, Response } from "express";
import { HttpError } from "../middleware/error.middleware";
import {
  createAssignmentForUser,
  deleteAssignmentForUser,
  getAssignmentForUser,
  listAssignmentsForUser,
  updateAssignmentForUser,
  updateAssignmentStatusForUser,
} from "../services/assignment.service";

export const getAssignments = async (req: Request, res: Response): Promise<void> => {
  const data = await listAssignmentsForUser(req.userId!, req.query);

  res.status(200).json({
    success: true,
    data,
  });
};

const getAssignmentId = (req: Request): string => {
  const id = req.params.id;
  return Array.isArray(id) ? id[0] : id;
};

export const getAssignment = async (req: Request, res: Response): Promise<void> => {
  const assignmentId = getAssignmentId(req);
  const assignment = await getAssignmentForUser(req.userId!, assignmentId);

  if (!assignment) {
    throw new HttpError(404, "Assignment not found");
  }

  res.status(200).json({
    success: true,
    data: assignment,
  });
};

export const createAssignment = async (req: Request, res: Response): Promise<void> => {
  const assignment = await createAssignmentForUser(req.userId!, req.body);

  res.status(201).json({
    success: true,
    message: "Assignment created successfully",
    data: assignment,
  });
};

export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
  const assignmentId = getAssignmentId(req);
  const assignment = await updateAssignmentForUser(req.userId!, assignmentId, req.body);

  if (!assignment) {
    throw new HttpError(404, "Assignment not found");
  }

  res.status(200).json({
    success: true,
    message: "Assignment updated successfully",
    data: assignment,
  });
};

export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
  const assignmentId = getAssignmentId(req);
  const deleted = await deleteAssignmentForUser(req.userId!, assignmentId);

  if (!deleted) {
    throw new HttpError(404, "Assignment not found");
  }

  res.status(200).json({
    success: true,
    message: "Assignment deleted successfully",
  });
};

export const updateAssignmentStatus = async (req: Request, res: Response): Promise<void> => {
  const assignmentId = getAssignmentId(req);
  const assignment = await updateAssignmentStatusForUser(req.userId!, assignmentId, req.body.status);

  if (!assignment) {
    throw new HttpError(404, "Assignment not found");
  }

  res.status(200).json({
    success: true,
    message: "Assignment status updated successfully",
    data: assignment,
  });
};
