import { Link, useSearchParams } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  User,
  Shield,
  AlertTriangle,
  Settings,
  LayoutDashboard,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import useWorkspaceId from "@/hooks/use-workspace-id";

export function NavSettings() {
  const [searchParams] = useSearchParams();
  const workspaceId = useWorkspaceId();

  const currentTab = searchParams.get("tab") || "profile";

  const settingsItems = [
    {
      title: "Profile",
      url: "/user/settings?tab=profile",
      icon: User,
      isActive: currentTab === "profile",
    },
    {
      title: "Account",
      url: "/user/settings?tab=account",
      icon: Settings,
      isActive: currentTab === "account",
    },
    {
      title: "Security",
      url: "/user/settings?tab=security",
      icon: Shield,
      isActive: currentTab === "security",
    },
    {
      title: "Danger Zone",
      url: "/user/settings?tab=danger-zone",
      icon: AlertTriangle,
      isActive: currentTab === "danger-zone",
    },
  ];

  return (
    <>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {settingsItems.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild isActive={item.isActive}>
                  <Link to={item.url}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <Separator />

      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to={workspaceId ? `/workspace/${workspaceId}` : "/"}>
                  <LayoutDashboard />
                  <span>Go to Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  );
}
