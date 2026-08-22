import { useCallback, useEffect, useState } from "react";

import { listApiKeys, type ApiKeyView } from "./api-keys";

export interface ApiKeysResult {
  keys: ApiKeyView[];
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useApiKeys(): ApiKeysResult {
  const [keys, setKeys] = useState<ApiKeyView[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setKeys(await listApiKeys());
    } catch {
      setError("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { keys, loading, error, reload: load };
}
