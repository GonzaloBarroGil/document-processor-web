import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/auth-provider";
import { LoginView } from "./auth/login-view";
import { RequireAuth } from "./auth/require-auth";
import { AppLayout } from "./components/app-layout";
import { ApiKeysView } from "./features/api-keys/api-keys-view";
import { DashboardView } from "./features/dashboard/dashboard-view";
import { DocumentDetailView } from "./features/documents/document-detail-view";
import { DocumentListView } from "./features/documents/document-list-view";
import { ReviewEditorView } from "./features/review/review-editor-view";
import { ReviewQueueView } from "./features/review/review-queue-view";

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginView />} />
          <Route element={<RequireAuth />}>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardView />} />
              <Route path="documents" element={<DocumentListView />} />
              <Route path="documents/:documentId" element={<DocumentDetailView />} />
              <Route path="review" element={<ReviewQueueView />} />
              <Route path="review/:documentId" element={<ReviewEditorView />} />
            </Route>
          </Route>
          <Route element={<RequireAuth adminOnly />}>
            <Route element={<AppLayout />}>
              <Route path="api-keys" element={<ApiKeysView />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
