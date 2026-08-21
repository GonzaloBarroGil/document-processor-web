import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
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
import { AuthProvider } from "./auth-provider";
import { RequireAuth } from "./require-auth";

function renderRoute(initialPath: string, adminOnly = false) {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<p>login page</p>} />
          <Route path="/" element={<p>home</p>} />
          <Route element={<RequireAuth adminOnly={adminOnly} />}>
            <Route path="/protected" element={<p>protected content</p>} />
          </Route>
        </Routes>
      </AuthProvider>
    </MemoryRouter>,
  );
}

describe("RequireAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users to the login page", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(false);

    renderRoute("/protected");

    expect(await screen.findByText("login page")).toBeInTheDocument();
  });

  it("renders protected content for an authenticated user", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      username: "alice",
      role: "REVIEWER",
    });

    renderRoute("/protected");

    expect(await screen.findByText("protected content")).toBeInTheDocument();
  });

  it("redirects non-admins away from admin-only routes", async () => {
    vi.mocked(isAuthenticated).mockReturnValue(true);
    vi.mocked(getCurrentUser).mockResolvedValue({
      id: "1",
      username: "alice",
      role: "REVIEWER",
    });

    renderRoute("/protected", true);

    expect(await screen.findByText("home")).toBeInTheDocument();
  });
});
