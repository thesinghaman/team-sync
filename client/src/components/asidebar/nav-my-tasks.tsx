import { CheckCircle } from "lucide-react";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import useWorkspaceId from "@/hooks/use-workspace-id";
import { useGetUserTasks } from "@/hooks/api/use-get-user-tasks";
import { Badge } from "@/components/ui/badge";

export function NavMyTasks() {
  const workspaceId = useWorkspaceId();
  const location = useLocation();
  const pathname = location.pathname;

  const myTasksUrl = `/workspace/${workspaceId}/my-tasks`;
  const isActive = pathname === myTasksUrl;

  // Get user's tasks and count active ones (not DONE)
  const { data } = useGetUserTasks({
    workspaceId,
    pageSize: 100,
  });

  const tasks = data?.tasks || [];
  const activeTasks = tasks.filter((task) => task.status !== "DONE");
  const activeTaskCount = activeTasks.length;

  return (
    <SidebarGroup>
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton isActive={isActive} asChild>
            <Link to={myTasksUrl} className="!text-[15px]">
              <CheckCircle />
              <span>My Tasks</span>
              {activeTaskCount > 0 && (
                <Badge
                  variant="destructive"
                  className="ml-auto h-5 w-5 rounded-full p-0 text-xs font-medium flex items-center justify-center"
                >
                  {activeTaskCount}
                </Badge>
              )}
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  );
}
