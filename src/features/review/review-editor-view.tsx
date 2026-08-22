import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { useDocument } from "../documents/use-document";
import { submitReview, type ReviewAction } from "./submit-review";

export function ReviewEditorView() {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { document, loading, error } = useDocument(documentId ?? "");

  const [fields, setFields] = useState<Record<string, string>>({});
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestedChanges, setRequestedChanges] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (document?.parsed_data !== undefined) {
      setFields(document.parsed_data.fields);
    }
  }, [document]);

  async function handleAction(action: ReviewAction) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await submitReview(documentId ?? "", {
        action,
        edited_fields: action === "approve" ? fields : undefined,
        comment: action === "request_changes" ? comment : null,
      });
      if (action === "request_changes") {
        setRequestedChanges(true);
      } else {
        navigate("/review");
      }
    } catch {
      setSubmitError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <p>Loading…</p>;
  }

  if (error !== null || document === null) {
    return <p role="alert">{error ?? "Document not found"}</p>;
  }

  const fieldEntries = Object.entries(fields);

  return (
    <section>
      <h2>Review {document.id}</h2>
      <p>Status: {document.status}</p>

      <h3>Extracted fields</h3>
      {fieldEntries.length === 0 ? (
        <p>No extracted fields.</p>
      ) : (
        <ul>
          {fieldEntries.map(([key, value]) => (
            <li key={key}>
              <label>
                {key}
                <input
                  value={value}
                  onChange={(event) =>
                    setFields((current) => ({
                      ...current,
                      [key]: event.target.value,
                    }))
                  }
                />
              </label>
            </li>
          ))}
        </ul>
      )}

      <label>
        Comment
        <textarea
          value={comment}
          onChange={(event) => setComment(event.target.value)}
        />
      </label>

      {submitError !== null && <p role="alert">{submitError}</p>}
      {requestedChanges && <p role="status">Changes requested</p>}

      <button
        type="button"
        disabled={submitting}
        onClick={() => handleAction("approve")}
      >
        Approve
      </button>
      <button
        type="button"
        disabled={submitting}
        onClick={() => handleAction("request_changes")}
      >
        Request changes
      </button>
      <button
        type="button"
        disabled={submitting}
        onClick={() => handleAction("reject")}
      >
        Reject
      </button>
    </section>
  );
}
