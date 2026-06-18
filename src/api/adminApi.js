import { apiRequest } from "./apiClient";

export function fetchAdminConsultantRequests() {
  return apiRequest("/admin/consultant-requests");
}

export function fetchAdminConsultantRequest(requestId) {
  return apiRequest(`/admin/consultant-requests/${requestId}`);
}

export function reviewConsultantRequest(requestId, reviewData) {
  return apiRequest(`/admin/consultant-requests/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify(reviewData),
  });
}
