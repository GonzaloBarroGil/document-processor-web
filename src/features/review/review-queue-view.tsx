import { useState } from "react";
import { Link } from "react-router-dom";

import { useReviewQueue } from "./use-review-queue";

export function ReviewQueueView() {
  const [page, setPage] = useState(1);
  const { documents, total, pages, loading, error } = useReviewQueue(page);

  return (
    <section>
      <h2>Review queue</h2>

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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.id}>
                  <td>{document.type}</td>
                  <td>{document.region}</td>
                  <td>{document.status}</td>
                  <td>
                    <Link to={`/review/${document.id}`}>Review</Link>
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
