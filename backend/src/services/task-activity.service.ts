import TaskActivityModel, {
  TaskActivityDocument,
} from "../models/task-activity.model";
import { TaskDocument } from "../models/task.model";
import mongoose from "mongoose";

export class TaskActivityService {
  // Create a new task activity entry
  static async createActivity({
    taskId,
    workspaceId,
    userId,
    action,
    field,
    oldValue,
    newValue,
    description,
  }: {
    taskId: string;
    workspaceId: string;
    userId: string;
    action: string;
    field?: string;
    oldValue?: any;
    newValue?: any;
    description: string;
  }): Promise<TaskActivityDocument> {
    const activity = new TaskActivityModel({
      task: taskId,
      workspace: workspaceId,
      user: userId,
      action,
      field,
      oldValue,
      newValue,
      description,
    });

    return await activity.save();
  }

  // Get all activities for a task
  static async getTaskActivities(
    taskId: string
  ): Promise<TaskActivityDocument[]> {
    return await TaskActivityModel.find({ task: taskId })
      .populate("user", "name profilePicture")
      .sort({ createdAt: -1 });
  }

  // Get all activities for a workspace
  static async getWorkspaceActivities(
    workspaceId: string,
    limit: number = 50,
    skip: number = 0
  ): Promise<TaskActivityDocument[]> {
    return await TaskActivityModel.find({ workspace: workspaceId })
      .populate("user", "name profilePicture")
      .populate("task", "title taskCode")
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);
  }

  // Record task creation
  static async recordTaskCreation(
    task: TaskDocument,
    workspaceId: string,
    userId: string
  ): Promise<TaskActivityDocument> {
    return await this.createActivity({
      taskId: (task._id as mongoose.Types.ObjectId).toString(),
      workspaceId,
      userId,
      action: "created",
      description: `Task "${task.title}" was created`,
    });
  }

  // Record task update with field changes
  static async recordTaskUpdate(
    task: TaskDocument,
    workspaceId: string,
    userId: string,
    changes: {
      field: string;
      oldValue: any;
      newValue: any;
      description: string;
    }[]
  ): Promise<TaskActivityDocument[]> {
    const activities = [];

    for (const change of changes) {
      const activity = await this.createActivity({
        taskId: (task._id as mongoose.Types.ObjectId).toString(),
        workspaceId,
        userId,
        action: `${change.field}_changed`,
        field: change.field,
        oldValue: change.oldValue,
        newValue: change.newValue,
        description: change.description,
      });
      activities.push(activity);
    }

    return activities;
  }

  // Record status change specifically
  static async recordStatusChange(
    task: TaskDocument,
    workspaceId: string,
    userId: string,
    oldStatus: string,
    newStatus: string
  ): Promise<TaskActivityDocument> {
    const statusLabels: { [key: string]: string } = {
      TODO: "To Do",
      IN_PROGRESS: "In Progress",
      COMPLETED: "Completed",
    };

    return await this.createActivity({
      taskId: (task._id as mongoose.Types.ObjectId).toString(),
      workspaceId,
      userId,
      action: "status_changed",
      field: "status",
      oldValue: oldStatus,
      newValue: newStatus,
      description: `Status changed from "${statusLabels[oldStatus] || oldStatus}" to "${statusLabels[newStatus] || newStatus}"`,
    });
  }

  // Record assignee change
  static async recordAssigneeChange(
    task: TaskDocument,
    workspaceId: string,
    userId: string,
    oldAssignee: string | null,
    newAssignee: string | null,
    oldAssigneeName?: string,
    newAssigneeName?: string
  ): Promise<TaskActivityDocument> {
    let description = "";
    if (!oldAssignee && newAssignee) {
      description = `Task assigned to ${newAssigneeName || "someone"}`;
    } else if (oldAssignee && !newAssignee) {
      description = `Task unassigned from ${oldAssigneeName || "someone"}`;
    } else if (oldAssignee && newAssignee) {
      description = `Task reassigned from ${oldAssigneeName || "someone"} to ${newAssigneeName || "someone"}`;
    }

    return await this.createActivity({
      taskId: (task._id as mongoose.Types.ObjectId).toString(),
      workspaceId,
      userId,
      action: "assignee_changed",
      field: "assignedTo",
      oldValue: oldAssignee,
      newValue: newAssignee,
      description,
    });
  }

  // Record priority change
  static async recordPriorityChange(
    task: TaskDocument,
    workspaceId: string,
    userId: string,
    oldPriority: string,
    newPriority: string
  ): Promise<TaskActivityDocument> {
    const priorityLabels: { [key: string]: string } = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
    };

    return await this.createActivity({
      taskId: (task._id as mongoose.Types.ObjectId).toString(),
      workspaceId,
      userId,
      action: "priority_changed",
      field: "priority",
      oldValue: oldPriority,
      newValue: newPriority,
      description: `Priority changed from "${priorityLabels[oldPriority] || oldPriority}" to "${priorityLabels[newPriority] || newPriority}"`,
    });
  }
}
