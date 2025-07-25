import { useState } from "react";
import { useGetUserTasks } from "@/hooks/api/use-get-user-tasks";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useAuthContext } from "@/context/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import {
  Calendar,
  User,
  CheckCircle,
  Archive,
  Activity,
  ArrowBigUp,
  ArrowUpDown,
} from "lucide-react";
import { Loading } from "@/components/ui/loading";
import { TaskStatusEnum, TaskPriorityEnum } from "@/constant";
import {
  transformStatusEnum,
  getAvatarColor,
  getAvatarFallbackText,
} from "@/lib/helper";
import { TaskType } from "@/types/api.type";

const TaskList = ({
  tasks,
  workspaceId,
}: {
  tasks: TaskType[];
  workspaceId: string;
}) => {
  return (
    <div className="flex flex-col pt-2">
      {tasks.length === 0 ? (
        <div className="font-semibold text-sm text-muted-foreground text-center py-5">
          No tasks found
        </div>
      ) : (
        <ul role="list" className="divide-y divide-gray-200">
          {tasks.map((task) => {
            const name = task?.assignedTo?.name || "Unassigned";
            const initials = getAvatarFallbackText(name);
            const avatarColor = getAvatarColor(name);
            const taskPath = task.project
              ? `/workspace/${workspaceId}/project/${task.project._id}/task/${task._id}`
              : `/workspace/${workspaceId}/task/${task._id}`;

            return (
              <li key={task._id} className="hover:bg-gray-50 transition-colors">
                <div className="p-4 flex items-center justify-between w-full">
                  {/* Task Info */}
                  <div className="flex flex-col space-y-1 flex-grow">
                    <div className="flex items-center gap-2">
                      <span className="text-sm capitalize text-gray-600 font-medium">
                        {task.taskCode}
                      </span>
                      {task.project && (
                        <span
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded cursor-pointer hover:bg-blue-100"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (task.project) {
                              window.location.href = `/workspace/${workspaceId}/project/${task.project._id}`;
                            }
                          }}
                        >
                          {task.project.name}
                        </span>
                      )}
                    </div>
                    <Link
                      to={taskPath}
                      className="text-md font-semibold text-gray-800 truncate"
                    >
                      {task.title}
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      {task.dueDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Due: {format(new Date(task.dueDate), "PPP")}
                          </span>
                        </div>
                      )}
                      {task.createdBy && (
                        <div className="flex items-center gap-2">
                          <span>Created by:</span>
                          <Avatar className="h-5 w-5">
                            <AvatarImage
                              src={task.createdBy.profilePicture || ""}
                              alt={task.createdBy.name}
                            />
                            <AvatarFallback className="text-xs">
                              {getAvatarFallbackText(
                                task.createdBy.name || "Unknown"
                              )}
                            </AvatarFallback>
                          </Avatar>
                          <span
                            className="font-medium cursor-pointer"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              if (task.createdBy) {
                                window.location.href = `/workspace/${workspaceId}/members/${task.createdBy._id}`;
                              }
                            }}
                          >
                            {task.createdBy.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Status */}
                  <div className="text-sm font-medium ml-4">
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
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-100 p-1 rounded"
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
                          alt={task.assignedTo?.name || "Unassigned"}
                        />
                        <AvatarFallback className={avatarColor}>
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default function MyTasks() {
  const workspaceId = useWorkspaceId();
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState("projects");
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data, isLoading } = useGetUserTasks({
    workspaceId,
    pageSize: 100,
    sortBy,
    sortOrder,
  });

  const tasks: TaskType[] = data?.tasks || [];

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter((task) => {
    switch (activeTab) {
      case "active":
        return task.status !== "DONE";
      case "completed":
        return task.status === "DONE";
      default:
        return true;
    }
  });

  const activeTasks = tasks.filter((task) => task.status !== "DONE");
  const completedTasks = tasks.filter((task) => task.status === "DONE");

  const handleSortChange = (value: string) => {
    const [field, order] = value.split(":");
    setSortBy(field);
    setSortOrder(order as "asc" | "desc");
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Loading size="lg" variant="spin" className="text-primary" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="flex items-center justify-between space-y-2 mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">My Tasks</h2>
          <p className="text-muted-foreground">
            Here&apos;s the list of tasks assigned to you!
          </p>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">{user?.name}</span>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid gap-4 md:gap-5 lg:grid-cols-2 xl:grid-cols-3 mb-6">
        <Card className="shadow-none w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <div className="mb-[0.2px]">
                {tasks.length > 0 ? (
                  <ArrowBigUp
                    strokeWidth={2.5}
                    className="h-4 w-4 text-green-500"
                  />
                ) : null}
              </div>
            </div>
            <Activity
              strokeWidth={2.5}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-3xl font-bold">{tasks.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">
                Active Tasks
              </CardTitle>
              <div className="mb-[0.2px]">
                {activeTasks.length > 0 ? (
                  <ArrowBigUp
                    strokeWidth={2.5}
                    className="h-4 w-4 text-green-500"
                  />
                ) : null}
              </div>
            </div>
            <CheckCircle
              strokeWidth={2.5}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-3xl font-bold">{activeTasks.length}</div>
          </CardContent>
        </Card>

        <Card className="shadow-none w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">
                Completed Tasks
              </CardTitle>
              <div className="mb-[0.2px]">
                {completedTasks.length > 0 ? (
                  <ArrowBigUp
                    strokeWidth={2.5}
                    className="h-4 w-4 text-green-500"
                  />
                ) : null}
              </div>
            </div>
            <Archive
              strokeWidth={2.5}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-3xl font-bold">{completedTasks.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="mt-4">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full border rounded-lg p-2"
        >
          <div className="flex items-center justify-between mb-2">
            <TabsList className="border-0 bg-gray-50 px-1 h-12">
              <TabsTrigger className="py-2" value="projects">
                All Tasks
              </TabsTrigger>
              <TabsTrigger className="py-2" value="active">
                Active Tasks
              </TabsTrigger>
              <TabsTrigger className="py-2" value="completed">
                Completed Tasks
              </TabsTrigger>
            </TabsList>

            {/* Sort Controls */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-muted-foreground" />
              <Select
                value={`${sortBy}:${sortOrder}`}
                onValueChange={handleSortChange}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="createdAt:desc">Newest First</SelectItem>
                  <SelectItem value="createdAt:asc">Oldest First</SelectItem>
                  <SelectItem value="title:asc">Title (A-Z)</SelectItem>
                  <SelectItem value="title:desc">Title (Z-A)</SelectItem>
                  <SelectItem value="priority:desc">
                    Priority (High-Low)
                  </SelectItem>
                  <SelectItem value="priority:asc">
                    Priority (Low-High)
                  </SelectItem>
                  <SelectItem value="status:asc">Status (A-Z)</SelectItem>
                  <SelectItem value="status:desc">Status (Z-A)</SelectItem>
                  <SelectItem value="dueDate:asc">Due Date (Soon)</SelectItem>
                  <SelectItem value="dueDate:desc">Due Date (Later)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <TabsContent value="projects">
            <TaskList tasks={filteredTasks} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="active">
            <TaskList tasks={filteredTasks} workspaceId={workspaceId} />
          </TabsContent>
          <TabsContent value="completed">
            <TaskList tasks={filteredTasks} workspaceId={workspaceId} />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
