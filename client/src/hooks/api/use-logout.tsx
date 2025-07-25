import { logoutMutationFn } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const useLogout = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: logoutMutationFn,
    onSuccess: async () => {
      // Clear localStorage token for Safari fallback
      localStorage.removeItem('auth-token');
      
      // Show success toast first
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
      });

      // Simple cache clear without complex invalidations
      queryClient.clear();

      // Navigate after a small delay to let toast show
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    },
    onError: async () => {
      // Clear localStorage token even on error
      localStorage.removeItem('auth-token');
      
      // Show error toast
      toast({
        title: "Logout Error",
        description:
          "There was an error logging out, but you have been signed out locally.",
        variant: "destructive",
      });

      // Clear cache even on error
      queryClient.clear();

      // Navigate after a small delay
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 100);
    },
  });

  return mutation;
};

export default useLogout;
