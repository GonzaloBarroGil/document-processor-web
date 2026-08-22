import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";

import { mockApi } from "../../test/mock-api";
import { DocumentListView } from "./document-list-view";

describe("DocumentListView (integration)", () => {
  it("fetches and renders documents through the real client", async () => {
    mockApi({
      "/api/v1/documents": () =>
        Response.json({
          items: [
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
          total: 1,
          page: 1,
          pages: 1,
        }),
    });

    render(
      <MemoryRouter>
        <DocumentListView />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText("1 documents (page 1 of 1)"),
    ).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getAllByText("invoice")).toHaveLength(1);
  });
});
