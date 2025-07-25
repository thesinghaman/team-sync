import { cn } from "@/lib/utils";
import { User, Mail, Shield, Trash2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export type SettingsSection =
  | "profile"
  | "account"
  | "security"
  | "danger-zone";

const settingsNavItems = [
  {
    title: "Profile",
    key: "profile" as SettingsSection,
    icon: User,
    description: "Manage your profile information and picture",
  },
  {
    title: "Account",
    key: "account" as SettingsSection,
    icon: Mail,
    description: "Email and password settings",
  },
  {
    title: "Security",
    key: "security" as SettingsSection,
    icon: Shield,
    description: "Password and security settings",
  },
  {
    title: "Danger Zone",
    key: "danger-zone" as SettingsSection,
    icon: Trash2,
    description: "Delete account and data",
  },
];

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
  onBackClick: () => void;
}

export function SettingsSidebar({
  activeSection,
  onSectionChange,
  onBackClick,
}: SettingsSidebarProps) {
  return (
    <div className="w-64 h-full bg-background border-r">
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBackClick}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold">Account Settings</h2>
          <p className="text-sm text-muted-foreground">
            Manage your account preferences
          </p>
        </div>

        <nav className="space-y-2">
          {settingsNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                onClick={() => onSectionChange(item.key)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors text-left",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                <div className="flex flex-col">
                  <span className="font-medium">{item.title}</span>
                  <span className="text-xs opacity-80">{item.description}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
