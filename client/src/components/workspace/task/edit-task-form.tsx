import { z } from "zod";
import { format } from "date-fns";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { ButtonSpinner } from "@/components/ui/loading-variants";
import { useState } from "react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "../../ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useGetWorkspaceMembers from "@/hooks/api/use-get-workspace-members";
import { editTaskMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { TaskType } from "@/types/api.type";
import { useAuthContext } from "@/context/auth-provider";

export default function EditTaskForm({
  task,
  onClose,
  canEdit = true,
  canChangeStatus = true,
}: {
  task: TaskType;
  onClose: () => void;
  canEdit?: boolean;
  canChangeStatus?: boolean;
}) {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();
  const { user: currentUser } = useAuthContext();
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const { mutate, isPending } = useMutation({
    mutationFn: editTaskMutationFn,
  });

  const { data: memberData } = useGetWorkspaceMembers(workspaceId);
  const members = memberData?.members || [];

  // Get current user's role in the workspace
  const currentUserMember = members.find(
    (member) => member.userId._id === currentUser?._id
  );
  const currentUserRole = currentUserMember?.role.name;
  const isCurrentUserOwner = currentUserRole === "Owner";

  // Members Dropdown Options - filter based on current user's role
  // Members cannot assign tasks to owners (unless they are owners themselves)
  const membersOptions = members
    .filter((member) => {
      // If current user is not an owner, they cannot assign tasks to owners
      if (!isCurrentUserOwner && member.role.name === "Owner") {
        return false;
      }
      return true;
    })
    .map((member) => ({
      label: member.userId?.name || "Unknown",
      value: member.userId?._id || "",
      role: member.role.name,
    }));

  // Status & Priority Options
  const statusOptions = Object.values(TaskStatusEnum).map((status) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  }));

  const priorityOptions = Object.values(TaskPriorityEnum).map((priority) => ({
    label: priority.charAt(0) + priority.slice(1).toLowerCase(),
    value: priority,
  }));

  const formSchema = z.object({
    title: z.string().trim().min(1, { message: "Title is required" }),
    description: z.string().trim(),
    status: z.enum(
      Object.values(TaskStatusEnum) as [keyof typeof TaskStatusEnum]
    ),
    priority: z.enum(
      Object.values(TaskPriorityEnum) as [keyof typeof TaskPriorityEnum]
    ),
    assignedTo: z.string().trim().min(1, { message: "AssignedTo is required" }),
    dueDate: z.date({ required_error: "A due date is required." }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: task?.title ?? "",
      description: task?.description ?? "",
      status: task?.status ?? "TODO",
      priority: task?.priority ?? "MEDIUM",
      assignedTo: task.assignedTo?._id ?? "",
      dueDate: task?.dueDate ? new Date(task.dueDate) : new Date(),
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (isPending) return;

    const payload = {
      workspaceId,
      projectId: task.project?._id ?? "",
      taskId: task._id,
      data: {
        ...values,
        dueDate: values.dueDate.toISOString(),
      },
    };

    mutate(payload, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["all-tasks", workspaceId] });
        queryClient.invalidateQueries({ queryKey: ["task-details"] });
        queryClient.invalidateQueries({ queryKey: ["task-activities"] });
        toast({
          title: "Success",
          description: "Task updated successfully",
          variant: "success",
        });
        onClose();
      },
      onError: (error) => {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="w-full h-auto max-w-full">
      <div className="h-full">
        <Form {...form}>
          <form className="space-y-3" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Task title"
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={2}
                      placeholder="Description"
                      disabled={!canEdit}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assigned To */}
            <FormField
              control={form.control}
              name="assignedTo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assigned To</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                    disabled={!canEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an assignee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <div className="w-full max-h-[200px] overflow-y-auto scrollbar">
                        {membersOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center justify-between w-full">
                              <span>{option.label}</span>
                              {option.role === "Owner" && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  (Owner)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </div>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Due Date */}
            <FormField
              control={form.control}
              name="dueDate"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Popover
                      open={isDatePickerOpen}
                      onOpenChange={setIsDatePickerOpen}
                      modal={false}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          type="button"
                          disabled={!canEdit}
                          className="w-full justify-start text-left font-normal"
                        >
                          {field.value
                            ? format(field.value, "PPP")
                            : "Pick a date"}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            setIsDatePickerOpen(false);
                          }}
                          initialFocus={false}
                        />
                      </PopoverContent>
                    </Popover>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                    disabled={!canChangeStatus}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    defaultValue={field.value}
                    disabled={!canEdit}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {priorityOptions.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={isPending || (!canEdit && !canChangeStatus)}
            >
              {isPending && <ButtonSpinner />}
              {canEdit ? "Save Changes" : "Update Status"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
