import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { ReviewQueueView } from "./review-queue-view";

type DocumentList = components["schemas"]["DocumentList"];

interface GetResult {
  data?: DocumentList;
  error?: unknown;
  response: Response;
}

type GetMock = Mock<(path: string, init: unknown) => Promise<GetResult>>;

function getMock(): GetMock {
  return apiClient.GET as unknown as GetMock;
}

function renderQueue() {
  return render(
    <MemoryRouter>
      <ReviewQueueView />
    </MemoryRouter>,
  );
}

describe("ReviewQueueView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders documents awaiting review with a link to the editor", async () => {
    getMock().mockResolvedValue({
      data: {
        items: [
          {
            id: "1",
            type: "invoice",
            region: "AR",
            status: "VALIDATION_FAILED",
            media_type: "image/jpeg",
            image_key: "img.jpg",
            created_at: "2026-01-01T00:00:00Z",
            updated_at: "2026-01-01T00:00:00Z",
          },
        ],
        total: 1,
        page: 1,
        pages: 1,
      },
      response: new Response(),
    });

    renderQueue();

    expect(await screen.findByText("1 documents (page 1 of 1)")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/review/1",
    );
  });

  it("shows an error message when loading fails", async () => {
    getMock().mockResolvedValue({
      error: { message: "boom" },
      response: new Response(null, { status: 500 }),
    });

    renderQueue();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load the review queue",
    );
  });
});
