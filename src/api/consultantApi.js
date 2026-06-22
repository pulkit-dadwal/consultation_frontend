import { apiRequest } from "./apiClient";

export function fetchOnlineConsultants() {
  return apiRequest("/consultants/");
}

export function fetchTopRatedConsultants() {
  return apiRequest("/consultants/top-rated");
}

export function fetchConsultantById(consultantId) {
  return apiRequest(`/consultants/${consultantId}`);
}

export function fetchConsultantReviews(consultantId) {
  return apiRequest(`/consultants/${consultantId}/reviews`);
}