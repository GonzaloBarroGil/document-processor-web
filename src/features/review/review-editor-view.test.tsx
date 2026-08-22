import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn(), PATCH: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { ReviewEditorView } from "./review-editor-view";

type Document = components["schemas"]["Document"];

interface GetResult {
  data?: Document;
  error?: unknown;
  response: Response;
}

interface PatchResult {
  data?: Document;
  error?: unknown;
  response: Response;
}

type GetMock = Mock<(path: string, init: unknown) => Promise<GetResult>>;
type PatchMock = Mock<(path: string, init: unknown) => Promise<PatchResult>>;

function getMock(): GetMock {
  return apiClient.GET as unknown as GetMock;
}

function patchMock(): PatchMock {
  return apiClient.PATCH as unknown as PatchMock;
}

const DOCUMENT: Document = {
  id: "1",
  type: "invoice",
  region: "AR",
  status: "VALIDATION_FAILED",
  media_type: "image/jpeg",
  image_key: "img.jpg",
  parsed_data: {
    raw_text: "total: 100",
    confidence: 0.9,
    fields: { total: "100" },
  },
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

function renderEditor(documentId: string) {
  return render(
    <MemoryRouter initialEntries={[`/review/${documentId}`]}>
      <Routes>
        <Route path="/review" element={<p>back to queue</p>} />
        <Route path="/review/:documentId" element={<ReviewEditorView />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ReviewEditorView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("approves a document with edited fields", async () => {
    getMock().mockResolvedValue({ data: DOCUMENT, response: new Response() });
    patchMock().mockResolvedValue({ response: new Response() });

    renderEditor("1");

    await screen.findByRole("heading", { name: /review 1/i });

    const totalInput = await screen.findByLabelText("total");
    await userEvent.clear(totalInput);
    await userEvent.type(totalInput, "1500");

    await userEvent.click(screen.getByRole("button", { name: /approve/i }));

    await waitFor(() =>
      expect(patchMock()).toHaveBeenCalledWith(
        "/api/v1/documents/{document_id}/review",
        expect.objectContaining({
          params: { path: { document_id: "1" } },
          body: {
            action: "approve",
            edited_fields: { total: "1500" },
            comment: null,
          },
        }),
      ),
    );

    expect(await screen.findByText("back to queue")).toBeInTheDocument();
  });

  it("shows a confirmation when changes are requested", async () => {
    getMock().mockResolvedValue({ data: DOCUMENT, response: new Response() });
    patchMock().mockResolvedValue({ response: new Response() });

    renderEditor("1");

    await screen.findByRole("heading", { name: /review 1/i });

    await userEvent.click(
      screen.getByRole("button", { name: /request changes/i }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(
      "Changes requested",
    );
  });

  it("shows an error when submitting fails", async () => {
    getMock().mockResolvedValue({ data: DOCUMENT, response: new Response() });
    patchMock().mockResolvedValue({
      error: { message: "boom" },
      response: new Response(null, { status: 500 }),
    });

    renderEditor("1");

    await screen.findByRole("heading", { name: /review 1/i });

    await userEvent.click(screen.getByRole("button", { name: /reject/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Failed to submit review",
    );
  });
});
