export const HOME_PATH = "/";

export const DASHBOARD_PATHS = {
  client: HOME_PATH,
  admin: "/admin/dashboard",
  consultant: "/consultant/dashboard",
};

export function getDashboardPath(role) {
  return DASHBOARD_PATHS[role] || HOME_PATH;
}

export function getPostLoginPath(role, redirectTo) {
  if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
    return redirectTo;
  }

  return getDashboardPath(role);
}