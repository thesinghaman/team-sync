import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "./ui/separator";
import {
  Link,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useQuery } from "@tanstack/react-query";
import { getTaskByIdQueryFn, getMembersInWorkspaceQueryFn } from "@/lib/api";

const Header = () => {
  const location = useLocation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const workspaceId = useWorkspaceId();

  const pathname = location.pathname;

  const getPageLabel = (pathname: string) => {
    if (pathname.includes("/user/settings")) return "Settings";
    if (pathname.includes("/project/")) return "Project";
    if (pathname.includes("/my-tasks")) return "My Tasks";
    if (pathname.includes("/tasks")) return "Tasks";
    if (pathname.includes("/members")) return "Members";
    return null; // Default label
  };

  const getBreadcrumbData = () => {
    const { taskId, projectId, memberId } = params;

    // Settings page with tab navigation
    if (pathname.includes("/user/settings")) {
      const tab = searchParams.get("tab");
      const getTabDisplayName = (tab: string | null) => {
        switch (tab) {
          case "profile":
            return "Profile";
          case "account":
            return "Account";
          case "security":
            return "Security";
          case "danger-zone":
            return "Danger Zone";
          default:
            return "Profile";
        }
      };

      return {
        parentLabel: "Settings",
        parentPath: "/user/settings",
        currentLabel: getTabDisplayName(tab),
        fetchTaskData: false,
        fetchMemberData: false,
        isSettings: true,
      };
    }

    // Task details page
    if (taskId && projectId) {
      return {
        parentLabel: "Tasks",
        parentPath: `/workspace/${workspaceId}/tasks`,
        currentLabel: "Task Details",
        fetchTaskData: true,
        fetchMemberData: false,
        isSettings: false,
      };
    }

    // Member profile page
    if (memberId && pathname.includes("/members/")) {
      return {
        parentLabel: "Members",
        parentPath: `/workspace/${workspaceId}/members`,
        currentLabel: "Member Profile",
        fetchTaskData: false,
        fetchMemberData: true,
        isSettings: false,
      };
    }

    // Regular pages
    const pageHeading = getPageLabel(pathname);
    return {
      parentLabel: null,
      parentPath: null,
      currentLabel: pageHeading,
      fetchTaskData: false,
      fetchMemberData: false,
      isSettings: false,
    };
  };

  const {
    parentLabel,
    parentPath,
    currentLabel,
    fetchTaskData,
    fetchMemberData,
    isSettings,
  } = getBreadcrumbData();

  // Fetch task data if needed
  const { data: taskData } = useQuery({
    queryKey: ["task-details", params.taskId, params.projectId, workspaceId],
    queryFn: () =>
      getTaskByIdQueryFn({
        taskId: params.taskId!,
        projectId: params.projectId!,
        workspaceId,
      }),
    enabled:
      fetchTaskData && !!params.taskId && !!params.projectId && !!workspaceId,
  });

  // Fetch member data if needed
  const { data: membersData } = useQuery({
    queryKey: ["members", workspaceId],
    queryFn: () => getMembersInWorkspaceQueryFn(workspaceId),
    enabled: fetchMemberData && !!workspaceId,
  });

  // Get the actual names for breadcrumbs
  const getDisplayLabel = () => {
    if (fetchTaskData && taskData?.task) {
      return taskData.task.title;
    }
    if (fetchMemberData && membersData?.members && params.memberId) {
      const member = membersData.members.find(
        (m) => m.userId._id === params.memberId
      );
      return member ? member.userId.name : "Member Profile";
    }
    return currentLabel;
  };

  const displayLabel = getDisplayLabel();

  return (
    <header className="flex sticky top-0 z-50 bg-white h-12 shrink-0 items-center border-b">
      <div className="flex flex-1 items-center gap-2 px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block text-[15px]">
              {displayLabel ? (
                <BreadcrumbLink asChild>
                  <Link
                    to={
                      isSettings
                        ? "/user/settings"
                        : workspaceId
                        ? `/workspace/${workspaceId}`
                        : "/"
                    }
                  >
                    {isSettings ? "Settings" : "Dashboard"}
                  </Link>
                </BreadcrumbLink>
              ) : (
                <BreadcrumbPage className="line-clamp-1 ">
                  {isSettings ? "Settings" : "Dashboard"}
                </BreadcrumbPage>
              )}
            </BreadcrumbItem>

            {parentLabel && !isSettings && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="text-[15px]">
                  <BreadcrumbLink asChild>
                    <Link to={parentPath}>{parentLabel}</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </>
            )}

            {displayLabel && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem className="text-[15px]">
                  <BreadcrumbPage className="line-clamp-1">
                    {displayLabel}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};

export default Header;
