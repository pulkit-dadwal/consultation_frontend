import { apiRequest } from "./apiClient";

export function fetchConsultations() {
  return apiRequest("/consultations/");
}
