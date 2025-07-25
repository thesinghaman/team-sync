import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    staleTime: 0,
    retry: (failureCount, error) => {
      // Don't retry on authentication errors (401, 403)
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { status?: number } };
        if (
          axiosError.response?.status === 401 ||
          axiosError.response?.status === 403
        ) {
          return false;
        }
      }
      return failureCount < 2;
    },
  });
  return query;
};

export default useAuth;
