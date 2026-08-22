import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { mockApi } from "../../test/mock-api";
import { ReviewQueueView } from "./review-queue-view";

describe("ReviewQueueView (integration)", () => {
  it("fetches and renders the review queue through the real client", async () => {
    mockApi({
      "/api/v1/review/queue": () =>
        Response.json({
          items: [
            {
              id: "2",
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
        }),
    });

    render(
      <MemoryRouter>
        <ReviewQueueView />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("1 documents (page 1 of 1)"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review" })).toHaveAttribute(
      "href",
      "/review/2",
    );
  });
});
