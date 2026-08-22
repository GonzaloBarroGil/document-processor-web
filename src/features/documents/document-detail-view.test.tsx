import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { DocumentDetailView } from "./document-detail-view";

type Document = components["schemas"]["Document"];

interface GetResult {
  data?: Document;
  error?: unknown;
  response: Response;
}

type GetMock = Mock<(path: string, init: unknown) => Promise<GetResult>>;

function getMock(): GetMock {
  return apiClient.GET as unknown as GetMock;
}

function renderDetail(documentId: string) {
  return render(
    <MemoryRouter initialEntries={[`/documents/${documentId}`]}>
      <Routes>
        <Route path="/documents/:documentId" element={<DocumentDetailView />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("DocumentDetailView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders metadata and parsed fields", async () => {
    getMock().mockResolvedValue({
      data: {
        id: "1",
        type: "invoice",
        region: "AR",
        status: "COMPLETED",
        media_type: "image/jpeg",
        image_key: "img.jpg",
        parsed_data: {
          raw_text: "total: 100",
          confidence: 0.95,
          fields: { total: "100" },
        },
        validation_result: {
          passed: true,
          errors: [],
          region: "AR",
          validated_at: "2026-01-01T00:00:00Z",
        },
        created_at: "2026-01-01T00:00:00Z",
        updated_at: "2026-01-01T00:00:00Z",
      },
      response: new Response(),
    });

    renderDetail("1");

    expect(
      await screen.findByRole("heading", { name: /document 1/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("invoice")).toBeInTheDocument();
    expect(screen.getByText("total")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("shows an error when the document is not found", async () => {
    getMock().mockResolvedValue({
      error: { message: "not found" },
      response: new Response(null, { status: 404 }),
    });

    renderDetail("missing");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to load document",
    );
  });
});
