import { useState } from "react";
import { Link } from "react-router-dom";

import { useDocuments, type DocumentStatus, type DocumentType } from "./use-documents";

const STATUSES: DocumentStatus[] = [
  "PENDING",
  "OCR_IN_PROGRESS",
  "VALIDATING",
  "COMPLETED",
  "VALIDATION_FAILED",
  "OCR_FAILED",
  "IMAGE_EXPIRED",
];

const TYPES: DocumentType[] = ["invoice", "ticket", "payment_receipt"];

export function DocumentListView() {
  const [status, setStatus] = useState<DocumentStatus | "">("");
  const [type, setType] = useState<DocumentType | "">("");
  const [region, setRegion] = useState("");
  const [page, setPage] = useState(1);
  const size = 20;

  const { documents, total, pages, loading, error } = useDocuments({
    status: status === "" ? undefined : status,
    type: type === "" ? undefined : type,
    region: region === "" ? undefined : region,
    page,
    size,
  });

  return (
    <section>
      <h2>Documents</h2>

      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(1);
        }}
      >
        <label>
          Status
          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as DocumentStatus | "");
              setPage(1);
            }}
          >
            <option value="">All</option>
            {STATUSES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Type
          <select
            value={type}
            onChange={(event) => {
              setType(event.target.value as DocumentType | "");
              setPage(1);
            }}
          >
            <option value="">All</option>
            {TYPES.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </label>
        <label>
          Region
          <input
            value={region}
            onChange={(event) => {
              setRegion(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <button type="submit">Apply filters</button>
      </form>

      {loading && <p>Loading…</p>}
      {error !== null && <p role="alert">{error}</p>}

      {!loading && error === null && (
        <>
          <table>
            <thead>
              <tr>
                <th>Type</th>
                <th>Region</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>{document.type}</td>
                  <td>{document.region}</td>
                  <td>{document.status}</td>
                  <td>{new Date(document.created_at).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/documents/${document.id}`}>View</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p aria-live="polite">
            {total} documents (page {page} of {pages})
          </p>
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
          >
            Previous
          </button>
          <button
            type="button"
            disabled={page >= pages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </>
      )}
    </section>
  );
}
