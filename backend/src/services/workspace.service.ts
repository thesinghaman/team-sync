import mongoose from "mongoose";
import { Roles } from "../enums/role.enum";
import MemberModel from "../models/member.model";
import RoleModel from "../models/roles-permission.model";
import UserModel from "../models/user.model";
import WorkspaceModel from "../models/workspace.model";
import { BadRequestException, NotFoundException } from "../utils/appError";
import TaskModel from "../models/task.model";
import TaskActivityModel from "../models/task-activity.model";
import { TaskStatusEnum } from "../enums/task.enum";
import ProjectModel from "../models/project.model";

// CREATE NEW WORKSPACE
export const createWorkspaceService = async (
  userId: string,
  body: {
    name: string;
    description?: string | undefined;
  }
) => {
  const { name, description } = body;

  const user = await UserModel.findById(userId);

  if (!user) {
    throw new NotFoundException("User not found");
  }

  const ownerRole = await RoleModel.findOne({ name: Roles.OWNER });

  if (!ownerRole) {
    throw new NotFoundException("Owner role not found");
  }

  const workspace = new WorkspaceModel({
    name: name,
    description: description,
    owner: user._id,
  });

  await workspace.save();

  const member = new MemberModel({
    userId: user._id,
    workspaceId: workspace._id,
    role: ownerRole._id,
    joinedAt: new Date(),
  });

  await member.save();

  user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
  await user.save();

  return {
    workspace,
  };
};

// GET WORKSPACES USER IS A MEMBER
export const getAllWorkspacesUserIsMemberService = async (userId: string) => {
  const memberships = await MemberModel.find({ userId })
    .populate("workspaceId")
    .select("-password")
    .exec();

  // Extract workspace details from memberships
  const workspaces = memberships.map((membership) => membership.workspaceId);

  return { workspaces };
};

// GET WORKSPACE BY ID
export const getWorkspaceByIdService = async (workspaceId: string) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const members = await MemberModel.find({
    workspaceId,
  }).populate("role");

  const workspaceWithMembers = {
    ...workspace.toObject(),
    members,
  };

  return {
    workspace: workspaceWithMembers,
  };
};

// GET ALL MEMBERS IN WORKSPACE

export const getWorkspaceMembersService = async (workspaceId: string) => {
  // Fetch all members of the workspace

  const members = await MemberModel.find({
    workspaceId,
  })
    .populate("userId", "name email profilePicture -password")
    .populate("role", "name");

  const roles = await RoleModel.find({}, { name: 1, _id: 1 })
    .select("-permission")
    .lean();

  return { members, roles };
};

export const getWorkspaceAnalyticsService = async (workspaceId: string) => {
  const currentDate = new Date();

  const totalTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
  });

  const overdueTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    dueDate: { $lt: currentDate },
    status: { $ne: TaskStatusEnum.DONE },
  });

  const completedTasks = await TaskModel.countDocuments({
    workspace: workspaceId,
    status: TaskStatusEnum.DONE,
  });

  const analytics = {
    totalTasks,
    overdueTasks,
    completedTasks,
  };

  return { analytics };
};

export const changeMemberRoleService = async (
  workspaceId: string,
  memberId: string,
  roleId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  const role = await RoleModel.findById(roleId);
  if (!role) {
    throw new NotFoundException("Role not found");
  }

  const member = await MemberModel.findOne({
    userId: memberId,
    workspaceId: workspaceId,
  });

  if (!member) {
    throw new Error("Member not found in the workspace");
  }

  member.role = role;
  await member.save();

  return {
    member,
  };
};

// UPDATE WORKSPACE
export const updateWorkspaceByIdService = async (
  workspaceId: string,
  name: string,
  description?: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  // Update the workspace details
  workspace.name = name || workspace.name;
  workspace.description = description || workspace.description;
  await workspace.save();

  return {
    workspace,
  };
};

