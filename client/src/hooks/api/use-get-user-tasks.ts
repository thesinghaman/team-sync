import { useQuery } from "@tanstack/react-query";
import { getAllTasksQueryFn } from "@/lib/api";
import { useAuthContext } from "@/context/auth-provider";
import { TaskStatusEnumType, TaskPriorityEnumType } from "@/constant";

interface UseGetUserTasksProps {
  workspaceId: string;
  status?: TaskStatusEnumType;
  priority?: TaskPriorityEnumType;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export const useGetUserTasks = ({
  workspaceId,
  status,
  priority,
  pageNumber = 1,
  pageSize = 100,
  sortBy,
  sortOrder,
}: UseGetUserTasksProps) => {
  const { user } = useAuthContext();

  return useQuery({
    queryKey: [
      "user-tasks",
      workspaceId,
      user?._id,
      status,
      priority,
      pageNumber,
      pageSize,
      sortBy,
      sortOrder,
    ],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        assignedTo: user?._id,
        status,
        priority,
        pageNumber,
        pageSize,
        sortBy,
        sortOrder,
      }),
    staleTime: 0,
    enabled: !!workspaceId && !!user?._id,
  });
};

export default useGetUserTasks;
