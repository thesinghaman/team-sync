import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useCreateWorkspaceDialog from "@/hooks/use-create-workspace-dialog";
import {
  Building2,
  Plus,
  Users,
  FolderKanban,
  UserPlus,
  Settings,
  LogOut,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, useNavigate } from "react-router-dom";
import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import { useAuthContext } from "@/context/auth-provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/components/logo";

const NoWorkspaceState = () => {
  const { onOpen } = useCreateWorkspaceDialog();
  const { data: authData, isLoading: authLoading } = useAuth();
  const { logout } = useAuthContext();
  const navigate = useNavigate();
  const user = authData?.user;

  // Fetch user workspaces to check if they actually have any
  const { data: workspaceData, isLoading: workspacesLoading } = useQuery({
    queryKey: ["userWorkspaces"],
    queryFn: getAllWorkspacesUserIsMemberQueryFn,
    enabled: !!user,
    staleTime: 0,
    retry: 1,
  });

  const workspaces = workspaceData?.workspaces || [];

  // Show loading state while checking auth or workspaces
  if (authLoading || workspacesLoading) {
    return <DashboardSkeleton />;
  }

  // If user is not authenticated, redirect to sign-in
  if (!user) {
    return <Navigate to="/sign-in" replace />;
  }

  // If user has workspaces, redirect them to their current workspace or first workspace
  if (workspaces.length > 0) {
    const targetWorkspace = user.currentWorkspace?._id || workspaces[0]._id;
    return <Navigate to={`/workspace/${targetWorkspace}`} replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <Logo />
            <span className="text-lg font-semibold">Team Sync.</span>
          </div>

          <div className="flex items-center gap-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.profilePicture || ""} />
                    <AvatarFallback>
                      {user.name?.split(" ")?.[0]?.charAt(0)}
                      {user.name?.split(" ")?.[1]?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/user/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Account Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="max-w-2xl mx-auto p-6">
          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold mb-2">No Workspaces Found</h1>
            <p className="text-lg text-muted-foreground mb-6">
              You don't have access to any workspaces yet. You can create your
              own workspace or ask someone to invite you to their workspace.
            </p>
          </div>

          <Card className="mb-6 border shadow-none">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                What is a Workspace?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Collaborate with your team</h4>
                  <p className="text-sm text-muted-foreground">
                    Invite team members and work together on projects
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FolderKanban className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Organize projects and tasks</h4>
                  <p className="text-sm text-muted-foreground">
                    Keep your projects organized with tasks, deadlines, and
                    assignments
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium">Separate work contexts</h4>
                  <p className="text-sm text-muted-foreground">
                    Create different workspaces for different organizations or
                    projects
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center space-y-4">
            <div className="space-y-3">
              <Button
                onClick={onOpen}
                size="lg"
                className="h-12 px-8 text-base font-medium w-full sm:w-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Your Own Workspace
              </Button>

              <div className="text-sm text-muted-foreground">or</div>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-muted-foreground">
                  <UserPlus className="h-5 w-5" />
                  <span className="text-base font-medium">
                    Get Invited to a Workspace
                  </span>
                </div>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Ask a workspace owner to share an invite link with you. You'll
                  be able to join their workspace instantly using the link.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoWorkspaceState;
