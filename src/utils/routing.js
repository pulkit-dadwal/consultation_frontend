export const DASHBOARD_PATHS = {
  client: "/dashboard",
  admin: "/admin/dashboard",
  consultant: "/consultant/dashboard",
};

export function getDashboardPath(role) {
  return DASHBOARD_PATHS[role] || "/dashboard";
}
