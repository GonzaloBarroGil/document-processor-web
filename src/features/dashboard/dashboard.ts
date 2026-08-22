import { apiClient, type components } from "../../api/client";

export type DashboardSummary = components["schemas"]["DashboardSummary"];

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const { data, error } = await apiClient.GET("/api/v1/dashboard");

  if (error !== undefined || data === undefined) {
    throw new Error("Failed to load dashboard");
  }

  return data;
}
