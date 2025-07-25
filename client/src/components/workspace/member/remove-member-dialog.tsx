import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Trash2, Loader, AlertTriangle, User } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/hooks/use-toast";
import {
  getMemberAssignedTasksQueryFn,
  removeMemberFromWorkspaceMutationFn,
} from "@/lib/api";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

interface TaskData {
  _id: string;
  title: string;
  taskCode: string;
  status: string;
  project: {
    name: string;
  };
}

interface RemoveMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  memberToRemove: {
    userId: {
      _id: string;
      name: string;
      email: string;
      profilePicture?: string;
    };
    role: {
      name: string;
    };
  };
  availableMembers: Array<{
    userId: {
      _id: string;
      name: string;
      email: string;
      profilePicture?: string;
    };
    role: {
      name: string;
    };
  }>;
}

export const RemoveMemberDialog: React.FC<RemoveMemberDialogProps> = ({
  open,
  onOpenChange,
  workspaceId,
  memberToRemove,
  availableMembers,
}) => {
  const [taskAction, setTaskAction] = useState<"transfer" | "delete">(
    "transfer"
  );
  const [transferTo, setTransferTo] = useState<string>("");
  const queryClient = useQueryClient();

  // Reset state when dialog is closed
  useEffect(() => {
    if (!open) {
      setTaskAction("transfer");
      setTransferTo("");
    }
  }, [open]);

  const { data: assignedTasksData, isLoading: isLoadingTasks } = useQuery({
    queryKey: ["member-assigned-tasks", workspaceId, memberToRemove.userId._id],
    queryFn: () =>
      getMemberAssignedTasksQueryFn({
        workspaceId,
        memberId: memberToRemove.userId._id,
      }),
    enabled: open,
  });

  const { mutate: removeMember, isPending: isRemoving } = useMutation({
    mutationFn: removeMemberFromWorkspaceMutationFn,
    onSuccess: (data) => {
      // Invalidate multiple query keys to ensure fresh data
      queryClient.invalidateQueries({
        queryKey: ["members", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["member-assigned-tasks", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["workspace", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["tasks", workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", workspaceId],
      });

      toast({
        title: "Success",
        description: `Member removed successfully. ${
          data.taskAction
            ? `${data.taskAction.totalTasks} tasks were ${data.taskAction.action}.`
            : "No tasks were affected."
        }`,
        variant: "success",
      });
      onOpenChange(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRemoveMember = () => {
    const transferTasksTo = taskAction === "transfer" ? transferTo : null;

    if (
      taskAction === "transfer" &&
      assignedTasksData?.totalTasks > 0 &&
      !transferTo
    ) {
      toast({
        title: "Error",
        description: "Please select a member to transfer tasks to.",
        variant: "destructive",
      });
      return;
    }

    removeMember({
      workspaceId,
      memberId: memberToRemove.userId._id,
      transferTasksTo,
    });
  };

  const memberName = memberToRemove.userId.name;
  const memberInitials = getAvatarFallbackText(memberName);
  const memberAvatarColor = getAvatarColor(memberName);
  const hasTasks = assignedTasksData?.totalTasks > 0;

  // Filter available members (exclude the member being removed)
  const eligibleMembers = availableMembers.filter(
    (member) => member.userId._id !== memberToRemove.userId._id
  );

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-destructive" />
            Remove Member
          </AlertDialogTitle>
          <AlertDialogDescription>
            You are about to remove{" "}
            <span className="font-medium">{memberName}</span> from this
            workspace.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4">
            {/* Member Info */}
            <Card className="shadow-none">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Member Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={memberToRemove.userId.profilePicture || ""}
                    />
                    <AvatarFallback className={memberAvatarColor}>
                      {memberInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{memberName}</p>
                    <p className="text-sm text-muted-foreground">
                      {memberToRemove.userId.email}
                    </p>
                    <Badge variant="secondary" className="mt-1">
                      {memberToRemove.role.name}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Task Information */}
            {isLoadingTasks ? (
              <Card className="shadow-none">
                <CardContent className="p-6">
                  <div className="flex items-center justify-center">
                    <Loader className="h-6 w-6 animate-spin" />
                    <span className="ml-2">Loading assigned tasks...</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-none">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Assigned Tasks ({assignedTasksData?.totalTasks || 0})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hasTasks ? (
                    <div className="space-y-4">
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                        <div className="flex items-center gap-2 text-amber-800">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="font-medium">Warning</span>
                        </div>
                        <p className="text-sm text-amber-700 mt-1">
                          This member has {assignedTasksData?.totalTasks}{" "}
                          assigned tasks. Please choose what should happen to
                          these tasks.
                        </p>
                      </div>

                      {/* Task Action Selection */}
                      <div className="space-y-3">
                        <Label className="text-sm font-medium">
                          What should happen to the assigned tasks?
                        </Label>
                        <div className="space-y-2">
                          <div className="flex flex-col gap-2">
                            <Button
                              variant={
                                taskAction === "transfer"
                                  ? "default"
                                  : "outline"
                              }
                              className="justify-start h-auto p-3"
                              onClick={() => setTaskAction("transfer")}
                            >
                              <div className="text-left">
                                <div className="font-medium">
                                  Transfer tasks to another member
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  All assigned tasks will be transferred to the
                                  selected member
                                </div>
                              </div>
                            </Button>
                            <Button
                              variant={
                                taskAction === "delete"
                                  ? "destructive"
                                  : "outline"
                              }
                              className="justify-start h-auto p-3"
                              onClick={() => setTaskAction("delete")}
                            >
                              <div className="text-left">
                                <div className="font-medium">
                                  Delete all assigned tasks
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  All assigned tasks will be permanently deleted
                                  (cannot be undone)
                                </div>
                              </div>
                            </Button>
                          </div>
                        </div>

                        {/* Transfer To Selection */}
                        {taskAction === "transfer" && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">
                              Transfer tasks to:
                            </Label>
                            <Select
                              value={transferTo}
                              onValueChange={setTransferTo}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a member" />
                              </SelectTrigger>
                              <SelectContent>
                                {eligibleMembers.map((member) => (
                                  <SelectItem
                                    key={member.userId._id}
                                    value={member.userId._id}
                                  >
                                    <div className="flex items-center gap-2">
                                      <Avatar className="h-6 w-6">
                                        <AvatarImage
                                          src={
                                            member.userId.profilePicture || ""
                                          }
                                        />
                                        <AvatarFallback
                                          className={getAvatarColor(
                                            member.userId.name
                                          )}
                                        >
                                          {getAvatarFallbackText(
                                            member.userId.name
                                          )}
                                        </AvatarFallback>
                                      </Avatar>
                                      <span>{member.userId.name}</span>
                                      <Badge
                                        variant="outline"
                                        className="ml-auto"
                                      >
                                        {member.role.name}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>

                      {/* Task List Preview */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">
                          Tasks to be affected:
                        </Label>
                        <div className="border rounded-lg max-h-48 overflow-y-auto">
                          {assignedTasksData?.tasks.map((task: TaskData) => (
                            <div
                              key={task._id}
                              className="p-3 border-b last:border-b-0"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <p className="font-medium text-sm">
                                    {task.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {task.project.name} • {task.taskCode}
                                  </p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {task.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">
                      <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No tasks assigned to this member</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <AlertDialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleRemoveMember}
            disabled={isRemoving || isLoadingTasks}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isRemoving ? (
              <>
                <Loader className="h-4 w-4 mr-2 animate-spin" />
                Removing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Member
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
