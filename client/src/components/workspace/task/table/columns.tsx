import { Column, ColumnDef, Row } from "@tanstack/react-table";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

import { DataTableColumnHeader } from "./table-column-header";
import { DataTableRowActions } from "./table-row-actions";
import { Badge } from "@/components/ui/badge";
import {
  TaskPriorityEnum,
  TaskPriorityEnumType,
  TaskStatusEnum,
  TaskStatusEnumType,
} from "@/constant";
import {
  formatStatusToEnum,
  getAvatarColor,
  getAvatarFallbackText,
} from "@/lib/helper";
import { priorities, statuses } from "./data";
import { TaskType } from "@/types/api.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import useWorkspaceId from "@/hooks/use-workspace-id";

export const getColumns = (projectId?: string): ColumnDef<TaskType>[] => {
  const columns: ColumnDef<TaskType>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ row }) => {
        const TaskRow = () => {
          const navigate = useNavigate();
          const workspaceId = useWorkspaceId();

          const handleClick = () => {
            const projectId = row.original.project?._id;
            if (projectId) {
              navigate(
                `/workspace/${workspaceId}/project/${projectId}/task/${row.original._id}`
              );
            }
          };

          return (
            <div
              className="flex flex-wrap space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={handleClick}
            >
              <Badge variant="outline" className="capitalize shrink-0 h-[25px]">
                {row.original.taskCode}
              </Badge>
              <span className="block lg:max-w-[220px] max-w-[200px] font-medium">
                {row.original.title}
              </span>
            </div>
          );
        };

        return <TaskRow />;
      },
    },
    ...(projectId
      ? [] // If projectId exists, exclude the "Project" column
      : [
          {
            accessorKey: "project",
            header: ({ column }: { column: Column<TaskType, unknown> }) => (
              <DataTableColumnHeader column={column} title="Project" />
            ),
            cell: ({ row }: { row: Row<TaskType> }) => {
              const ProjectCell = () => {
                const navigate = useNavigate();
                const workspaceId = useWorkspaceId();
                const project = row.original.project;

                if (!project) {
                  return null;
                }

                const handleClick = () => {
                  navigate(`/workspace/${workspaceId}/project/${project._id}`);
                };

                return (
                  <div
                    className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    onClick={handleClick}
                  >
                    <span className="rounded-full border">{project.emoji}</span>
                    <span className="block capitalize truncate w-[100px] text-ellipsis">
                      {project.name}
                    </span>
                  </div>
                );
              };

              return <ProjectCell />;
            },
          },
        ]),
    {
      accessorKey: "assignedTo",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Assigned To" />
      ),
      cell: ({ row }) => {
        const AssigneeCell = () => {
          const navigate = useNavigate();
          const workspaceId = useWorkspaceId();
          const assignee = row.original.assignedTo || null;
          const name = assignee?.name || "";

          const initials = getAvatarFallbackText(name);
          const avatarColor = getAvatarColor(name);

          if (!name || !assignee) {
            return null;
          }

          const handleClick = () => {
            navigate(`/workspace/${workspaceId}/members/${assignee._id}`);
          };

          return (
            <div
              className="flex items-center gap-1 cursor-pointer hover:bg-gray-50 p-2 rounded"
              onClick={handleClick}
            >
              <Avatar className="h-6 w-6">
                <AvatarImage src={assignee?.profilePicture || ""} alt={name} />
                <AvatarFallback className={avatarColor}>
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="block text-ellipsis w-[100px] truncate">
                {assignee?.name}
              </span>
            </div>
          );
        };

        return <AssigneeCell />;
      },
    },
    {
      accessorKey: "dueDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Due Date" />
      ),
      cell: ({ row }) => {
        return (
          <span className="lg:max-w-[100px] text-sm">
            {row.original.dueDate ? format(row.original.dueDate, "PPP") : null}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = statuses.find(
          (status) => status.value === row.getValue("status")
        );

        if (!status) {
          return null;
        }

        const statusKey = formatStatusToEnum(
          status.value
        ) as TaskStatusEnumType;
        const Icon = status.icon;

        if (!Icon) {
          return null;
        }

        return (
          <div className="flex lg:w-[120px] items-center">
            <Badge
              variant={TaskStatusEnum[statusKey]}
              className="flex w-auto p-1 px-2 gap-1 font-medium shadow-sm uppercase border-0"
            >
              <Icon className="h-4 w-4 rounded-full text-inherit" />
              <span>{status.label}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: "priority",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Priority" />
      ),
      cell: ({ row }) => {
        const priority = priorities.find(
          (priority) => priority.value === row.getValue("priority")
        );

        if (!priority) {
          return null;
        }

        const statusKey = formatStatusToEnum(
          priority.value
        ) as TaskPriorityEnumType;
        const Icon = priority.icon;

        if (!Icon) {
          return null;
        }

        return (
          <div className="flex items-center">
            <Badge
              variant={TaskPriorityEnum[statusKey]}
              className="flex lg:w-[110px] p-1 gap-1 !bg-transparent font-medium !shadow-none uppercase border-0"
            >
              <Icon className="h-4 w-4 rounded-full text-inherit" />
              <span>{priority.label}</span>
            </Badge>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <>
            <DataTableRowActions row={row} />
          </>
        );
      },
    },
  ];

  return columns;
};
