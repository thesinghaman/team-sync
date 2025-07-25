export const goToLandingPage = () => {
  window.location.href = "/?landing=true";
};

export const goToWorkspace = (workspaceId: string) => {
  window.location.href = `/workspace/${workspaceId}`;
};
