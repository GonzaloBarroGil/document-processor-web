import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { DashboardView } from "./dashboard-view";

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

describe("DashboardView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders counts by status and recent activity", async () => {
    getMock().mockResolvedValue({
      data: {
        counts: { COMPLETED: 3, PENDING: 1 },
        recent: [
          {
            id: "1",
            type: "invoice",
            region: "AR",
            status: "COMPLETED",
            media_type: "image/jpeg",
            image_key: "img.jpg",
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
      },
      response: new Response(),
    });

    render(<DashboardView />);

    expect(await screen.findByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText(/invoice · COMPLETED/)).toBeInTheDocument();
  });

  it("shows an error when loading fails", async () => {
    getMock().mockResolvedValue({
      error: { message: "boom" },
      response: new Response(null, { status: 500 }),
    });

    render(<DashboardView />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load dashboard",
    );
  });
});
