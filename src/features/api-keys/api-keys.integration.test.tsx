import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { mockApi } from "../../test/mock-api";
import { ApiKeysView } from "./api-keys-view";

describe("ApiKeysView (integration)", () => {
  it("fetches and renders API keys through the real client", async () => {
    mockApi({
      "/api/v1/api-keys": () =>
        Response.json({
          items: [
            {
              prefix: "abcd1234",
              label: "billing",
              created_at: "2026-01-01T00:00:00Z",
              revoked: false,
            },
          ],
        }),
    });

    render(<ApiKeysView />);

    expect(await screen.findByText("abcd1234")).toBeInTheDocument();
    expect(screen.getByText("billing")).toBeInTheDocument();
  });

  it("creates a key and shows its one-time raw value", async () => {
    mockApi({
      "/api/v1/api-keys": ({ method }) =>
        method === "POST"
          ? Response.json(
              { key: "sk-proj-xyz", prefix: "newprefix", label: "billing" },
              { status: 201 },
            )
          : Response.json({ items: [] }),
    });

    render(<ApiKeysView />);
    await screen.findByRole("button", { name: /create key/i });

    await userEvent.type(screen.getByLabelText("Label"), "billing");
    await userEvent.click(screen.getByRole("button", { name: /create key/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("sk-proj-xyz");
  });
});
