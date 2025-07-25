import SignIn from "@/page/auth/Sign-in";
import SignUp from "@/page/auth/Sign-up";
import EmailVerification from "@/page/auth/EmailVerification";
import VerificationPending from "@/page/auth/VerificationPending";
import ResendVerificationEmail from "@/page/auth/ResendVerificationEmail";
import ForgotPassword from "@/page/auth/ForgotPassword";
import ResetPassword from "@/page/auth/ResetPassword";
import HomeRoute from "@/routes/home.route";
import WorkspaceDashboard from "@/page/workspace/Dashboard";
import Members from "@/page/workspace/Members";
import MemberProfile from "@/page/workspace/MemberProfile";
import ProjectDetails from "@/page/workspace/ProjectDetails";
import Settings from "@/page/workspace/Settings";
import Tasks from "@/page/workspace/Tasks";
import MyTasks from "@/page/workspace/MyTasks";
import TaskDetailsImproved from "@/page/workspace/TaskDetailsImproved";
import { UserSettings } from "@/page/user/UserSettings";
import NoWorkspaceState from "@/components/workspace/no-workspace-state";
import { AUTH_ROUTES, BASE_ROUTE, PROTECTED_ROUTES } from "./routePaths";
import InviteUser from "@/page/invite/InviteUser";

export const authenticationRoutePaths = [
  { path: AUTH_ROUTES.SIGN_IN, element: <SignIn /> },
  { path: AUTH_ROUTES.SIGN_UP, element: <SignUp /> },
  { path: AUTH_ROUTES.VERIFY_EMAIL, element: <EmailVerification /> },
  { path: AUTH_ROUTES.VERIFICATION_PENDING, element: <VerificationPending /> },
  {
    path: AUTH_ROUTES.RESEND_VERIFICATION,
    element: <ResendVerificationEmail />,
  },
  { path: AUTH_ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
  { path: AUTH_ROUTES.RESET_PASSWORD, element: <ResetPassword /> },
];

export const protectedRoutePaths = [
  { path: PROTECTED_ROUTES.WORKSPACE, element: <WorkspaceDashboard /> },
  { path: PROTECTED_ROUTES.TASKS, element: <Tasks /> },
  { path: PROTECTED_ROUTES.MY_TASKS, element: <MyTasks /> },
  { path: PROTECTED_ROUTES.TASK_DETAILS, element: <TaskDetailsImproved /> },
  { path: PROTECTED_ROUTES.MEMBERS, element: <Members /> },
  { path: PROTECTED_ROUTES.MEMBER_PROFILE, element: <MemberProfile /> },
  { path: PROTECTED_ROUTES.SETTINGS, element: <Settings /> },
  { path: PROTECTED_ROUTES.USER_SETTINGS, element: <UserSettings /> },
  { path: PROTECTED_ROUTES.PROJECT_DETAILS, element: <ProjectDetails /> },
];

// Standalone protected routes (without main app sidebar)
export const standaloneProtectedRoutePaths = [
  { path: BASE_ROUTE.NO_WORKSPACE, element: <NoWorkspaceState /> },
];

export const baseRoutePaths = [
  { path: BASE_ROUTE.LANDING, element: <HomeRoute /> },
  { path: BASE_ROUTE.INVITE_URL, element: <InviteUser /> },
];
