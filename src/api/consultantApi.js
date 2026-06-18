import { apiRequest } from "./apiClient";

export function fetchOnlineConsultants() {
  return apiRequest("/consultants/");
}

export function fetchTopRatedConsultants() {
  return apiRequest("/consultants/top-rated");
}
