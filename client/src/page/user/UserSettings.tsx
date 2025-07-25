import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ProfileSettings } from "@/page/settings/ProfileSettings";
import { AccountSettings } from "@/page/settings/AccountSettings";
import { SecuritySettings } from "@/page/settings/SecuritySettings";
import { DangerZoneSettings } from "@/page/settings/DangerZoneSettings";

export type SettingsSection =
  | "profile"
  | "account"
  | "security"
  | "danger-zone";

export function UserSettings() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("profile");

  useEffect(() => {
    const tab = searchParams.get("tab") as SettingsSection;
    if (
      tab &&
      ["profile", "account", "security", "danger-zone"].includes(tab)
    ) {
      setActiveSection(tab);
    } else {
      setActiveSection("profile");
      navigate("/user/settings?tab=profile", { replace: true });
    }
  }, [searchParams, navigate]);

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSettings />;
      case "account":
        return <AccountSettings />;
      case "security":
        return <SecuritySettings />;
      case "danger-zone":
        return <DangerZoneSettings />;
      default:
        return <ProfileSettings />;
    }
  };

  const getSectionDisplayName = (section: SettingsSection) => {
    switch (section) {
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

  const getSectionDescription = (section: SettingsSection) => {
    switch (section) {
      case "profile":
        return "Manage your profile information and picture";
      case "account":
        return "View and update your account details";
      case "security":
        return "Manage your password and security preferences";
      case "danger-zone":
        return "Permanent actions for your account";
      default:
        return "Manage your profile information and picture";
    }
  };

  return (
    <main className="flex flex-1 flex-col py-4 md:pt-3">
      <div className="w-full max-w-none lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getSectionDisplayName(activeSection)}
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            {getSectionDescription(activeSection)}
          </p>
        </div>

        {/* Content */}
        <div className="flex-1">{renderContent()}</div>
      </div>
    </main>
  );
}
