import { TaskPriorityEnum, TaskStatusEnum } from "../enums/task.enum";
import MemberModel from "../models/member.model";
import ProjectModel from "../models/project.model";
import TaskModel from "../models/task.model";
import TaskActivityModel from "../models/task-activity.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import { TaskActivityService } from "./task-activity.service";
import UserModel from "../models/user.model";

export const createTaskService = async (
  workspaceId: string,
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const { title, description, priority, status, assignedTo, dueDate } = body;

  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }
  if (assignedTo) {
    const assignedMember = await MemberModel.findOne({
      userId: assignedTo,
      workspaceId,
    }).populate("role");

    if (!assignedMember) {
      throw new BadRequestException(
        "Assigned user is not a member of this workspace."
      );
    }

    // Get the creator's role
    const creatorMember = await MemberModel.findOne({
      userId: userId,
      workspaceId,
    }).populate("role");

    if (!creatorMember) {
      throw new BadRequestException(
        "Creator is not a member of this workspace."
      );
    }

    // Get workspace settings to check assignment rules
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found.");
    }

    const assignedUserRole = (assignedMember.role as any).name;
    const creatorRole = (creatorMember.role as any).name;
    const assignmentSettings = workspace.settings?.taskAssignmentRules;

    // Role-based assignment restrictions (only if workspace settings disable them):
    // 1. Members cannot assign tasks to Owners or Admins (unless allowed)
    // 2. Admins cannot assign tasks to Owners (unless allowed)
    if (creatorRole === "MEMBER") {
      if (
        assignedUserRole === "OWNER" &&
        !assignmentSettings?.membersCanAssignToOwners
      ) {
        throw new BadRequestException(
          "Members cannot assign tasks to Owners. This can be changed in workspace settings."
        );
      }
      if (
        assignedUserRole === "ADMIN" &&
        !assignmentSettings?.membersCanAssignToAdmins
      ) {
        throw new BadRequestException(
          "Members cannot assign tasks to Admins. This can be changed in workspace settings."
        );
      }
    }

    if (
      creatorRole === "ADMIN" &&
      assignedUserRole === "OWNER" &&
      !assignmentSettings?.adminsCanAssignToOwners
    ) {
      throw new BadRequestException(
        "Admins cannot assign tasks to Owners. This can be changed in workspace settings."
      );
    }
  }
  const task = new TaskModel({
    title,
    description,
    priority: priority || TaskPriorityEnum.MEDIUM,
    status: status || TaskStatusEnum.TODO,
    assignedTo,
    createdBy: userId,
    workspace: workspaceId,
    project: projectId,
    dueDate,
  });

  await task.save();

  // Record task creation activity
  await TaskActivityService.recordTaskCreation(task, workspaceId, userId);

  return { task };
};

export const updateTaskService = async (
  workspaceId: string,
  projectId: string,
  taskId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority: string;
    status: string;
    assignedTo?: string | null;
    dueDate?: string;
  }
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findById(taskId);

  if (!task || task.project.toString() !== projectId.toString()) {
    throw new NotFoundException(
      "Task not found or does not belong to this project"
    );
  }

  // Check assignment restrictions if assignedTo is being changed
  if (body.assignedTo) {
    const assignedMember = await MemberModel.findOne({
      userId: body.assignedTo,
      workspaceId,
    }).populate("role");

    if (!assignedMember) {
      throw new BadRequestException(
        "Assigned user is not a member of this workspace."
      );
    }

    // Get the updater's role
    const updaterMember = await MemberModel.findOne({
      userId: userId,
      workspaceId,
    }).populate("role");

    if (!updaterMember) {
      throw new BadRequestException(
        "Updater is not a member of this workspace."
      );
    }

    // Get workspace settings to check assignment rules
    const workspace = await WorkspaceModel.findById(workspaceId);
    if (!workspace) {
      throw new NotFoundException("Workspace not found.");
    }

    const assignedUserRole = (assignedMember.role as any).name;
    const updaterRole = (updaterMember.role as any).name;
    const assignmentSettings = workspace.settings?.taskAssignmentRules;

    // Role-based assignment restrictions (only if workspace settings disable them):
    // 1. Members cannot assign tasks to Owners or Admins (unless allowed)
    // 2. Admins cannot assign tasks to Owners (unless allowed)
    if (updaterRole === "MEMBER") {
      if (
        assignedUserRole === "OWNER" &&
        !assignmentSettings?.membersCanAssignToOwners
      ) {
        throw new BadRequestException(
          "Members cannot assign tasks to Owners. This can be changed in workspace settings."
        );
      }
      if (
        assignedUserRole === "ADMIN" &&
        !assignmentSettings?.membersCanAssignToAdmins
      ) {
        throw new BadRequestException(
          "Members cannot assign tasks to Admins. This can be changed in workspace settings."
        );
      }
    }

    if (
      updaterRole === "ADMIN" &&
      assignedUserRole === "OWNER" &&
      !assignmentSettings?.adminsCanAssignToOwners
    ) {
      throw new BadRequestException(
        "Admins cannot assign tasks to Owners. This can be changed in workspace settings."
      );
    }
  }

  // Store original values for comparison
  const originalTask = {
    title: task.title,
    description: task.description,
    priority: task.priority,
    status: task.status,
    assignedTo: task.assignedTo?.toString(),
    dueDate: task.dueDate?.toISOString(),
  };

  const updatedTask = await TaskModel.findByIdAndUpdate(
    taskId,
    {
      ...body,
    },
    { new: true }
  );

  if (!updatedTask) {
    throw new BadRequestException("Failed to update task");
  }

  // Track changes and record activities
  const changes = [];

  if (originalTask.title !== body.title) {
    changes.push({
      field: "title",
      oldValue: originalTask.title,
      newValue: body.title,
      description: `Title changed from "${originalTask.title}" to "${body.title}"`,
    });
  }

  if (originalTask.description !== body.description) {
    changes.push({
      field: "description",
      oldValue: originalTask.description,
      newValue: body.description,
      description: `Description updated`,
    });
  }

  if (originalTask.priority !== body.priority) {
    await TaskActivityService.recordPriorityChange(
      updatedTask,
      workspaceId,
      userId,
      originalTask.priority,
      body.priority
    );
  }

  if (originalTask.status !== body.status) {
    await TaskActivityService.recordStatusChange(
      updatedTask,
      workspaceId,
      userId,
      originalTask.status,
      body.status
    );
  }

  if (originalTask.assignedTo !== body.assignedTo) {
    // Get user names for better activity descriptions
    let oldAssigneeName = null;
    let newAssigneeName = null;

    if (originalTask.assignedTo) {
      const oldAssignee = await UserModel.findById(originalTask.assignedTo);
      oldAssigneeName = oldAssignee?.name;
    }

    if (body.assignedTo) {
      const newAssignee = await UserModel.findById(body.assignedTo);
      newAssigneeName = newAssignee?.name;
    }

    await TaskActivityService.recordAssigneeChange(
      updatedTask,
      workspaceId,
      userId,
      originalTask.assignedTo || null,
      body.assignedTo || null,
      oldAssigneeName || undefined,
      newAssigneeName || undefined
    );
  }

  if (originalTask.dueDate !== body.dueDate) {
    changes.push({
      field: "dueDate",
      oldValue: originalTask.dueDate,
      newValue: body.dueDate,
      description: `Due date changed`,
    });
  }

  // Record any remaining changes
  if (changes.length > 0) {
    await TaskActivityService.recordTaskUpdate(
      updatedTask,
      workspaceId,
      userId,
      changes
    );
  }

  return { updatedTask };
};

