import { apiRequest } from "./apiClient";

export function fetchMyConsultantRequests() {
  return apiRequest("/consultant-requests/");
}

export function submitConsultantRequest(requestData) {
  return apiRequest("/consultant-requests/", {
    method: "POST",
    body: JSON.stringify(requestData),
  });
}
