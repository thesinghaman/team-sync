/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery } from "@tanstack/react-query";
import { getWorkspaceByIdQueryFn } from "@/lib/api";
import { CustomError } from "@/types/custom-error.type";

const useGetWorkspaceQuery = (
  workspaceId: string,
  options?: { enabled?: boolean }
) => {
  const query = useQuery<any, CustomError>({
    queryKey: ["workspace", workspaceId],
    queryFn: () => getWorkspaceByIdQueryFn(workspaceId),
    staleTime: 0,
    retry: (failureCount, error) => {
      // Don't retry on unauthorized errors
      if (error?.errorCode === "ACCESS_UNAUTHORIZED") {
        return false;
      }
      return failureCount < 2;
    },
    enabled: options?.enabled !== undefined ? options.enabled : !!workspaceId,
  });

  return query;
};

export default useGetWorkspaceQuery;
