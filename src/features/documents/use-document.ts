import { useCallback, useEffect, useState } from "react";

import { apiClient } from "../../api/client";
import type { DocumentItem } from "./use-documents";

export interface DocumentResult {
  document: DocumentItem | null;
  loading: boolean;
  error: string | null;
}

export function useDocument(documentId: string): DocumentResult {
  const [document, setDocument] = useState<DocumentItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: requestError } = await apiClient.GET(
      "/api/v1/documents/{document_id}",
      { params: { path: { document_id: documentId } } },
    );

    if (requestError !== undefined || data === undefined) {
      setDocument(null);
      setError("Failed to load document");
    } else {
      setDocument(data);
    }
    setLoading(false);
  }, [documentId]);

  useEffect(() => {
    void load();
  }, [load]);

  return { document, loading, error };
}
