import { apiRequest } from "./apiClient";

export function fetchWalletTransactions() {
  return apiRequest("/wallet-transactions/");
}

export function depositFunds(amount) {
  return apiRequest("/wallet-transactions/deposit", {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}
