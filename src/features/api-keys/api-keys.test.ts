import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn(), POST: vi.fn() },
}));

import { apiClient } from "../../api/client";
import { createApiKey, listApiKeys, revokeApiKey } from "./api-keys";

interface Result {
  data?: unknown;
  error?: unknown;
  response: Response;
}

type MockFn = Mock<(path: string, init: unknown) => Promise<Result>>;

function getMock(): MockFn {
  return apiClient.GET as unknown as MockFn;
}

function postMock(): MockFn {
  return apiClient.POST as unknown as MockFn;
}

describe("api keys", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("lists API keys", async () => {
    getMock().mockResolvedValue({
      data: {
        items: [
          {
            prefix: "abcd1234",
            label: "billing",
            created_at: "2026-01-01T00:00:00Z",
            revoked: false,
          },
        ],
      },
      response: new Response(),
    });

    const keys = await listApiKeys();

    expect(keys).toHaveLength(1);
    expect(keys[0]?.prefix).toBe("abcd1234");
  });

  it("creates an API key", async () => {
    postMock().mockResolvedValue({
      data: { key: "sk-proj-xyz", prefix: "abcd1234", label: "billing" },
      response: new Response(),
    });

    const created = await createApiKey("billing");

    expect(created.key).toBe("sk-proj-xyz");
    expect(created.prefix).toBe("abcd1234");
  });

  it("revokes an API key", async () => {
    postMock().mockResolvedValue({ response: new Response() });

    await revokeApiKey("abcd1234");

    expect(postMock()).toHaveBeenCalledWith(
      "/api/v1/api-keys/{prefix}/revoke",
      expect.objectContaining({ params: { path: { prefix: "abcd1234" } } }),
    );
  });
});
