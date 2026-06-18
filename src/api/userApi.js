import { apiRequest } from "./apiClient";

export function fetchCurrentUser() {
  return apiRequest("/users/me");
}
