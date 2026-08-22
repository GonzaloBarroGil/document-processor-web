import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn() },
}));

import { apiClient, type components } from "../../api/client";
import { exportDocumentCsv, exportDocumentJson } from "./export-document";

type DocumentExport = components["schemas"]["DocumentExport"];

interface GetResult {
  data?: unknown;
  error?: unknown;
  response: Response;
}

type GetMock = Mock<(path: string, init: unknown) => Promise<GetResult>>;

function getMock(): GetMock {
  return apiClient.GET as unknown as GetMock;
}

describe("exportDocument", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("exports a document as JSON", async () => {
    const exportData: DocumentExport = {
      document_id: "1",
      type: "invoice",
      region: "AR",
      status: "COMPLETED",
      parsed_data: { raw_text: "total: 100", confidence: 0.9, fields: { total: "100" } },
    };
    getMock().mockResolvedValue({ data: exportData, response: new Response() });

    const result = await exportDocumentJson("1");

    expect(result.document_id).toBe("1");
  });

  it("exports a document as CSV", async () => {
    getMock().mockResolvedValue({
      data: "field,value\ntotal,100\n",
      response: new Response(),
    });

    const result = await exportDocumentCsv("1");

    expect(result).toContain("total,100");
  });

  it("throws when the JSON export fails", async () => {
    getMock().mockResolvedValue({
      error: { message: "boom" },
      response: new Response(null, { status: 500 }),
    });

    await expect(exportDocumentJson("1")).rejects.toThrow(
      "Failed to export document",
    );
  });
});
