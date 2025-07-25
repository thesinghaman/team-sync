import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { updateWorkspaceSettings } from "@/lib/api";
import useWorkspaceId from "@/hooks/use-workspace-id";

interface TaskAssignmentSettingsProps {
  initialSettings?: {
    membersCanAssignToOwners: boolean;
    membersCanAssignToAdmins: boolean;
    adminsCanAssignToOwners: boolean;
  };
}

const TaskAssignmentSettings = ({
  initialSettings,
}: TaskAssignmentSettingsProps) => {
  const workspaceId = useWorkspaceId();
  const queryClient = useQueryClient();

  const [settings, setSettings] = useState({
    membersCanAssignToOwners:
      initialSettings?.membersCanAssignToOwners ?? false,
    membersCanAssignToAdmins:
      initialSettings?.membersCanAssignToAdmins ?? false,
    adminsCanAssignToOwners: initialSettings?.adminsCanAssignToOwners ?? false,
  });

  const [hasChanges, setHasChanges] = useState(false);

  // Sync settings when initialSettings changes (when workspace data loads)
  useEffect(() => {
    if (initialSettings) {
      setSettings({
        membersCanAssignToOwners: initialSettings.membersCanAssignToOwners,
        membersCanAssignToAdmins: initialSettings.membersCanAssignToAdmins,
        adminsCanAssignToOwners: initialSettings.adminsCanAssignToOwners,
      });
    }
  }, [initialSettings]);

  const updateSettingsMutation = useMutation({
    mutationFn: updateWorkspaceSettings,
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Task assignment settings have been updated successfully.",
      });
      setHasChanges(false);
      queryClient.invalidateQueries({ queryKey: ["workspace", workspaceId] });
    },
    onError: (error: unknown) => {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to update settings";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    if (!workspaceId) return;

    updateSettingsMutation.mutate({
      workspaceId,
      settings: {
        taskAssignmentRules: settings,
      },
    });
  };

  const handleReset = () => {
    setSettings({
      membersCanAssignToOwners:
        initialSettings?.membersCanAssignToOwners ?? false,
      membersCanAssignToAdmins:
        initialSettings?.membersCanAssignToAdmins ?? false,
      adminsCanAssignToOwners:
        initialSettings?.adminsCanAssignToOwners ?? false,
    });
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Assignment Rules</CardTitle>
        <CardDescription>
          Configure who can assign tasks to different roles in your workspace.
          By default, members cannot assign tasks to owners or admins, and
          admins cannot assign tasks to owners.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="members-to-owners">
                Members can assign tasks to Owners
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow members to assign tasks to workspace owners
              </p>
            </div>
            <Checkbox
              id="members-to-owners"
              checked={settings.membersCanAssignToOwners}
              onCheckedChange={(value: boolean) =>
                handleSettingChange("membersCanAssignToOwners", value)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="members-to-admins">
                Members can assign tasks to Admins
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow members to assign tasks to workspace admins
              </p>
            </div>
            <Checkbox
              id="members-to-admins"
              checked={settings.membersCanAssignToAdmins}
              onCheckedChange={(value: boolean) =>
                handleSettingChange("membersCanAssignToAdmins", value)
              }
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="admins-to-owners">
                Admins can assign tasks to Owners
              </Label>
              <p className="text-sm text-muted-foreground">
                Allow admins to assign tasks to workspace owners
              </p>
            </div>
            <Checkbox
              id="admins-to-owners"
              checked={settings.adminsCanAssignToOwners}
              onCheckedChange={(value: boolean) =>
                handleSettingChange("adminsCanAssignToOwners", value)
              }
            />
          </div>
        </div>

        {hasChanges && (
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={updateSettingsMutation.isPending}
            >
              {updateSettingsMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Reset
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaskAssignmentSettings;
