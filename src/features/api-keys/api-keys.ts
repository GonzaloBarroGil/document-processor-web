import { apiClient, type components } from "../../api/client";

export type ApiKeyView = components["schemas"]["ApiKeyView"];
export type ApiKeyCreateResponse = components["schemas"]["ApiKeyCreateResponse"];

export async function listApiKeys(): Promise<ApiKeyView[]> {
  const { data, error } = await apiClient.GET("/api/v1/api-keys");

  if (error !== undefined || data === undefined) {
    throw new Error("Failed to load API keys");
  }

  return data.items;
}

export async function createApiKey(
  label: string | null,
): Promise<ApiKeyCreateResponse> {
  const { data, error } = await apiClient.POST("/api/v1/api-keys", {
    body: { label },
  });

  if (error !== undefined || data === undefined) {
    throw new Error("Failed to create API key");
  }

  return data;
}

export async function revokeApiKey(prefix: string): Promise<void> {
  const { error } = await apiClient.POST("/api/v1/api-keys/{prefix}/revoke", {
    params: { path: { prefix } },
  });

  if (error !== undefined) {
    throw new Error("Failed to revoke API key");
  }
}
