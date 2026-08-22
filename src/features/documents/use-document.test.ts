import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { useDocument } from "./use-document";

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

const DOCUMENT: Document = {
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
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("useDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads a document", async () => {
    getMock().mockResolvedValue({
      data: DOCUMENT,
      response: new Response(),
    });

    const { result } = renderHook(() => useDocument("1"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.document?.id).toBe("1");
    expect(result.current.error).toBeNull();
  });

  it("sets an error when the request fails", async () => {
    getMock().mockResolvedValue({
      error: { message: "not found" },
      response: new Response(null, { status: 404 }),
    });

    const { result } = renderHook(() => useDocument("missing"));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load document");
    expect(result.current.document).toBeNull();
  });
});
