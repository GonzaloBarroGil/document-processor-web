import { useCallback, useEffect, useState } from "react";

import { apiClient } from "../../api/client";
import type { DocumentItem } from "../documents/use-documents";

export interface ReviewQueueResult {
  documents: DocumentItem[];
  total: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

export function useReviewQueue(page: number, size = 20): ReviewQueueResult {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: requestError } = await apiClient.GET(
      "/api/v1/review/queue",
      { params: { query: { page, size } } },
    );

    if (requestError !== undefined || data === undefined) {
      setDocuments([]);
      setTotal(0);
      setPages(1);
      setError("Failed to load the review queue");
    } else {
      setDocuments(data.items);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  return { documents, total, pages, loading, error };
}
