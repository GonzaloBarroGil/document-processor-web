import { useParams } from "react-router-dom";

import { useDocument } from "./use-document";

export function DocumentDetailView() {
  const { documentId } = useParams<{ documentId: string }>();
  const { document, loading, error } = useDocument(documentId ?? "");

  if (loading) {
    return <p>Loading…</p>;
  }

  if (error !== null || document === null) {
    return <p role="alert">{error ?? "Document not found"}</p>;
  }

  const fields = Object.entries(document.parsed_data?.fields ?? {});

  return (
    <section>
      <h2>Document {document.id}</h2>

      <dl>
        <dt>Type</dt>
        <dd>{document.type}</dd>
        <dt>Region</dt>
        <dd>{document.region}</dd>
        <dt>Status</dt>
        <dd>{document.status}</dd>
        <dt>Created</dt>
        <dd>{new Date(document.created_at).toLocaleString()}</dd>
      </dl>

      {document.error_detail && <p role="alert">{document.error_detail}</p>}

      <section>
        <h3>Extracted data</h3>
        {document.parsed_data === undefined ? (
          <p>No extracted data yet.</p>
        ) : (
          <>
            <p>Confidence: {document.parsed_data.confidence.toFixed(2)}</p>
            <p>{document.parsed_data.raw_text}</p>
            {fields.length > 0 && (
              <table>
                <thead>
                  <tr>
                    <th>Field</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map(([key, value]) => (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </section>

      <section>
        <h3>Validation</h3>
        {document.validation_result === undefined ? (
          <p>Not validated yet.</p>
        ) : (
          <>
            <p>
              {document.validation_result.passed ? "Passed" : "Failed"} ({document.validation_result.region})
            </p>
            {document.validation_result.errors.length > 0 && (
              <ul>
                {document.validation_result.errors.map((validationError) => (
                  <li key={`${validationError.field}-${validationError.rule}`}>
                    {validationError.field}: {validationError.message}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
    </section>
  );
}
