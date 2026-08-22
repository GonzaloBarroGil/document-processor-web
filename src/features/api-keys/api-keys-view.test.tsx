import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";

vi.mock("../../api/client", () => ({
  apiClient: { GET: vi.fn(), POST: vi.fn() },
}));

import { apiClient } from "../../api/client";
import { ApiKeysView } from "./api-keys-view";

interface Result {
  data?: unknown;
  error?: unknown;
  response: Response;
}

type MockFn = Mock<(path: string, init: unknown) => Promise<Result>>;

function getMock(): MockFn {
  return apiClient.GET as unknown as MockFn;
}

function postMock(): MockFn {
  return apiClient.POST as unknown as MockFn;
}

describe("ApiKeysView", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getMock().mockResolvedValue({
      data: {
        items: [
          {
            prefix: "abcd1234",
            label: "billing",
            created_at: "2026-01-01T00:00:00Z",
            revoked: false,
          },
        ],
      },
      response: new Response(),
    });
  });

  it("renders the list of API keys", async () => {
    render(<ApiKeysView />);

    expect(await screen.findByText("abcd1234")).toBeInTheDocument();
    expect(screen.getByText("billing")).toBeInTheDocument();
  });

  it("creates a key and shows its one-time raw value", async () => {
    postMock().mockResolvedValue({
      data: { key: "sk-proj-xyz", prefix: "newprefix", label: "billing" },
      response: new Response(),
    });

    render(<ApiKeysView />);
    await screen.findByText("abcd1234");

    await userEvent.type(screen.getByLabelText("Label"), "billing");
    await userEvent.click(screen.getByRole("button", { name: /create key/i }));

    expect(await screen.findByRole("status")).toHaveTextContent("sk-proj-xyz");
  });

  it("revokes a key", async () => {
    postMock().mockResolvedValue({ response: new Response() });

    render(<ApiKeysView />);
    await screen.findByText("abcd1234");

    await userEvent.click(screen.getByRole("button", { name: /revoke/i }));

    await waitFor(() =>
      expect(postMock()).toHaveBeenCalledWith(
        "/api/v1/api-keys/{prefix}/revoke",
        expect.objectContaining({ params: { path: { prefix: "abcd1234" } } }),
      ),
    );
  });
});
