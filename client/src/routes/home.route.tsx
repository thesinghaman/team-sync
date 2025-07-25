import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, useSearchParams } from "react-router-dom";
import LandingPage from "@/page/LandingPage";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";

const HomeRoute = () => {
  const [searchParams] = useSearchParams();
  const { data: authData, isLoading, error } = useAuth();
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const user = authData?.user;

  // Show the landing page explicitly if ?landing=true is in URL
  const showLanding = searchParams.get("landing") === "true";

  // Fetch user workspaces if user is authenticated
  const { data: workspaceData, isLoading: workspacesLoading } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    enabled: !!user && !showLanding, // Only fetch if user is authenticated and not showing landing
    staleTime: 0,
    retry: 1,
  });

  const workspaces = workspaceData?.workspaces || [];

  // Set a timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingTimeout(true);
    }, 5000); // 5 second timeout

    return () => clearTimeout(timer);
  }, []);

  // If there's an error or loading times out, show landing page
  if (error || loadingTimeout) {
    return <LandingPage />;
  }

  // Show loading only during initial auth check (but not forever)
  if ((isLoading || workspacesLoading) && !loadingTimeout) {
    return <DashboardSkeleton />;
  }

  // Auto-redirect authenticated users based on their workspace status
  if (user && !showLanding) {
    // If user has no workspaces, redirect to no-workspace state
    if (workspaces.length === 0) {
      return <Navigate to="/no-workspace" replace />;
    }

    // If user has workspaces but no current workspace set, redirect to first workspace
    if (!user.currentWorkspace && workspaces.length > 0) {
      return <Navigate to={`/workspace/${workspaces[0]._id}`} replace />;
    }

    // If user has current workspace, redirect to it
    if (user.currentWorkspace) {
      return (
        <Navigate to={`/workspace/${user.currentWorkspace._id}`} replace />
      );
    }
  }

  // Show landing page for everyone else
  return <LandingPage />;
};

export default HomeRoute;
