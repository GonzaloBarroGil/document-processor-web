import { apiClient, type components } from "../../api/client";

export type DocumentExport = components["schemas"]["DocumentExport"];

export async function exportDocumentJson(
  documentId: string,
): Promise<DocumentExport> {
  const { data, error } = await apiClient.GET(
    "/api/v1/documents/{document_id}/export",
    { params: { path: { document_id: documentId } } },
  );

  if (error !== undefined || data === undefined) {
    throw new Error("Failed to export document");
  }

  return data;
}

export async function exportDocumentCsv(documentId: string): Promise<string> {
  const { data, error } = await apiClient.GET(
    "/api/v1/documents/{document_id}/export",
    {
      params: { path: { document_id: documentId } },
      headers: { Accept: "text/csv" },
      parseAs: "text",
    },
  );

  if (error !== undefined || data === undefined) {
    throw new Error("Failed to export document");
  }

  return data;
}

export function downloadText(
  filename: string,
  content: string,
  mimeType: string,
): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
