import { useDashboard } from "./use-dashboard";

export function DashboardView() {
  const { summary, loading, error } = useDashboard();

  if (loading) {
    return <p>Loading…</p>;
  }

  if (error !== null || summary === null) {
    return <p role="alert">{error ?? "Failed to load dashboard"}</p>;
  }

  const statusEntries = Object.entries(summary.counts);

  return (
    <section>
      <h2>Dashboard</h2>

      <h3>Documents by status</h3>
      {statusEntries.length === 0 ? (
        <p>No documents yet.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Count</th>
            </tr>
          </thead>
          <tbody>
            {statusEntries.map(([status, count]) => (
              <tr key={status}>
                <td>{status}</td>
                <td>{count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <h3>Recent activity</h3>
      {summary.recent.length === 0 ? (
        <p>No recent activity.</p>
      ) : (
        <ul>
          {summary.recent.map((document) => (
            <li key={document.id}>
              {document.type} · {document.status} ·{" "}
              {new Date(document.created_at).toLocaleDateString()}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
