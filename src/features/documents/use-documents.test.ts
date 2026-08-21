import { renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { useDocuments } from "./use-documents";

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

const DOCUMENT: components["schemas"]["Document"] = {
  id: "1",
  type: "invoice",
  region: "AR",
  status: "COMPLETED",
  media_type: "image/jpeg",
  image_key: "img.jpg",
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

describe("useDocuments", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads documents", async () => {
    getMock().mockResolvedValue({
      data: { items: [DOCUMENT], total: 1, page: 1, pages: 1 },
      response: new Response(),
    });

    const { result } = renderHook(() => useDocuments({ page: 1, size: 20 }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.documents).toHaveLength(1);
    expect(result.current.total).toBe(1);
    expect(result.current.error).toBeNull();
  });

  it("sets an error when the request fails", async () => {
    getMock().mockResolvedValue({
      error: { message: "boom" },
      response: new Response(null, { status: 500 }),
    });

    const { result } = renderHook(() => useDocuments({ page: 1, size: 20 }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe("Failed to load documents");
    expect(result.current.documents).toHaveLength(0);
  });
});