export const deleteWorkspaceService = async (
  workspaceId: string,
  userId: string
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace =
      await WorkspaceModel.findById(workspaceId).session(session);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    // Check if the user owns the workspace
    if (!workspace.owner.equals(new mongoose.Types.ObjectId(userId))) {
      throw new BadRequestException(
        "You are not authorized to delete this workspace"
      );
    }

    const user = await UserModel.findById(userId).session(session);
    if (!user) {
      throw new NotFoundException("User not found");
    }

    await ProjectModel.deleteMany({ workspace: workspace._id }).session(
      session
    );
    await TaskModel.deleteMany({ workspace: workspace._id }).session(session);
    await TaskActivityModel.deleteMany({ workspace: workspace._id }).session(
      session
    );

    await MemberModel.deleteMany({
      workspaceId: workspace._id,
    }).session(session);

    // Update the user's currentWorkspace if it matches the deleted workspace
    if (user?.currentWorkspace?.equals(workspaceId)) {
      const memberWorkspace = await MemberModel.findOne({ userId }).session(
        session
      );
      // Update the user's currentWorkspace
      user.currentWorkspace = memberWorkspace
        ? memberWorkspace.workspaceId
        : null;

      await user.save({ session });
    }

    await workspace.deleteOne({ session });

    await session.commitTransaction();

    session.endSession();

    return {
      currentWorkspace: user.currentWorkspace,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// REMOVE MEMBER FROM WORKSPACE
export const removeMemberFromWorkspaceService = async (
  workspaceId: string,
  memberIdToRemove: string,
  requestingUserId: string,
  transferTasksTo?: string | null
) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const workspace =
      await WorkspaceModel.findById(workspaceId).session(session);
    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    // Check if the requesting user is the owner
    if (
      !workspace.owner.equals(new mongoose.Types.ObjectId(requestingUserId))
    ) {
      throw new BadRequestException(
        "Only the workspace owner can remove members"
      );
    }

    // Find the member to remove
    const memberToRemove = await MemberModel.findOne({
      workspaceId: workspaceId,
      userId: memberIdToRemove,
    })
      .populate("role")
      .session(session);

    if (!memberToRemove) {
      throw new NotFoundException("Member not found in this workspace");
    }

    // Prevent owner from removing themselves
    if (memberIdToRemove === requestingUserId) {
      throw new BadRequestException("You cannot remove yourself as the owner");
    }

    // Find all tasks assigned to the member being removed
    const assignedTasks = await TaskModel.find({
      workspace: workspaceId,
      assignedTo: memberIdToRemove,
    })
      .populate("project", "name")
      .session(session);

    // Handle task ownership transfer or deletion
    if (assignedTasks.length > 0) {
      if (transferTasksTo) {
        // Validate that the transfer recipient is a member of the workspace
        const transferRecipient = await MemberModel.findOne({
          workspaceId: workspaceId,
          userId: transferTasksTo,
        }).session(session);

        if (!transferRecipient) {
          throw new BadRequestException(
            "Transfer recipient is not a member of this workspace"
          );
        }

        // Transfer tasks to the specified member
        await TaskModel.updateMany(
          {
            workspace: workspaceId,
            assignedTo: memberIdToRemove,
          },
          {
            assignedTo: transferTasksTo,
          }
        ).session(session);
      } else {
        // Delete all tasks assigned to the member being removed
        await TaskModel.deleteMany({
          workspace: workspaceId,
          assignedTo: memberIdToRemove,
        }).session(session);
      }
    }

    // Remove the member
    await MemberModel.deleteOne({
      workspaceId: workspaceId,
      userId: memberIdToRemove,
    }).session(session);

    // Update the user's currentWorkspace if it matches the removed workspace
    const userToRemove =
      await UserModel.findById(memberIdToRemove).session(session);
    if (userToRemove?.currentWorkspace?.equals(workspaceId)) {
      const remainingMembership = await MemberModel.findOne({
        userId: memberIdToRemove,
      }).session(session);

      userToRemove.currentWorkspace = remainingMembership
        ? remainingMembership.workspaceId
        : null;

      await userToRemove.save({ session });
    }

    await session.commitTransaction();
    session.endSession();

    return {
      message: "Member removed successfully",
      removedMember: {
        userId: memberIdToRemove,
        role: memberToRemove.role,
      },
      taskAction:
        assignedTasks.length > 0
          ? {
              totalTasks: assignedTasks.length,
              action: transferTasksTo ? "transferred" : "deleted",
              transferredTo: transferTasksTo || null,
            }
          : null,
    };
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

// GET MEMBER ASSIGNED TASKS (for preview before removal)
export const getMemberAssignedTasksService = async (
  workspaceId: string,
  memberId: string,
  requestingUserId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);
  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  // Check if the requesting user is the owner
  if (!workspace.owner.equals(new mongoose.Types.ObjectId(requestingUserId))) {
    throw new BadRequestException(
      "Only the workspace owner can view member tasks for removal"
    );
  }

  // Find all tasks assigned to the member
  const assignedTasks = await TaskModel.find({
    workspace: workspaceId,
    assignedTo: memberId,
  })
    .populate("project", "name")
    .populate("createdBy", "name email")
    .select("taskCode title description status priority dueDate createdAt")
    .sort({ createdAt: -1 });

  return {
    tasks: assignedTasks,
    totalTasks: assignedTasks.length,
  };
};

// Update workspace settings service - exported function
export const updateWorkspaceSettingsService = async (
  workspaceId: string,
  body: {
    taskAssignmentRules: {
      membersCanAssignToOwners: boolean;
      membersCanAssignToAdmins: boolean;
      adminsCanAssignToOwners: boolean;
    };
  },
  userId: string
) => {
  const workspace = await WorkspaceModel.findById(workspaceId);

  if (!workspace) {
    throw new NotFoundException("Workspace not found");
  }

  // Update workspace settings
  workspace.settings = {
    taskAssignmentRules: body.taskAssignmentRules,
  };

  await workspace.save();

  return { workspace };
};