export const getAllTasksService = async (
  workspaceId: string,
  filters: {
    projectId?: string;
    status?: string[];
    priority?: string[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: string;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  },
  sort?: {
    field: string;
    order: "asc" | "desc";
  }
) => {
  const query: Record<string, any> = {
    workspace: workspaceId,
  };

  if (filters.projectId) {
    query.project = filters.projectId;
  }

  if (filters.status && filters.status?.length > 0) {
    query.status = { $in: filters.status };
  }

  if (filters.priority && filters.priority?.length > 0) {
    query.priority = { $in: filters.priority };
  }

  if (filters.assignedTo && filters.assignedTo?.length > 0) {
    query.assignedTo = { $in: filters.assignedTo };
  }

  if (filters.keyword && filters.keyword !== undefined) {
    query.title = { $regex: filters.keyword, $options: "i" };
  }

  if (filters.dueDate) {
    query.dueDate = {
      $eq: new Date(filters.dueDate),
    };
  }

  //Pagination Setup
  const { pageSize, pageNumber } = pagination;
  const skip = (pageNumber - 1) * pageSize;

  // Sorting setup
  const sortOptions: Record<string, any> = {};
  if (sort) {
    sortOptions[sort.field] = sort.order === "asc" ? 1 : -1;
  } else {
    sortOptions.createdAt = -1; // Default sort by creation date descending
  }

  const [tasks, totalCount] = await Promise.all([
    TaskModel.find(query)
      .skip(skip)
      .limit(pageSize)
      .sort(sortOptions)
      .populate("assignedTo", "_id name profilePicture -password")
      .populate("createdBy", "_id name profilePicture -password")
      .populate("project", "_id emoji name"),
    TaskModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return {
    tasks,
    pagination: {
      pageSize,
      pageNumber,
      totalCount,
      totalPages,
      skip,
    },
  };
};

export const getTaskByIdService = async (
  workspaceId: string,
  projectId: string,
  taskId: string
) => {
  const project = await ProjectModel.findById(projectId);

  if (!project || project.workspace.toString() !== workspaceId.toString()) {
    throw new NotFoundException(
      "Project not found or does not belong to this workspace"
    );
  }

  const task = await TaskModel.findOne({
    _id: taskId,
    workspace: workspaceId,
    project: projectId,
  })
    .populate("assignedTo", "_id name profilePicture -password")
    .populate("createdBy", "_id name profilePicture -password")
    .populate("project", "_id name emoji");

  if (!task) {
    throw new NotFoundException("Task not found.");
  }

  return task;
};

export const deleteTaskService = async (
  workspaceId: string,
  taskId: string
) => {
  const task = await TaskModel.findOneAndDelete({
    _id: taskId,
    workspace: workspaceId,
  });

  if (!task) {
    throw new NotFoundException(
      "Task not found or does not belong to the specified workspace"
    );
  }

  // Also delete all task activities associated with this task
  await TaskActivityModel.deleteMany({ task: taskId });

  return;
};
