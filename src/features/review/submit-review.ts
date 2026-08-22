import { apiClient, type components } from "../../api/client";

export type ReviewAction = components["schemas"]["ReviewRequest"]["action"];

export async function submitReview(
  documentId: string,
  body: components["schemas"]["ReviewRequest"],
): Promise<void> {
  const { error } = await apiClient.PATCH(
    "/api/v1/documents/{document_id}/review",
    { params: { path: { document_id: documentId } }, body },
  );

  if (error !== undefined) {
    throw new Error("Failed to submit review");
  }
}
