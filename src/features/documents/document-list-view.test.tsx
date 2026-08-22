import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { DocumentListView } from "./document-list-view";

type DocumentList = components["schemas"]["DocumentList"];
type DocumentStatus = components["schemas"]["DocumentStatus"];

interface GetResult {
  data?: DocumentList;
  error?: unknown;
  response: Response;
}

type GetMock = Mock<(path: string, init: unknown) => Promise<GetResult>>;

function getMock(): GetMock {
  return apiClient.GET as unknown as GetMock;
}

function renderList() {
  return render(
    <MemoryRouter>
      <DocumentListView />
    </MemoryRouter>,
  );
}

function makeDocument(
  id: string,
  status: DocumentStatus = "COMPLETED",
): components["schemas"]["Document"] {
  return {
    id,
    type: "invoice",
    region: "AR",
    status,
    media_type: "image/jpeg",
    image_key: `img-${id}.jpg`,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

describe("DocumentListView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the list of documents", async () => {
    getMock().mockResolvedValue({
      data: { items: [makeDocument("1"), makeDocument("2")], total: 2, page: 1, pages: 1 },
      response: new Response(),
    });

    renderList();

    expect(
      await screen.findByText("2 documents (page 1 of 1)"),
    ).toBeInTheDocument();
    const table = screen.getByRole("table");
    expect(within(table).getAllByText("invoice")).toHaveLength(2);
  });

  it("shows an error message when loading fails", async () => {
    getMock().mockResolvedValue({
      error: { message: "boom" },
      response: new Response(null, { status: 500 }),
    });

    renderList();

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load documents",
    );
  });

  it("moves to the next page", async () => {
    getMock().mockResolvedValue({
      data: { items: [makeDocument("1")], total: 25, page: 1, pages: 2 },
      response: new Response(),
    });

    renderList();

    await screen.findByText("25 documents (page 1 of 2)");

    getMock().mockResolvedValue({
      data: { items: [makeDocument("2")], total: 25, page: 2, pages: 2 },
      response: new Response(),
    });

    await userEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(
      await screen.findByText("25 documents (page 2 of 2)"),
    ).toBeInTheDocument();
  });
});
