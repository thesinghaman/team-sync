import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  createTaskSchema,
  taskIdSchema,
  updateTaskSchema,
} from "../validation/task.validation";
import { projectIdSchema } from "../validation/project.validation";
import { workspaceIdSchema } from "../validation/workspace.validation";
import { Permissions } from "../enums/role.enum";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { roleGuard } from "../utils/roleGuard";
import {
  createTaskService,
  deleteTaskService,
  getAllTasksService,
  getTaskByIdService,
  updateTaskService,
} from "../services/task.service";
import { TaskActivityService } from "../services/task-activity.service";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { HTTPSTATUS } from "../config/http.config";
import { JWTPayload } from "../@types/index";
import TaskModel from "../models/task.model";

// Helper function to extract userId from request
const getUserId = (req: Request): string => {
  const userPayload = req.user as JWTPayload;
  return userPayload?.userId || (req.user as any)?._id;
};

export const createTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const body = createTaskSchema.parse(req.body);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CREATE_TASK]);

    const { task } = await createTaskService(
      workspaceId,
      projectId,
      userId,
      body as any
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task created successfully",
      task,
    });
  }
);

export const updateTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const body = updateTaskSchema.parse(req.body);

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Get user's role in workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]); // Basic access check

    // Get the task to check ownership
    const task = await getTaskByIdService(workspaceId, projectId, taskId);

    // Enhanced permission logic for task editing:
    // 1. Task creator can edit all fields
    // 2. Workspace owner can edit all fields (universal rights)
    // 3. Task assignees can only update status
    const isTaskCreator = task.createdBy.toString() === userId;
    const isWorkspaceOwner = role === "OWNER";
    const isTaskAssignee = task.assignedTo?.toString() === userId;

    // Check if this is a status-only update
    const fieldsBeingUpdated = Object.keys(body);
    const isStatusOnlyUpdate =
      fieldsBeingUpdated.length === 1 && fieldsBeingUpdated.includes("status");

    const canEditAllFields = isTaskCreator || isWorkspaceOwner;

    if (!canEditAllFields) {
      // Non-creators and non-owners can only update status if they are assignees
      if (!isStatusOnlyUpdate || !isTaskAssignee) {
        throw new BadRequestException(
          "Only the task creator or workspace owner can edit all fields. Assignees can only update task status."
        );
      }
    }

    const { updatedTask } = await updateTaskService(
      workspaceId,
      projectId,
      taskId,
      userId,
      body as any
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Task updated successfully",
      task: updatedTask,
    });
  }
);

export const getAllTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const filters = {
      projectId: req.query.projectId as string | undefined,
      status: req.query.status
        ? (req.query.status as string)?.split(",")
        : undefined,
      priority: req.query.priority
        ? (req.query.priority as string)?.split(",")
        : undefined,
      assignedTo: req.query.assignedTo
        ? (req.query.assignedTo as string)?.split(",")
        : undefined,
      keyword: req.query.keyword as string | undefined,
      dueDate: req.query.dueDate as string | undefined,
    };

    const pagination = {
      pageSize: parseInt(req.query.pageSize as string) || 10,
      pageNumber: parseInt(req.query.pageNumber as string) || 1,
    };

    // Parse sorting parameters
    const sort =
      req.query.sortBy && req.query.sortOrder
        ? {
            field: req.query.sortBy as string,
            order: (req.query.sortOrder as "asc" | "desc") || "desc",
          }
        : undefined;

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const result = await getAllTasksService(
      workspaceId,
      filters,
      pagination,
      sort
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "All tasks fetched successfully",
      ...result,
    });
  }
);

export const getTaskByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const taskId = taskIdSchema.parse(req.params.id);
    const projectId = projectIdSchema.parse(req.params.projectId);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const task = await getTaskByIdService(workspaceId, projectId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task fetched successfully",
      task,
    });
  }
);

export const deleteTaskController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Get user's role in workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]); // Basic access check

    // Get the task to check ownership - simpler approach without projectId
    const task = await TaskModel.findOne({
      _id: taskId,
      workspace: workspaceId,
    });

    if (!task) {
      throw new NotFoundException(
        "Task not found or does not belong to the specified workspace"
      );
    }

    // Enhanced permission logic for task deletion:
    // 1. Task creator can delete the task
    // 2. Workspace owner can delete any task (universal rights)
    const isTaskCreator = task.createdBy.toString() === userId;
    const isWorkspaceOwner = role === "OWNER";

    if (!isTaskCreator && !isWorkspaceOwner) {
      throw new BadRequestException(
        "Only the task creator or workspace owner can delete this task."
      );
    }

    await deleteTaskService(workspaceId, taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task deleted successfully",
    });
  }
);

export const getTaskActivitiesController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const taskId = taskIdSchema.parse(req.params.id);
    const workspaceId = workspaceIdSchema.parse(req.params.workspaceId);

    // Check if user has access to the workspace
    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    // Any workspace member should be able to view task activities
    roleGuard(role, [
      Permissions.VIEW_ONLY,
      Permissions.EDIT_TASK,
      Permissions.CREATE_TASK,
    ]);

    const activities = await TaskActivityService.getTaskActivities(taskId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Task activities retrieved successfully",
      activities,
    });
  }
);
