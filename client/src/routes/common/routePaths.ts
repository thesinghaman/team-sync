export const isAuthRoute = (pathname: string): boolean => {
  return Object.values(AUTH_ROUTES).includes(pathname);
};

export const AUTH_ROUTES = {
  SIGN_IN: "/sign-in",
  SIGN_UP: "/sign-up",
  VERIFY_EMAIL: "/verify-email",
  VERIFICATION_PENDING: "/verification-pending",
  RESEND_VERIFICATION: "/resend-verification",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
};

export const PROTECTED_ROUTES = {
  WORKSPACE: "/workspace/:workspaceId",
  TASKS: "/workspace/:workspaceId/tasks",
  MY_TASKS: "/workspace/:workspaceId/my-tasks",
  TASK_DETAILS: "/workspace/:workspaceId/project/:projectId/task/:taskId",
  MEMBERS: "/workspace/:workspaceId/members",
  MEMBER_PROFILE: "/workspace/:workspaceId/members/:memberId",
  SETTINGS: "/workspace/:workspaceId/settings",
  PROJECT_DETAILS: "/workspace/:workspaceId/project/:projectId",
  USER_SETTINGS: "/user/settings",
};

export const BASE_ROUTE = {
  LANDING: "/",
  LANDING_EXPLICIT: "/?landing=true",
  INVITE_URL: "/invite/workspace/:inviteCode/join",
  NO_WORKSPACE: "/no-workspace",
};
