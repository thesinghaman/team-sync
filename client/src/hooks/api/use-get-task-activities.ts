import { useQuery } from "@tanstack/react-query";
import { getTaskActivitiesQueryFn } from "@/lib/api";

export default function useGetTaskActivities(
  taskId: string,
  workspaceId: string
) {
  return useQuery({
    queryKey: ["task-activities", taskId, workspaceId],
    queryFn: () => getTaskActivitiesQueryFn({ taskId, workspaceId }),
    enabled: !!taskId && !!workspaceId,
  });
}
