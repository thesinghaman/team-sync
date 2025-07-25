import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthRoute } from "./common/routePaths";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";

const AuthRoute = () => {
  const location = useLocation();
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;

  const _isAuthRoute = isAuthRoute(location.pathname);

  // Fetch user workspaces if user is authenticated
  const { data: workspaceData, isLoading: workspacesLoading } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    enabled: !!user, // Only fetch if user is authenticated
    staleTime: 0,
    retry: 1,
  });

  const workspaces = workspaceData?.workspaces || [];

  if ((isLoading || workspacesLoading) && !_isAuthRoute)
    return <DashboardSkeleton />;

  if (!user) return <Outlet />;

  // Don't make any workspace-based redirects while workspace query is loading
  if (workspacesLoading) {
    return <DashboardSkeleton />;
  }

  // If user has no workspaces, redirect to no-workspace state
  if (workspaces.length === 0) {
    return <Navigate to="/no-workspace" replace />;
  }

  // If user has workspaces but no current workspace, redirect to first workspace
  if (!user.currentWorkspace && workspaces.length > 0) {
    return <Navigate to={`/workspace/${workspaces[0]._id}`} replace />;
  }

  // If user has current workspace, redirect to it
  return <Navigate to={`/workspace/${user.currentWorkspace?._id}`} replace />;
};

export default AuthRoute;
