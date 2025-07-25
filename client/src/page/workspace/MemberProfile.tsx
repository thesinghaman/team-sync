import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Mail,
  Calendar,
  User,
  Shield,
  Activity,
  ArrowBigUp,
  CheckCircle,
  ClipboardList,
  FolderOpen,
} from "lucide-react";
import { PageSpinner } from "@/components/ui/loading-variants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  getMembersInWorkspaceQueryFn,
  getAllTasksQueryFn,
  getProjectsInWorkspaceQueryFn,
} from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { getAvatarColor, getAvatarFallbackText } from "@/lib/helper";

export default function MemberProfile() {
  const { memberId } = useParams<{ memberId: string }>();
  const workspaceId = useWorkspaceId();

  const { data: membersData, isLoading } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    enabled: !!workspaceId,
  });

  // Get all tasks in workspace
  const { data: allTasksData } = useQuery({
    queryKey: ["all-tasks", workspaceId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        pageSize: 1000,
      }),
    enabled: !!workspaceId,
  });

  // Get tasks assigned to this member
  const { data: tasksAssignedData } = useQuery({
    queryKey: ["tasks-assigned", workspaceId, memberId],
    queryFn: () =>
      getAllTasksQueryFn({
        workspaceId,
        assignedTo: memberId,
        pageSize: 100,
      }),
    enabled: !!workspaceId && !!memberId,
  });

  // Get all projects in workspace
  const { data: allProjectsData } = useQuery({
    queryKey: ["all-projects", workspaceId],
    queryFn: () =>
      getProjectsInWorkspaceQueryFn({
        workspaceId,
        pageSize: 1000,
      }),
    enabled: !!workspaceId,
  });

  const member = membersData?.members?.find((m) => m.userId._id === memberId);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <PageSpinner />
      </div>
    );
  }

  if (!member) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Member not found</h2>
          <p className="text-muted-foreground">
            The member you're looking for doesn't exist in this workspace.
          </p>
        </div>
      </div>
    );
  }

  const name = member.userId.name || "Unknown";
  const initials = getAvatarFallbackText(name);
  const avatarColor = getAvatarColor(name);

  // Calculate activity stats
  const tasksCreated =
    allTasksData?.tasks?.filter((task) => task.createdBy?._id === memberId)
      .length || 0;
  const tasksAssigned = tasksAssignedData?.tasks?.length || 0;
  const projectsCreated =
    allProjectsData?.projects?.filter(
      (project) => project.createdBy?._id === memberId
    ).length || 0;
  const completedTasks =
    tasksAssignedData?.tasks?.filter((task) => task.status === "DONE").length ||
    0;

  return (
    <main className="flex-1 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Member Profile</h2>
          <p className="text-muted-foreground">
            Workspace member details and activity overview
          </p>
        </div>
        <div className="flex items-center gap-2">
          <User className="w-4 h-4" />
          <span className="text-sm font-medium">{member.role.name}</span>
        </div>
      </div>

      {/* Member Info Header */}
      <div className="flex items-center gap-4 mb-6">
        <Avatar className="h-20 w-20">
          <AvatarImage src={member.userId.profilePicture || ""} alt={name} />
          <AvatarFallback className={`text-2xl ${avatarColor}`}>
            {initials}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
          <p className="text-muted-foreground">{member.userId.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline">{member.role.name}</Badge>
            <span className="text-sm text-muted-foreground">
              Joined {format(new Date(member.joinedAt), "MMM yyyy")}
            </span>
          </div>
        </div>
      </div>

      {/* Activity Overview Cards */}
      <div className="grid gap-4 md:gap-5 lg:grid-cols-4 mb-6">
        <Card className="shadow-none w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">
                Tasks Created
              </CardTitle>
              <div className="mb-[0.2px]">
                {tasksCreated > 0 && (
                  <ArrowBigUp
                    strokeWidth={2.5}
                    className="h-4 w-4 text-green-500"
                  />
                )}
              </div>
            </div>
            <ClipboardList
              strokeWidth={2.5}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{tasksCreated}</div>
            <p className="text-xs text-muted-foreground">
              Tasks authored by this member
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">
                Assigned Tasks
              </CardTitle>
              <div className="mb-[0.2px]">
                {tasksAssigned > 0 && (
                  <ArrowBigUp
                    strokeWidth={2.5}
                    className="h-4 w-4 text-green-500"
                  />
                )}
              </div>
            </div>
            <Activity
              strokeWidth={2.5}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{tasksAssigned}</div>
            <p className="text-xs text-muted-foreground">
              Tasks assigned to this member
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">
                Projects Created
              </CardTitle>
              <div className="mb-[0.2px]">
                {projectsCreated > 0 && (
                  <ArrowBigUp
                    strokeWidth={2.5}
                    className="h-4 w-4 text-green-500"
                  />
                )}
              </div>
            </div>
            <FolderOpen
              strokeWidth={2.5}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{projectsCreated}</div>
            <p className="text-xs text-muted-foreground">
              Projects created by this member
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-none w-full">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-1">
              <CardTitle className="text-sm font-medium">
                Completed Tasks
              </CardTitle>
              <div className="mb-[0.2px]">
                {completedTasks > 0 && (
                  <ArrowBigUp
                    strokeWidth={2.5}
                    className="h-4 w-4 text-green-500"
                  />
                )}
              </div>
            </div>
            <CheckCircle
              strokeWidth={2.5}
              className="h-4 w-4 text-muted-foreground"
            />
          </CardHeader>
          <CardContent className="w-full">
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              Completed assigned tasks
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Details */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Member Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Email Address</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {member.userId.email}
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Joined Workspace</span>
                </div>
                <p className="text-sm text-muted-foreground pl-6">
                  {format(new Date(member.joinedAt), "PPPP")}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role & Permissions */}
        <Card className="shadow-none">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Role & Permissions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Current Role</span>
                <Badge variant="secondary" className="capitalize">
                  {member.role.name?.toLowerCase()}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {member.role.name === "ADMIN" &&
                  "Can view, create, edit tasks, projects and manage settings."}
                {member.role.name === "MEMBER" &&
                  "Can view and edit only tasks created by them."}
                {member.role.name === "OWNER" &&
                  "Full access to all workspace features and settings."}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <span className="text-sm font-medium">
                Workspace Contribution
              </span>
              <div className="text-sm text-muted-foreground">
                {tasksCreated > 0 || projectsCreated > 0 ? (
                  <>
                    Active contributor with {tasksCreated} tasks created
                    {projectsCreated > 0 &&
                      ` and ${projectsCreated} projects initiated`}
                    .
                  </>
                ) : (
                  "New member, no tasks or projects created yet."
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
