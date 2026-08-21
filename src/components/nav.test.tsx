import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../auth/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../auth/auth")>();
  return {
    ...actual,
    isAuthenticated: vi.fn(),
    getCurrentUser: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
  };
});

import { getCurrentUser, isAuthenticated } from "../auth/auth";
import { AuthProvider } from "../auth/auth-provider";
import { Nav } from "./nav";

function renderNav() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <Nav />
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("Nav", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(isAuthenticated).mockReturnValue(true);
  });

  it("shows the API Keys link for admins", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      username: "alice",
      role: "ADMIN",
    });

    renderNav();

    expect(await screen.findByText("API Keys")).toBeInTheDocument();
  });

  it("hides the API Keys link for reviewers", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      username: "bob",
      role: "REVIEWER",
    });

    renderNav();

    expect(await screen.findByText("bob")).toBeInTheDocument();
    expect(screen.queryByText("API Keys")).not.toBeInTheDocument();
  });
});
