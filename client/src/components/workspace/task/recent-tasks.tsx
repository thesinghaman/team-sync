import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TaskPriorityEnum, TaskStatusEnum } from "@/constant";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAllTasksQueryFn } from "@/lib/api";
import {
  getAvatarColor,
  getAvatarFallbackText,
  transformStatusEnum,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Loader } from "lucide-react";
import { Link } from "react-router-dom";

const RecentTasks = () => {
  const workspaceId = useWorkspaceId();

  const { data, isLoading } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
      }),
    staleTime: 0,
    enabled: !!workspaceId,
  });

  const tasks: TaskType[] = data?.tasks || [];

  return (
    <div className="flex flex-col space-y-6">
      {isLoading ? (
        <Loader
          className="w-8 h-8
        animate-spin
        place-self-center flex
        "
        />
      ) : null}

      {tasks?.length === 0 && (
        <div
          className="font-semibold
         text-sm text-muted-foreground
          text-center py-5"
        >
          No Task created yet
        </div>
      )}

      <ul role="list" className="divide-y divide-gray-200">
        {tasks.map((task) => {
          const name = task?.assignedTo?.name || "";
          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);
          const taskPath = task.project
            ? `/workspace/${workspaceId}/project/${task.project._id}/task/${task._id}`
            : null;

          return (
            <li key={task._id} className="hover:bg-gray-50 transition-colors">
              {taskPath ? (
                <div className="p-4 flex items-center justify-between w-full">
                  {/* Task Info */}
                  <div className="flex flex-col space-y-1 flex-grow">
                    <span className="text-sm capitalize text-gray-600 font-medium">
                      {task.taskCode}
                    </span>
                    <Link
                      to={taskPath}
                      className="text-md font-semibold text-gray-800 truncate cursor-pointer"
                    >
                      {task.title}
                    </Link>
                    <span className="text-sm text-gray-500">
                      Due: {task.dueDate ? format(task.dueDate, "PPP") : null}
                    </span>
                  </div>

                  {/* Task Status */}
                  <div className="text-sm font-medium">
                    <Badge
                      variant={TaskStatusEnum[task.status]}
                      className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                    >
                      <span>{transformStatusEnum(task.status)}</span>
                    </Badge>
                  </div>

                  {/* Task Priority */}
                  <div className="text-sm ml-2">
                    <Badge
                      variant={TaskPriorityEnum[task.priority]}
                      className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                    >
                      <span>{transformStatusEnum(task.priority)}</span>
                    </Badge>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center space-x-2 ml-2">
                    <div
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (task.assignedTo?._id) {
                          window.location.href = `/workspace/${workspaceId}/members/${task.assignedTo._id}`;
                        }
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={task.assignedTo?.profilePicture || ""}
                          alt={task.assignedTo?.name}
                        />
                        <AvatarFallback className={avatarColor}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 flex items-center justify-between w-full">
                  {/* Task Info - No link for tasks without projects */}
                  <div className="flex flex-col space-y-1 flex-grow">
                    <span className="text-sm capitalize text-gray-600 font-medium">
                      {task.taskCode}
                    </span>
                    <p className="text-md font-semibold text-gray-800 truncate">
                      {task.title}
                    </p>
                    <span className="text-sm text-gray-500">
                      Due: {task.dueDate ? format(task.dueDate, "PPP") : null}
                    </span>
                  </div>

                  {/* Task Status */}
                  <div className="text-sm font-medium">
                    <Badge
                      variant={TaskStatusEnum[task.status]}
                      className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                    >
                      <span>{transformStatusEnum(task.status)}</span>
                    </Badge>
                  </div>

                  {/* Task Priority */}
                  <div className="text-sm ml-2">
                    <Badge
                      variant={TaskPriorityEnum[task.priority]}
                      className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
                    >
                      <span>{transformStatusEnum(task.priority)}</span>
                    </Badge>
                  </div>

                  {/* Assignee */}
                  <div className="flex items-center space-x-2 ml-2">
                    <div
                      className="cursor-pointer hover:bg-gray-100 p-1 rounded"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (task.assignedTo?._id) {
                          window.location.href = `/workspace/${workspaceId}/members/${task.assignedTo._id}`;
                        }
                      }}
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={task.assignedTo?.profilePicture || ""}
                          alt={task.assignedTo?.name}
                        />
                        <AvatarFallback className={avatarColor}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default RecentTasks;
