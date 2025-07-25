import { useState } from "react";
import { Row } from "@tanstack/react-table";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TaskType } from "@/types/api.type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { deleteTaskMutationFn } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import EditTaskDialog from "../edit-task-dialog";
import { useAuthContext } from "@/context/auth-provider";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { MinimalConfirmDialog } from "@/components/resuable/minimal-confirm-dialog";
import useConfirmDialog from "@/hooks/use-confirm-dialog";

interface DataTableRowActionsProps {
  row: Row<TaskType>;
}

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const [openEditDialog, setOpenEditDialog] = useState(false);

  // Confirm dialog for deletion
  const { open, context, onOpenDialog, onCloseDialog } = useConfirmDialog();

  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { user: currentUser } = useAuthContext();

  // Get workspace members to determine current user's role
  const { data: workspaceData } = useGetWorkspaceMembers(workspaceId);
  const workspaceMembers = workspaceData?.members || [];

  // Get current user's role in workspace
  const currentUserMember = workspaceMembers.find(
    (member) => member.userId._id === currentUser?._id
  );
  const currentUserRole = currentUserMember?.role.name;

  const { mutate, isPending } = useMutation({
    mutationFn: deleteTaskMutationFn,
  });

  const task = row.original;
  const taskId = task._id as string;

  // Permission logic
  const isTaskCreator = task.createdBy?._id === currentUser?._id;
  const isTaskAssignee = task.assignedTo?._id === currentUser?._id;
  const isWorkspaceOwner = currentUserRole === "OWNER";

  // Enhanced permission logic:
  // 1. Task creator can edit/delete
  // 2. Workspace owner can edit/delete any task (universal rights)
  const canEdit = isTaskCreator || isWorkspaceOwner;

  // Task assignee, creator, or owner can change status
  const canChangeStatus = isTaskAssignee || isTaskCreator || isWorkspaceOwner;

  // If user has no permissions, don't show the dropdown
  if (!canEdit && !canChangeStatus) {
    return null;
  }

  const handleConfirm = () => {
    mutate(
      { workspaceId, taskId },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries({
            queryKey: ["all-tasks", workspaceId],
          });
          toast({
            title: "Success",
            description: data.message,
            variant: "success",
          });
          onCloseDialog();
        },
        onError: (error) => {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
          >
            <MoreHorizontal />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[160px]"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Edit Task Option - Only for task creators and workspace owners */}
          {canEdit && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenEditDialog(true)}
              >
                <Pencil className="w-4 h-4 mr-2" /> Edit Task
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Status Update Option - For assignees who can't edit */}
          {canChangeStatus && !canEdit && (
            <>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setOpenEditDialog(true)}
              >
                <Pencil className="w-4 h-4 mr-2" /> Update Status
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}

          {/* Delete Task Option - Only for task creators and workspace owners */}
          {canEdit && (
            <>
              <DropdownMenuItem
                className="!text-destructive cursor-pointer"
                onClick={() => {
                  onOpenDialog(task);
                }}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Task
                <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Task Dialog */}
      <EditTaskDialog
        task={task}
        isOpen={openEditDialog}
        onClose={() => setOpenEditDialog(false)}
        canEdit={canEdit}
        canChangeStatus={canChangeStatus}
      />

      {/* Delete Confirmation Dialog */}
      <MinimalConfirmDialog
        isOpen={open}
        onClose={onCloseDialog}
        onConfirm={handleConfirm}
        title="Delete Task"
        description={`Are you sure you want to delete "${context?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="destructive"
        isLoading={isPending}
      />
    </>
  );
}
