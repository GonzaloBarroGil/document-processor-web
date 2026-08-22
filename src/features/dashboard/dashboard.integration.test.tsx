import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { mockApi } from "../../test/mock-api";
import { DashboardView } from "./dashboard-view";

describe("DashboardView (integration)", () => {
  it("fetches and renders the summary through the real client", async () => {
    mockApi({
      "/api/v1/dashboard": () =>
        Response.json({
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
        }),
    });

    render(<DashboardView />);

    expect(await screen.findByText("COMPLETED")).toBeInTheDocument();
    expect(screen.getByText("PENDING")).toBeInTheDocument();
    expect(screen.getByText(/invoice · COMPLETED/)).toBeInTheDocument();
  });
});
