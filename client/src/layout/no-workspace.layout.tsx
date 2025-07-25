import { Outlet } from "react-router-dom";
import { AuthProvider } from "@/context/auth-provider";
import CreateWorkspaceDialog from "@/components/workspace/create-workspace-dialog";
import ErrorBoundary from "@/components/error-boundary";

const StandaloneLayout = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <div className="w-full">
          <Outlet />
          <CreateWorkspaceDialog />
        </div>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default StandaloneLayout;
