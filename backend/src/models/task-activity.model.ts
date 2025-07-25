import mongoose, { Document, Schema } from "mongoose";

export interface TaskActivityDocument extends Document {
  task: mongoose.Types.ObjectId;
  workspace: mongoose.Types.ObjectId;
  user: mongoose.Types.ObjectId;
  action: string;
  field?: string;
  oldValue?: any;
  newValue?: any;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

const taskActivitySchema = new Schema<TaskActivityDocument>(
  {
    task: {
      type: Schema.Types.ObjectId,
      ref: "Task",
      required: true,
    },
    workspace: {
      type: Schema.Types.ObjectId,
      ref: "Workspace",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        "created",
        "updated",
        "status_changed",
        "priority_changed",
        "assignee_changed",
        "due_date_changed",
        "title_changed",
        "description_changed",
        "completed",
        "deleted",
      ],
    },
    field: {
      type: String,
      default: null,
    },
    oldValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    newValue: {
      type: Schema.Types.Mixed,
      default: null,
    },
    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
taskActivitySchema.index({ task: 1, createdAt: -1 });
taskActivitySchema.index({ workspace: 1, createdAt: -1 });

const TaskActivityModel = mongoose.model<TaskActivityDocument>(
  "TaskActivity",
  taskActivitySchema
);

export default TaskActivityModel;
