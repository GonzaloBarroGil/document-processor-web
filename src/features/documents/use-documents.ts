import { useCallback, useEffect, useState } from "react";

import { apiClient, type components } from "../../api/client";

export type DocumentItem = components["schemas"]["Document"];
export type DocumentStatus = components["schemas"]["DocumentStatus"];
export type DocumentType = components["schemas"]["DocumentType"];

export interface DocumentFilters {
  status?: DocumentStatus;
  type?: DocumentType;
  region?: string;
  page: number;
  size: number;
}

export interface DocumentsResult {
  documents: DocumentItem[];
  total: number;
  pages: number;
  loading: boolean;
  error: string | null;
}

export function useDocuments(filters: DocumentFilters): DocumentsResult {
  const { status, type, region, page, size } = filters;
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: requestError } = await apiClient.GET(
      "/api/v1/documents",
      { params: { query: { status, type, region, page, size } } },
    );

    if (requestError !== undefined || data === undefined) {
      setDocuments([]);
      setTotal(0);
      setPages(1);
      setError("Failed to load documents");
    } else {
      setDocuments(data.items);
      setTotal(data.total);
      setPages(data.pages);
    }
    setLoading(false);
  }, [status, type, region, page, size]);

  useEffect(() => {
    void load();
  }, [load]);

  return { documents, total, pages, loading, error };
}
