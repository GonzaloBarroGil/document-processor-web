import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { getDashboardSummary } from "./dashboard";

type DashboardSummary = components["schemas"]["DashboardSummary"];

interface GetResult {
  data?: DashboardSummary;
  error?: unknown;
  response: Response;
}

type GetMock = Mock<(path: string, init: unknown) => Promise<GetResult>>;

function getMock(): GetMock {
  return apiClient.GET as unknown as GetMock;
}

describe("getDashboardSummary", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the dashboard summary", async () => {
    getMock().mockResolvedValue({
      data: { counts: { COMPLETED: 3 }, recent: [] },
      response: new Response(),
    });

    const summary = await getDashboardSummary();

    expect(summary.counts).toEqual({ COMPLETED: 3 });
    expect(summary.recent).toEqual([]);
  });

  it("throws when the request fails", async () => {
    getMock().mockResolvedValue({
      error: { message: "boom" },
      response: new Response(null, { status: 500 }),
    });

    await expect(getDashboardSummary()).rejects.toThrow(
      "Failed to load dashboard",
    );
  });
});
