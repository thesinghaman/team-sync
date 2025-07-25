import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/auth-provider";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";

const StandaloneLayout = () => {
  return (
    <AuthProvider>
      <div className="flex flex-col w-full h-auto">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full mx-auto h-auto">
            <Outlet />
          </div>
        </div>
        <CreateWorkspaceDialog />
      </div>
    </AuthProvider>
  );
};

export default StandaloneLayout;
