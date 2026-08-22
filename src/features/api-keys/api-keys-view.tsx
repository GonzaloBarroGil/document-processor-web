import { useState, type FormEvent } from "react";

import {
  createApiKey,
  revokeApiKey,
  type ApiKeyCreateResponse,
} from "./api-keys";
import { useApiKeys } from "./use-api-keys";

export function ApiKeysView() {
  const { keys, loading, error, reload } = useApiKeys();
  const [label, setLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState<ApiKeyCreateResponse | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCreating(true);
    setActionError(null);
    setCreated(null);
    try {
      const trimmed = label.trim();
      const response = await createApiKey(trimmed === "" ? null : trimmed);
      setCreated(response);
      setLabel("");
      await reload();
    } catch {
      setActionError("Failed to create API key");
    } finally {
      setCreating(false);
    }
  }

  async function handleRevoke(prefix: string) {
    setActionError(null);
    try {
      await revokeApiKey(prefix);
      await reload();
    } catch {
      setActionError("Failed to revoke API key");
    }
  }

  return (
    <section>
      <h2>API Keys</h2>

      <form onSubmit={handleCreate}>
        <label>
          Label
          <input
            value={label}
            onChange={(event) => setLabel(event.target.value)}
          />
        </label>
        <button type="submit" disabled={creating}>
          Create key
        </button>
      </form>

      {created !== null && (
        <p role="status">
          Key created (copy it now, it will not be shown again): {created.key}
        </p>
      )}

      {actionError !== null && <p role="alert">{actionError}</p>}
      {loading && <p>Loading…</p>}
      {error !== null && <p role="alert">{error}</p>}

      {!loading && error === null && (
        <table>
          <thead>
            <tr>
              <th>Prefix</th>
              <th>Label</th>
              <th>Created</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {keys.map((key) => (
              <tr key={key.prefix}>
                <td>{key.prefix}</td>
                <td>{key.label ?? ""}</td>
                <td>{new Date(key.created_at).toLocaleDateString()}</td>
                <td>{key.revoked ? "Revoked" : "Active"}</td>
                <td>
                  <button
                    type="button"
                    disabled={key.revoked}
                    onClick={() => handleRevoke(key.prefix)}
                  >
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
