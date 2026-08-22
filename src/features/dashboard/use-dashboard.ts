import { useEffect, useState } from "react";

import { getDashboardSummary, type DashboardSummary } from "./dashboard";

export interface DashboardResult {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}

export function useDashboard(): DashboardResult {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getDashboardSummary()
      .then((data) => {
        if (!cancelled) {
          setSummary(data);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError("Failed to load dashboard");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { summary, loading, error };
}
