import { Request, Response } from "express";
import { z } from "zod";

import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import {
  changeRoleSchema,
  createWorkspaceSchema,
  workspaceIdSchema,
  updateWorkspaceSettingsSchema,
} from "../validation/workspace.validation";
import { HTTPSTATUS } from "../config/http.config";
import {
  changeMemberRoleService,
  createWorkspaceService,
  deleteWorkspaceService,
  getAllWorkspacesUserIsMemberService,
  getMemberAssignedTasksService,
  getWorkspaceAnalyticsService,
  getWorkspaceByIdService,
  getWorkspaceMembersService,
  removeMemberFromWorkspaceService,
  updateWorkspaceByIdService,
  updateWorkspaceSettingsService,
} from "../services/workspace.service";
import { getMemberRoleInWorkspace } from "../services/member.service";
import { Permissions } from "../enums/role.enum";
import { roleGuard } from "../utils/roleGuard";
import { updateWorkspaceSchema } from "../validation/workspace.validation";
import { JWTPayload } from "../@types/index";

// Helper function to extract userId from request
const getUserId = (req: Request): string => {
  const userPayload = req.user as JWTPayload;
  return userPayload?.userId || (req.user as any)?._id;
};

export const createWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const body = createWorkspaceSchema.parse(req.body);

    const userId = getUserId(req);
    const { workspace } = await createWorkspaceService(userId, body as any);

    return res.status(HTTPSTATUS.CREATED).json({
      message: "Workspace created successfully",
      workspace,
    });
  }
);

// Controller: Get all workspaces the user is part of

export const getAllWorkspacesUserIsMemberController = asyncHandler(
  async (req: Request, res: Response) => {
    const userId = getUserId(req);

    const { workspaces } = await getAllWorkspacesUserIsMemberService(userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "User workspaces fetched successfully",
      workspaces,
    });
  }
);

export const getWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = getUserId(req);

    await getMemberRoleInWorkspace(userId, workspaceId);

    const { workspace } = await getWorkspaceByIdService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace fetched successfully",
      workspace,
    });
  }
);

export const getWorkspaceMembersController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = getUserId(req);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { members, roles } = await getWorkspaceMembersService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace members retrieved successfully",
      members,
      roles,
    });
  }
);

export const getWorkspaceAnalyticsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const userId = getUserId(req);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.VIEW_ONLY]);

    const { analytics } = await getWorkspaceAnalyticsService(workspaceId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace analytics retrieved successfully",
      analytics,
    });
  }
);

export const changeWorkspaceMemberRoleController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { memberId, roleId } = changeRoleSchema.parse(req.body);

    const userId = getUserId(req);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.CHANGE_MEMBER_ROLE]);

    const { member } = await changeMemberRoleService(
      workspaceId,
      memberId,
      roleId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Member Role changed successfully",
      member,
    });
  }
);

export const updateWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const { name, description } = updateWorkspaceSchema.parse(req.body);

    const userId = getUserId(req);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.EDIT_WORKSPACE]);

    const { workspace } = await updateWorkspaceByIdService(
      workspaceId,
      name,
      description
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace updated successfully",
      workspace,
    });
  }
);

export const deleteWorkspaceByIdController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);

    const userId = getUserId(req);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.DELETE_WORKSPACE]);

    const { currentWorkspace } = await deleteWorkspaceService(
      workspaceId,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace deleted successfully",
      currentWorkspace,
    });
  }
);

export const removeMemberFromWorkspaceController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const memberIdToRemove = z.string().parse(req.params.memberId);
    const requestingUserId = getUserId(req);

    // Parse optional transferTasksTo from request body
    const transferTasksTo = req.body?.transferTasksTo || null;

    const { role } = await getMemberRoleInWorkspace(
      requestingUserId,
      workspaceId
    );
    roleGuard(role, [Permissions.REMOVE_MEMBER]);

    const result = await removeMemberFromWorkspaceService(
      workspaceId,
      memberIdToRemove,
      requestingUserId,
      transferTasksTo
    );

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

export const getMemberAssignedTasksController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const memberId = z.string().parse(req.params.memberId);
    const requestingUserId = getUserId(req);

    const { role } = await getMemberRoleInWorkspace(
      requestingUserId,
      workspaceId
    );
    roleGuard(role, [Permissions.REMOVE_MEMBER]);

    const result = await getMemberAssignedTasksService(
      workspaceId,
      memberId,
      requestingUserId
    );

    return res.status(HTTPSTATUS.OK).json(result);
  }
);

export const updateWorkspaceSettingsController = asyncHandler(
  async (req: Request, res: Response) => {
    const workspaceId = workspaceIdSchema.parse(req.params.id);
    const body = updateWorkspaceSettingsSchema.parse(req.body);
    const userId = getUserId(req);

    const { role } = await getMemberRoleInWorkspace(userId, workspaceId);
    roleGuard(role, [Permissions.MANAGE_WORKSPACE_SETTINGS]);

    const { workspace } = await updateWorkspaceSettingsService(
      workspaceId,
      body as any,
      userId
    );

    return res.status(HTTPSTATUS.OK).json({
      message: "Workspace settings updated successfully",
      workspace,
    });
  }
);
