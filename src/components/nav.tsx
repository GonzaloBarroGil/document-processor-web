import { Link } from "react-router-dom";

import { useAuth } from "../auth/auth-context";

export function Nav() {
  const { user, logout } = useAuth();

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/documents">Documents</Link>
      <Link to="/review">Review</Link>
      {user?.role === "ADMIN" && <Link to="/api-keys">API Keys</Link>}
      <span>{user?.username ?? ""}</span>
      <button type="button" onClick={logout}>
        Sign out
      </button>
    </nav>
  );
}
