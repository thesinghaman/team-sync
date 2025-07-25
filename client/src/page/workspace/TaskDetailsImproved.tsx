import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Flag,
  Clock,
  Edit,
  CheckCircle,
  History,
  AlertCircle,
  Eye,
  Trash2,
  MoreHorizontal,
  MessageSquare,
  Calendar as CalendarIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getTaskByIdQueryFn, deleteTaskMutationFn } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from "@/lib/helper";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import EditTaskDialog from "@/components/workspace/task/edit-task-dialog";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import useGetTaskActivities from "@/hooks/api/use-get-task-activities";
import { toast } from "@/hooks/use-toast";
import { SafeConfirmDialog } from "@/components/resuable/safe-confirm-dialog";
import useConfirmDialog from "@/hooks/use-confirm-dialog";

export default function TaskDetailsImproved() {
  const { taskId, projectId } = useParams<{
    taskId: string;
    projectId: string;
  }>();
  const workspaceId = useWorkspaceId();
  const { user: currentUser } = useAuthContext();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Confirm dialog for deletion
  const { open, context, onOpenDialog, onCloseDialog } = useConfirmDialog();

  // Delete mutation
  const { mutate: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: deleteTaskMutationFn,
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Task deleted successfully",
        variant: "success",
      });
      queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
      navigate(`/workspace/${workspaceId}/tasks`);
      onCloseDialog();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeleteTask = () => {
    if (taskId && workspaceId) {
      deleteTask({ workspaceId, taskId });
    }
  };

  // Get workspace members
  const { data: workspaceData } = useGetWorkspaceMembers(workspaceId);
  const workspaceMembers = workspaceData?.members || [];

  // Get task activities
  const { data: activitiesData, isLoading: isActivitiesLoading } =
    useGetTaskActivities(taskId || "", workspaceId);
  const taskActivities = activitiesData?.activities || [];

  const { data: taskData, isLoading } = useQuery({
    queryKey: ["task-details", taskId, projectId, workspaceId],
    queryFn: () =>
      getTaskByIdQueryFn({
        taskId: taskId!,
        projectId: projectId!,
        workspaceId,
      }),
    enabled: !!taskId && !!projectId && !!workspaceId,
  });

  const task = taskData?.task;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Task not found</h2>
          <p className="text-muted-foreground mb-4">
            The task you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => navigate(`/workspace/${workspaceId}/tasks`)}>
            Back to Tasks
          </Button>
        </div>
      </div>
    );
  }

  // Get current user's role in workspace
  const currentUserMember = workspaceMembers.find(
    (member) => member.userId._id === currentUser?._id
  );
  const currentUserRole = currentUserMember?.role.name;

  // Permission logic
  const isTaskCreator = task.createdBy?._id === currentUser?._id;
  const isTaskAssignee = task.assignedTo?._id === currentUser?._id;
  const isWorkspaceOwner = currentUserRole === "OWNER";

  // Enhanced permissions:
  // 1. Task creator can edit/delete
  // 2. Workspace owner can edit/delete any task (universal rights)
  const canEdit = isTaskCreator || isWorkspaceOwner;

  // Status change permissions:
  // 1. Task assignee can change status
  // 2. Task creator can change status
  // 3. Workspace owner can change any task status
  const canChangeStatus = isTaskAssignee || isTaskCreator || isWorkspaceOwner;

  // Get assignee details
  const assigneeName = task.assignedTo?.name || "Unassigned";
  const assigneeInitials = getAvatarFallbackText(assigneeName);
  const assigneeColor = getAvatarColor(assigneeName);

  // Get creator details
  const createdByName = task.createdBy?.name || "Unknown";
  const createdByInitials = getAvatarFallbackText(createdByName);
  const createdByColor = getAvatarColor(createdByName);

  // Status configuration
  const statusConfig: Record<string, { color: string; icon: React.ReactNode }> =
    {
      [TaskStatusEnum.BACKLOG]: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: <Clock className="w-4 h-4" />,
      },
      [TaskStatusEnum.TODO]: {
        color: "bg-slate-100 text-slate-800 border-slate-200",
        icon: <Clock className="w-4 h-4" />,
      },
      [TaskStatusEnum.IN_PROGRESS]: {
        color: "bg-blue-100 text-blue-800 border-blue-200",
        icon: <Clock className="w-4 h-4" />,
      },
      [TaskStatusEnum.IN_REVIEW]: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: <AlertCircle className="w-4 h-4" />,
      },
      [TaskStatusEnum.DONE]: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: <CheckCircle className="w-4 h-4" />,
      },
    };

  // Priority configuration
  const priorityConfig: Record<
    string,
    { color: string; icon: React.ReactNode }
  > = {
    [TaskPriorityEnum.LOW]: {
      color: "bg-green-100 text-green-800 border-green-200",
      icon: <Flag className="w-4 h-4" />,
    },
    [TaskPriorityEnum.MEDIUM]: {
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: <Flag className="w-4 h-4" />,
    },
    [TaskPriorityEnum.HIGH]: {
      color: "bg-red-100 text-red-800 border-red-200",
      icon: <Flag className="w-4 h-4" />,
    },
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">{task.title}</h1>
          <p className="text-sm text-muted-foreground">Task #{task.taskCode}</p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Status Change for Assignees */}
          {canChangeStatus && !canEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditDialogOpen(true)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Change Status
            </Button>
          )}

          {/* Edit/Delete Menu for Creators and Owners */}
          {canEdit && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => setIsEditDialogOpen(true)}
                  className="cursor-pointer"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Task
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    onOpenDialog(task);
                  }}
                  className="cursor-pointer text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Task
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Task Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Task Overview */}
          <Card className="shadow-none">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Task Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${statusConfig[task.status]?.color} border`}
                  >
                    {statusConfig[task.status]?.icon}
                    <span className="ml-1">
                      {transformStatusEnum(task.status)}
                    </span>
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`${priorityConfig[task.priority]?.color} border`}
                  >
                    {priorityConfig[task.priority]?.icon}
                    <span className="ml-1">{task.priority}</span>
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground leading-relaxed">
                    {task.description || "No description provided"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Task Activity */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <History className="w-5 h-5" />
                Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isActivitiesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : taskActivities.length > 0 ? (
                  taskActivities.map((activity) => (
                    <div
                      key={activity._id}
                      className="flex items-start gap-3 pb-4 border-b last:border-b-0"
                    >
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={activity.user?.profilePicture || undefined}
                        />
                        <AvatarFallback
                          className={`${getAvatarColor(
                            activity.user?.name || ""
                          )} text-white text-xs`}
                        >
                          {getAvatarFallbackText(activity.user?.name || "")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">
                            {activity.user?.name || "Unknown User"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(activity.createdAt),
                              "MMM d, yyyy 'at' h:mm a"
                            )}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No activity yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Task Meta */}
        <div className="space-y-6">
          {/* Task Details */}
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Assignee */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Assignee
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={task.assignedTo?.profilePicture || undefined}
                    />
                    <AvatarFallback
                      className={`${assigneeColor} text-white text-xs`}
                    >
                      {assigneeInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {task.assignedTo?._id === currentUser?._id
                      ? "You"
                      : assigneeName}
                  </span>
                </div>
              </div>

              {/* Creator */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Created by
                </span>
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage
                      src={task.createdBy?.profilePicture || undefined}
                    />
                    <AvatarFallback
                      className={`${createdByColor} text-white text-xs`}
                    >
                      {createdByInitials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm">
                    {task.createdBy?._id === currentUser?._id
                      ? "You"
                      : createdByName}
                  </span>
                </div>
              </div>

              {/* Due Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Due Date
                </span>
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">
                    {task.dueDate
                      ? format(new Date(task.dueDate), "MMM d, yyyy")
                      : "No due date"}
                  </span>
                </div>
              </div>

              {/* Created Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Created
                </span>
                <span className="text-sm">
                  {task.createdAt
                    ? format(new Date(task.createdAt), "MMM d, yyyy")
                    : "Unknown"}
                </span>
              </div>

              {/* Updated Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">
                  Updated
                </span>
                <span className="text-sm">
                  {task.updatedAt
                    ? format(new Date(task.updatedAt), "MMM d, yyyy")
                    : "Unknown"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Permission Info */}
          {!canEdit && !canChangeStatus && (
            <Card className="shadow-none border-amber-200 bg-amber-50">
              <CardContent className="pt-6">
                <div className="flex items-start gap-2">
                  <Eye className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-800">
                      View Only
                    </p>
                    <p className="text-xs text-amber-700">
                      You can view this task but cannot make changes. Only the
                      task creator, assignee, or workspace owner can edit this
                      task.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={task}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        canEdit={canEdit}
        canChangeStatus={canChangeStatus}
      />

      {/* Delete Confirmation Dialog */}
      <SafeConfirmDialog
        isOpen={open}
        isLoading={isDeleting}
        onClose={onCloseDialog}
        onConfirm={handleDeleteTask}
        title="Delete Task"
        description={`Are you sure you want to delete "${context?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </div>
  );
}
