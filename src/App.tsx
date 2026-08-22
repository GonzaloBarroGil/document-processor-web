import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/auth-provider";
import { LoginView } from "./auth/login-view";
import { RequireAuth } from "./auth/require-auth";
import { AppLayout } from "./components/app-layout";
import { DocumentDetailView } from "./features/documents/document-detail-view";
import { DocumentListView } from "./features/documents/document-list-view";

function Dashboard() {
  return <h2>Dashboard</h2>;
}

function Review() {
  return <h2>Review</h2>;
}

function ApiKeys() {
  return <h2>API Keys</h2>;
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="documents" element={<DocumentListView />} />
              <Route path="documents/:documentId" element={<DocumentDetailView />} />
              <Route path="review" element={<Review />} />
            </Route>
          </Route>
          <Route element={<RequireAuth adminOnly />}>
            <Route element={<AppLayout />}>
              <Route path="api-keys" element={<ApiKeys />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
