import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

import ProtectedRoute from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import AddPage from "./pages/AddPage";
import ShowPageBOH from "./pages/ShowPageBOH";
import ShowPageFOH from "./pages/ShowPageFOH";

export default function AppRoutes() {
  const user = useAuth(); // NOW it works correctly

  return (
    <Routes>

      {/* Public */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected */}
      <Route
        path="/add"
        element={
          <ProtectedRoute>
            <AddPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/showBOH"
        element={
          <ProtectedRoute>
            <ShowPageBOH />
          </ProtectedRoute>
        }
      />

      <Route
        path="/showFOH"
        element={
          <ProtectedRoute>
            <ShowPageFOH />
          </ProtectedRoute>
        }
      />

      {/* DEFAULT REDIRECT */}
      <Route
        path="*"
        element={
          user ? (
            user.role === "FOH" ? (
              <Navigate to="/add" replace />
            ) : (
              <Navigate to="/showBOH" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

    </Routes>
  );
}
