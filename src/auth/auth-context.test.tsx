import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./auth")>();
  return {
    ...actual,
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  };
});

import { getCurrentUser, isAuthenticated } from "./auth";
import { useAuth } from "./auth-context";
import { AuthProvider } from "./auth-provider";

function Consumer() {
  const { user, loading } = useAuth();
  if (loading) {
    return <p>loading</p>;
  }
  if (user === null) {
    return <p>anonymous</p>;
  }
  return <p>{user.username}</p>;
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the current user when a session exists", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      username: "alice",
      role: "REVIEWER",
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(await screen.findByText("alice")).toBeInTheDocument();
  });

  it("stays anonymous when there is no session", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(false);

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    );

    expect(await screen.findByText("anonymous")).toBeInTheDocument();
  });
});
